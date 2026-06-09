#!/usr/bin/env node
/**
 * check-drift.js
 *
 * Pre-deploy safety check for mixed teams (SDF developers + NetSuite UI configurators).
 *
 * Imports SDF-owned objects from the connected NetSuite account into the local
 * Objects/ folder, then checks git diff. If the account has diverged from source
 * control (someone edited an object in the UI without committing), the pipeline
 * fails so the team can decide whether to commit or revert before deploying.
 *
 * Without this check, SDF deploy will silently overwrite any UI changes.
 *
 * Prerequisites:
 *   - suitecloud CLI installed: npm install -g @oracle/suitecloud-cli
 *   - Auth configured: suitecloud account:setup:ci (run earlier in pipeline)
 *   - ci/objects-manifest.json populated (created by ns-sdf-github-setup skill)
 *
 * Usage:
 *   node ci/check-drift.js [--authid <authid>]
 *
 * Exits 0 — no drift detected, safe to deploy.
 * Exits 1 — drift detected, pipeline should fail.
 * Exits 2 — import error (connectivity or auth problem).
 */

'use strict';

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const authidIndex = args.indexOf('--authid');
const authid = authidIndex !== -1 ? args[authidIndex + 1] : (process.env.NS_AUTH_ID || 'ci-deploy');

// ── Load manifest ─────────────────────────────────────────────────────────────

const manifestPath = path.resolve('ci/objects-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.log('[check-drift] ci/objects-manifest.json not found. Skipping drift check.');
  console.log('  To enable drift detection, create ci/objects-manifest.json with your SDF-owned objects.');
  process.exit(0);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error(`[check-drift] Failed to parse ci/objects-manifest.json: ${e.message}`);
  process.exit(2);
}

if (!manifest.objects || manifest.objects.length === 0) {
  console.log('[check-drift] ci/objects-manifest.json has no objects. Skipping drift check.');
  process.exit(0);
}

// ── Group by type for batch imports ──────────────────────────────────────────

const byType = {};
for (const obj of manifest.objects) {
  if (!byType[obj.type]) byType[obj.type] = [];
  byType[obj.type].push(obj.scriptid);
}

const totalObjects = manifest.objects.length;
const totalTypes = Object.keys(byType).length;
console.log(`[check-drift] Importing ${totalObjects} SDF-owned objects (${totalTypes} types) from account "${authid}"...`);

// ── Import each type from the account ────────────────────────────────────────

for (const [type, scriptids] of Object.entries(byType)) {
  const cmd = [
    'suitecloud', 'object:import',
    '--type', type,
    '--scriptids', scriptids.join(','),
    '--destinationfolder', 'Objects',
    '--authid', authid,
    '--overridetype', 'OVERWRITE',
  ];

  console.log(`  [${type}] importing ${scriptids.length} object(s)...`);

  const result = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', stdio: 'pipe' });

  if (result.status !== 0) {
    const errMsg = result.stderr || result.stdout || 'unknown error';
    console.error(`[check-drift] Import failed for type "${type}": ${errMsg.trim()}`);
    console.error('  Possible causes: auth not configured, object does not exist in target account, network error.');
    process.exit(2);
  }
}

// ── Check for drift using git diff ───────────────────────────────────────────

const diffResult = spawnSync('git', ['diff', '--name-only', 'Objects/'], { encoding: 'utf8' });
const driftedFiles = (diffResult.stdout || '').trim().split('\n').filter(Boolean);

if (driftedFiles.length === 0) {
  console.log('[check-drift] No drift detected. The account matches source control.');
  process.exit(0);
}

// ── Drift found — report and fail ────────────────────────────────────────────

console.error('\n[check-drift] ── DRIFT DETECTED ──────────────────────────────────────────');
console.error(`  ${driftedFiles.length} SDF-owned object(s) differ between the NetSuite account and Git:\n`);
driftedFiles.forEach(f => console.error(`    • ${f}`));

console.error(`
  The account has changes that are NOT in source control.
  This typically means someone edited an object directly in the NetSuite UI.

  Resolve before deploying:

  Option A — Commit the UI changes (if they were intentional):
    git add Objects/
    git commit -m "sync: import UI changes for [describe what changed]"
    git push
    Re-run the pipeline after pushing.

  Option B — Revert the UI changes (if they were accidental):
    Manually restore the original values in the NetSuite UI,
    then re-run this pipeline.

  To see the full diff:
    git diff Objects/
`);

process.exit(1);
