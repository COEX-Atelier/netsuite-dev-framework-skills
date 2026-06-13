#!/usr/bin/env node
'use strict';

/**
 * Skill repository validator.
 *
 * Runs three dependency-free checks over the `skills/` tree:
 *
 *   1. Frontmatter   — every skill's SKILL.md has YAML frontmatter with a
 *                      non-empty `name` and `description`, and `name` matches the
 *                      skill's directory name.
 *   2. Cross-refs    — relative links between markdown files (and to assets,
 *                      scripts, references) resolve to real files, and intra-doc
 *                      `#section` anchors resolve to real headings. This catches
 *                      the broken cross-reference class of bug from #22.
 *   3. JSON          — every committed `*.json` asset/template parses.
 *
 * Usage:
 *   node scripts/validate-skills.js [rootDir]
 *
 * Exits non-zero (and prints each problem) when any check fails. Also exported
 * as a function so it can be driven against fixtures from a test harness.
 */

const fs = require('fs');
const path = require('path');

/** Recursively collect files under `dir` matching `predicate`. */
function walk(dir, predicate, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, acc);
    } else if (predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}

/** Extract the leading `---\n ... \n---` frontmatter block, or null. */
function extractFrontmatter(content) {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  return match ? match[1] : null;
}

/** Read the raw (still-quoted) single-line value for `key:` from a block. */
function readRawField(block, key) {
  const re = new RegExp(`^${key}:\\s*(.*)$`, 'm');
  const m = re.exec(block);
  return m ? m[1].trim() : null;
}

