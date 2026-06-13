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

/** Read a top-level `key:` value from a frontmatter block (handles quotes). */
function readField(block, key) {
  const re = new RegExp(`^${key}:\\s*(.*)$`, 'm');
  const m = re.exec(block);
  if (!m) return null;
  let value = m[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
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
  for (const file of skillFiles) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const block = extractFrontmatter(content);
    if (block === null) {
      errors.push(`${rel}: missing YAML frontmatter (--- ... ---)`);
      continue;
    }
    const name = readField(block, 'name');
    const description = readField(block, 'description');
    if (!name) errors.push(`${rel}: frontmatter is missing a non-empty 'name'`);
    if (!description)
      errors.push(`${rel}: frontmatter is missing a non-empty 'description'`);
    const dirName = path.basename(path.dirname(file));
    if (name && name !== dirName) {
      errors.push(
        `${rel}: frontmatter name '${name}' does not match directory '${dirName}'`
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

module.exports = { validate, slugify, headingSlugs };

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
