#!/usr/bin/env node
'use strict';

/**
 * Tests for the skill validator.
 *
 * Builds throwaway skill trees in a temp dir and asserts that the validator
 * accepts a well-formed tree and rejects each class of defect — most
 * importantly a deliberately broken cross-reference (the #22 bug class, and an
 * explicit acceptance criterion of #46).
 *
 * Pure Node, no dependencies. Run with: node scripts/test-validate-skills.js
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('node:assert');
const { test } = require('node:test');

const { validate, slugify } = require('./validate-skills.js');

/** Materialise a { 'rel/path': 'contents' } map into a fresh temp root. */
function scaffold(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-validate-'));
  for (const [rel, contents] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
  return root;
}

const goodSkill = [
  '---',
  'name: ns-demo',
  'description: "A valid demo skill used by the validator tests."',
  '---',
  '',
  '# NS Demo',
  '',
  'See [the guide](references/guide.md#step-one) for details.',
].join('\n');

test('accepts a well-formed skill tree', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': goodSkill,
    'skills/cat/ns-demo/references/guide.md': '# Step One\n\nBody.\n',
  });
  assert.deepStrictEqual(validate(root), []);
});

test('rejects a deliberately broken cross-reference', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': goodSkill.replace(
      'references/guide.md#step-one',
      'references/missing.md'
    ),
  });
  const errors = validate(root);
  assert.ok(
    errors.some((e) => e.includes('missing.md')),
    `expected a broken-link error, got: ${JSON.stringify(errors)}`
  );
});

test('rejects a link to a non-existent heading anchor', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': goodSkill.replace('#step-one', '#nope'),
    'skills/cat/ns-demo/references/guide.md': '# Step One\n',
  });
  const errors = validate(root);
  assert.ok(
    errors.some((e) => e.includes('heading that does not exist')),
    `expected an anchor error, got: ${JSON.stringify(errors)}`
  );
});

test('rejects missing frontmatter', () => {
  const root = scaffold({ 'skills/cat/ns-demo/SKILL.md': '# No frontmatter\n' });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('missing YAML frontmatter')));
});

test('rejects an empty description', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': '---\nname: ns-demo\ndescription: ""\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes("non-empty 'description'")));
});

test('rejects a name that does not match its directory', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md':
      '---\nname: ns-other\ndescription: "x"\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('does not match directory')));
});

test('rejects invalid JSON assets', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': '---\nname: ns-demo\ndescription: "x"\n---\n# X\n',
    'skills/cat/ns-demo/assets/broken.json': '{ not: valid }',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('invalid JSON')));
});

test('rejects a description over the npx skills 500-char max', () => {
  const longDesc = 'x'.repeat(501);
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': `---\nname: ns-demo\ndescription: "${longDesc}"\n---\n# X\n`,
  });
  const errors = validate(root);
  assert.ok(
    errors.some((e) => e.includes('501 chars') && e.includes('max is 500')),
    `expected a max-length error, got: ${JSON.stringify(errors)}`
  );
});

test('rejects a description under the npx skills 20-char min', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md': '---\nname: ns-demo\ndescription: "too short"\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('min is 20')));
});

test('rejects a non-kebab-case name', () => {
  const root = scaffold({
    'skills/cat/Ns_Demo/SKILL.md':
      '---\nname: Ns_Demo\ndescription: "A long enough valid description string here."\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('not kebab-case')));
});

test('rejects a name over 64 chars', () => {
  const longName = 'a'.repeat(65);
  const root = scaffold({
    [`skills/cat/${longName}/SKILL.md`]: `---\nname: ${longName}\ndescription: "A long enough valid description string here."\n---\n# X\n`,
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('max is 64')));
});

test('rejects an unquoted description that npx skills would silently drop', () => {
  // Leading "[" is a YAML flow indicator — exactly our "[Phase N] ..." style,
  // which must be quoted or the skill vanishes from discovery.
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md':
      '---\nname: ns-demo\ndescription: [Phase 3] Build configuration objects for the account\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(
    errors.some((e) => e.includes('would drop this skill')),
    `expected a YAML-drop error, got: ${JSON.stringify(errors)}`
  );
});

test('rejects an unquoted description with a colon-space', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md':
      '---\nname: ns-demo\ndescription: Use this skill when flags: --all or --deep are passed\n---\n# X\n',
  });
  const errors = validate(root);
  assert.ok(errors.some((e) => e.includes('colon followed by a space')));
});

test('accepts a properly quoted description containing colons and brackets', () => {
  const root = scaffold({
    'skills/cat/ns-demo/SKILL.md':
      '---\nname: ns-demo\ndescription: "[Phase 3] Build phase: configure forms, roles, and searches in the account."\n---\n# X\n',
  });
  assert.deepStrictEqual(validate(root), []);
});

test('slugify matches GitHub heading anchors', () => {
  assert.strictEqual(slugify('2. Phase folders — Tier 1 & 2'), '2-phase-folders--tier-1--2');
  assert.strictEqual(slugify('Step A — go'), 'step-a--go');
});