/** Strip a single layer of matching surrounding quotes. */
function unquote(value) {
  if (
    value &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) &&
    value.length >= 2
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Read a top-level `key:` value from a frontmatter block (handles quotes). */
function readField(block, key) {
  const raw = readRawField(block, key);
  return raw === null ? null : unquote(raw);
}

// Limits enforced by `npx skills` (vercel-labs/skills `skills validate`).
const NAME_MAX = 64;
const NAME_KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 500;

/**
 * Detect frontmatter string values that the `npx skills` YAML parser silently
 * rejects (issue #1094: a skill with unparseable frontmatter is dropped from
 * discovery with no error). Returns a problem description, or null if safe.
 *
 * Quoted values are safe as long as the quote layer is well-formed. An unquoted
 * plain scalar is unsafe if it begins with a YAML indicator (e.g. the leading
 * `[` in our `[Phase 3] …` descriptions) or contains a `: ` / ` #` sequence.
 */
function yamlScalarProblem(raw) {
  if (raw === null || raw === '') return null; // emptiness handled separately
  const first = raw[0];
  const dq = first === '"' && raw.endsWith('"') && raw.length >= 2;
  const sq = first === "'" && raw.endsWith("'") && raw.length >= 2;
  if (dq) {
    const inner = raw.slice(1, -1);
    if (/(^|[^\\])"/.test(inner)) {
      return 'has an unescaped double-quote inside a double-quoted value (escape it as \\")';
    }
    return null;
  }
  if (sq) {
    const inner = raw.slice(1, -1);
    if (/(^|[^'])'(?!')/.test(inner)) {
      return "has an unescaped single-quote inside a single-quoted value (double it as '')";
    }
    return null;
  }
  // Unquoted plain scalar.
  if (/^[!&*?|>%@`"'#,[\]{}]/.test(raw)) {
    return `is unquoted and starts with the YAML indicator '${first}' — wrap it in double quotes`;
  }
  if (raw.startsWith('- ')) {
    return "is unquoted and starts with '- ' — wrap it in double quotes";
  }
  if (/:(\s|$)/.test(raw)) {
    return "is unquoted and contains a colon followed by a space — wrap it in double quotes";
  }
  if (/\s#/.test(raw)) {
    return "is unquoted and contains ' #' (read as a YAML comment) — wrap it in double quotes";
  }
  return null;
}

/** GitHub-style heading slug. */
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-'); // each space → one hyphen (GitHub does not collapse runs)
}

/** Collect the set of anchor slugs a markdown file exposes via its headings. */
function headingSlugs(content) {
  const slugs = new Set();
  const counts = new Map();
  for (const line of content.split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (!m) continue;
    const base = slugify(m[1].replace(/#+\s*$/, ''));
    // GitHub disambiguates repeats with -1, -2, ...
    if (counts.has(base)) {
      const n = counts.get(base) + 1;
      counts.set(base, n);
      slugs.add(`${base}-${n}`);
    } else {
      counts.set(base, 0);
      slugs.add(base);
    }
  }
  return slugs;
}

/** Should this link target be skipped (external, placeholder, anchor-only handled separately)? */
function isExternalOrPlaceholder(target) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return true; // http:, https:, mailto:, tel:, etc.
  if (target.startsWith('//')) return true;
  // Template/example placeholders rather than real paths.
  if (/[<>{}$*\s`]/.test(target)) return true;
  return false;
}

/**
 * Run all checks against `root`. Returns an array of human-readable error strings.
 */
function validate(root) {
  const errors = [];
  const skillsDir = path.join(root, 'skills');

  // --- Check 1: frontmatter ------------------------------------------------
  const skillFiles = walk(skillsDir, (f) => path.basename(f) === 'SKILL.md');
  const namesSeen = new Map(); // name -> [relative paths]
  for (const file of skillFiles) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const block = extractFrontmatter(content);
    if (block === null) {
      errors.push(`${rel}: missing YAML frontmatter (--- ... ---)`);
      continue;
    }
    const name = readField(block, 'name');
    if (name) {
      if (!namesSeen.has(name)) namesSeen.set(name, []);
      namesSeen.get(name).push(rel);
    }
    const rawDescription = readRawField(block, 'description');
    const description = readField(block, 'description');

    // name: non-empty, matches directory, ≤64 chars, kebab-case (npx skills).
    if (!name) {
      errors.push(`${rel}: frontmatter is missing a non-empty 'name'`);
    } else {
      const dirName = path.basename(path.dirname(file));
      if (name !== dirName) {
        errors.push(
          `${rel}: frontmatter name '${name}' does not match directory '${dirName}'`
        );
      }
      if (name.length > NAME_MAX) {
        errors.push(
          `${rel}: name is ${name.length} chars (npx skills max is ${NAME_MAX})`
        );
      }
      if (!NAME_KEBAB.test(name)) {
        errors.push(
          `${rel}: name '${name}' is not kebab-case (lowercase a-z, 0-9, single hyphens; required by npx skills)`
        );
      }
    }

    // description: non-empty, 20–500 chars, YAML-parseable by npx skills.
    if (!description) {
      errors.push(`${rel}: frontmatter is missing a non-empty 'description'`);
    } else {
      if (description.length < DESCRIPTION_MIN) {
        errors.push(
          `${rel}: description is ${description.length} chars (npx skills min is ${DESCRIPTION_MIN})`
        );
      }
      if (description.length > DESCRIPTION_MAX) {
        errors.push(
          `${rel}: description is ${description.length} chars (npx skills max is ${DESCRIPTION_MAX})`
        );
      }
    }
    const yamlProblem = yamlScalarProblem(rawDescription);
    if (yamlProblem) {
      errors.push(`${rel}: description ${yamlProblem} (npx skills would drop this skill)`);
    }
  }

  // npx skills keys skills by `name`, and walks skills/ both flat
  // (skills/<name>/) and one level deeper (skills/<category>/<name>/). Two
  // SKILL.md with the same name collide — the shallower one shadows the other.
  for (const [name, paths] of namesSeen) {
    if (paths.length > 1) {
      errors.push(
        `duplicate skill name '${name}' in ${paths.length} locations (npx skills keys by name; one will shadow the other): ${paths.join(', ')}`
      );
    }
  }

  // --- Check 2: cross-reference links --------------------------------------
  const mdFiles = walk(root, (f) => f.endsWith('.md'));
  const readmePath = path.join(root, 'README.md');
  if (fs.existsSync(readmePath) && !mdFiles.includes(readmePath)) {
    mdFiles.push(readmePath);
  }
  const slugCache = new Map();
  const getSlugs = (file) => {
    if (!slugCache.has(file)) {
      slugCache.set(file, headingSlugs(fs.readFileSync(file, 'utf8')));
    }
    return slugCache.get(file);
  };

  const linkRe = /\]\(\s*([^)]+?)\s*\)/g;
  for (const file of mdFiles) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = linkRe.exec(content)) !== null) {
      const raw = m[1].trim();
      // Strip an optional link title: [x](path "title")
      const target = raw.replace(/\s+["'].*$/, '');
      if (!target) continue;
      // Anchor-only links (#section) reference the current file; everything
      // external or templated is skipped.
      const isAnchorOnly = target.startsWith('#');
      if (!isAnchorOnly && isExternalOrPlaceholder(target)) continue;

      const hashIndex = target.indexOf('#');
      const pathPart = hashIndex === -1 ? target : target.slice(0, hashIndex);
      const anchor = hashIndex === -1 ? null : target.slice(hashIndex + 1);

      let targetFile = file;
      if (pathPart) {
        const resolved = path.resolve(path.dirname(file), pathPart);
        if (!fs.existsSync(resolved)) {
          errors.push(`${rel}: broken link target '${target}' (no such file)`);
          continue;
        }
        targetFile = resolved;
      }

      if (anchor) {
        if (targetFile.endsWith('.md') && fs.existsSync(targetFile)) {
          const slugs = getSlugs(targetFile);
          if (!slugs.has(anchor.toLowerCase())) {
            errors.push(
              `${rel}: link '${target}' points to a heading that does not exist`
            );
          }
        }
      }
    }
  }

  // --- Check 3: JSON parses ------------------------------------------------
  const jsonFiles = walk(skillsDir, (f) => f.endsWith('.json'));
  const lockFile = path.join(root, 'skills-lock.json');
  if (fs.existsSync(lockFile)) jsonFiles.push(lockFile);
  for (const file of jsonFiles) {
    const rel = path.relative(root, file);
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${rel}: invalid JSON (${e.message})`);
    }
  }

  return errors;
}

module.exports = {
  validate,
  slugify,
  headingSlugs,
  yamlScalarProblem,
  NAME_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
};

if (require.main === module) {
  const root = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(__dirname, '..');
  const errors = validate(root);
  if (errors.length) {
    console.error(`✗ Skill validation failed (${errors.length} problem(s)):\n`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  console.log('✓ Skill validation passed (frontmatter, cross-references, JSON).');
}
