#!/usr/bin/env node
/**
 * generate-deploy.js
 *
 * Generates deploy.xml by diffing the current branch against a target branch.
 * Only files that changed are included — preventing full-project deploys on
 * every merge and eliminating deploy.xml merge conflicts in multi-developer teams.
 *
 * Usage:
 *   node ci/generate-deploy.js [targetRef]
 *
 * targetRef defaults to TARGET_BRANCH env var, then origin/main.
 * In GitHub Actions, pass the base ref: node ci/generate-deploy.js origin/main
 *
 * Outputs: deploy.xml at the project root (gitignored).
 * Falls back to deploy-all wildcard if the diff cannot be computed.
 */

'use strict';

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

const targetRef = process.argv[2] || process.env.TARGET_BRANCH || 'origin/main';

// ── 1. Compute the diff ──────────────────────────────────────────────────────

let changedFiles = [];

try {
  const raw = execSync(`git diff --name-only --diff-filter=ACMR ${targetRef}...HEAD`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  changedFiles = raw.split('\n').filter(Boolean);
  console.log(`[generate-deploy] Diffing against ${targetRef} — ${changedFiles.length} changed files.`);
} catch (err) {
  // diff failed (e.g., first push, shallow clone, or bad ref) — fall back to all
  console.warn(`[generate-deploy] Could not diff against "${targetRef}": ${err.message}`);
  console.warn('[generate-deploy] Falling back to deploy-all wildcard.');
  writeFallback();
  process.exit(0);
}

// ── 2. Separate into FileCabinet files and Objects ───────────────────────────

const fileCabinetPaths = changedFiles
  .filter(f => f.startsWith('FileCabinet/') && !f.endsWith('/'))
  .map(f => `    <path>~/${f}</path>`);

const objectPaths = changedFiles
  .filter(f => f.startsWith('Objects/') && f.endsWith('.xml'))
  .map(f => `    <path>~/${f}</path>`);

// Deleted files cannot be "undeployed" via SDF — skip them and warn.
const allSdfFiles = [...changedFiles.filter(f =>
  f.startsWith('FileCabinet/') || (f.startsWith('Objects/') && f.endsWith('.xml'))
)];

const deletedResult = spawnSync('git', ['diff', '--name-only', '--diff-filter=D', `${targetRef}...HEAD`], {
  encoding: 'utf8',
});
const deletedSdf = deletedResult.status === 0
  ? (deletedResult.stdout || '')
      .split('\n')
      .filter(f => f.startsWith('FileCabinet/') || (f.startsWith('Objects/') && f.endsWith('.xml')))
  : [];

if (deletedSdf.length > 0) {
  console.warn('[generate-deploy] WARNING: The following files were deleted from Git but cannot');
  console.warn('  be automatically removed from NetSuite via SDF:');
  deletedSdf.forEach(f => console.warn(`  - ${f}`));
  console.warn('  For scripts: open the script deployment XML, set isDeployed=false, and redeploy.');
  console.warn('  For objects: manual deletion required in the NetSuite UI.');
}

// ── 3. Handle no SDF changes ─────────────────────────────────────────────────

if (fileCabinetPaths.length === 0 && objectPaths.length === 0) {
  console.log('[generate-deploy] No SDF files changed. Writing deploy-all fallback.');
  writeFallback();
  process.exit(0);
}

// ── 4. Write deploy.xml ──────────────────────────────────────────────────────

const sections = [];

if (fileCabinetPaths.length > 0) {
  sections.push(`  <files>\n${fileCabinetPaths.join('\n')}\n  </files>`);
}

if (objectPaths.length > 0) {
  sections.push(`  <objects>\n${objectPaths.join('\n')}\n  </objects>`);
}

const xml = `<deploy>\n${sections.join('\n')}\n</deploy>\n`;
fs.writeFileSync('deploy.xml', xml, 'utf8');

console.log(`[generate-deploy] deploy.xml written.`);
console.log(`  FileCabinet entries : ${fileCabinetPaths.length}`);
console.log(`  Object entries      : ${objectPaths.length}`);

// ── Helper ───────────────────────────────────────────────────────────────────

function writeFallback() {
  const xml = `<deploy>
  <files>
    <path>~/FileCabinet/SuiteScripts/*</path>
  </files>
  <objects>
    <path>~/Objects/*</path>
  </objects>
</deploy>
`;
  fs.writeFileSync('deploy.xml', xml, 'utf8');
  console.log('[generate-deploy] deploy.xml written (deploy-all fallback).');
}
