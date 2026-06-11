# deploy.xml Strategy Comparison

`deploy.xml` is the file that tells SuiteCloud CLI what to deploy to a NetSuite account and in what order. It is the most common source of merge conflicts and silent deployment problems in multi-developer SDF teams. This document compares the four known strategies for managing it.

---

## The Problem

SDF IDEs (VS Code extension, WebStorm plugin) auto-regenerate `deploy.xml` from your local filesystem state whenever you use the IDE to add or import objects. Every developer's local state differs. Without coordination:

- **No branches:** every commit overwrites the previous developer's `deploy.xml`
- **With branches:** every PR produces a merge conflict on `deploy.xml`
- **Wildcard:** no conflicts, but every deploy touches every object — slow and risky

---

## Strategy A — Wildcard Deploy-All

Commit `deploy.xml` with wildcard paths so all developers always have an identical version.

```xml
<deploy>
  <files>
    <path>~/FileCabinet/SuiteScripts/*</path>
  </files>
  <objects>
    <path>~/Objects/*</path>
  </objects>
</deploy>
```

**Pros:**
- Zero setup effort — works out of the box
- No merge conflicts — all developers have the same file
- Simple mental model

**Cons:**
- Every deploy deploys everything, even unchanged objects — can be slow with 50+ objects
- Risk: deploys objects from other developers' WIP branches
- Risk: redeploys things that shouldn't move yet
- Incompatible with drift detection — you always overwrite the account

**Best for:** SDF-only teams of 1–2 developers, projects with fewer than 30 objects.

**Not suitable for:** Mixed teams (SDF + UI configurators); large projects; teams that want selective deployments.

---

## Strategy B — Gitignore + Dynamic Generation (Recommended)

Remove `deploy.xml` from Git entirely. Generate it at CI time using `ci/generate-deploy.js`, which diffs the current branch against the target branch and includes only changed files.

**Setup steps:**
1. Add `deploy.xml` to `.gitignore`
2. If already tracked: `git rm --cached deploy.xml`
3. Copy `scripts/generate-deploy.js` to `ci/generate-deploy.js` in the project
4. In the GitHub Actions workflow, run `node ci/generate-deploy.js origin/main` before the deploy step

**Pros:**
- Zero merge conflicts — `deploy.xml` is never in Git
- Fast, targeted deployments — only changed objects are deployed
- Compatible with drift detection
- Every PR deploy is a precise diff of that PR's changes

**Cons:**
- Requires CI pipeline — not usable for manual local deploys without an extra step
- Deleted files cannot be "undeployed" via SDF automatically
  - Workaround for scripts: set `isDeployed=false` in the script deployment XML, redeploy
  - Workaround for objects: manual deletion in the NetSuite UI
- Shallow git clones may break the diff — use `fetch-depth: 0` in GitHub Actions checkout step
- First deployment after a new project creation needs the fallback (deploy-all)

**Local developer workflow with Strategy B:**
```bash
# Option 1 — use the wildcard manually for local deploys
echo '<deploy><files><path>~/FileCabinet/SuiteScripts/*</path></files><objects><path>~/Objects/*</path></objects></deploy>' > deploy.xml
suitecloud project:deploy
# deploy.xml will not be committed because it is gitignored

# Option 2 — generate locally
node ci/generate-deploy.js origin/main
suitecloud project:deploy
```

**Best for:** Any team with 3+ developers; any project with 30+ objects; mixed teams.

---

## Strategy C — Project Segmentation

Split the monolithic SDF project into multiple smaller SDF projects, one per team or functional area. Each project has its own `deploy.xml` (using Strategy B internally). Teams own separate projects and have no collision.

```
repo/
├── project-order-management/   ← Team A: O2C customizations
│   ├── manifest.xml
│   ├── Objects/
│   └── ci/generate-deploy.js
├── project-inventory/          ← Team B: Inventory customizations
│   ├── manifest.xml
│   ├── Objects/
│   └── ci/generate-deploy.js
└── project-shared-utils/       ← Shared scripts used by both
    ├── manifest.xml
    └── FileCabinet/SuiteScripts/shared/
```

**How cross-project dependencies work:**

If `project-order-management` needs a custom record defined in `project-shared-utils`, declare it as a dependency in `project-order-management/manifest.xml`:

```xml
<dependencies>
  <objects>
    <object>customrecord_shared_lookup</object>
  </objects>
</dependencies>
```

`project-shared-utils` must be deployed first. Deployment order is a team coordination concern.

**Pros:**
- Zero cross-team collision
- Clear ownership — each team fully controls their project
- Easy rollback: each project can be reverted independently
- Faster CI — each project only deploys its own changed objects

**Cons:**
- More projects to manage
- Cross-project dependencies must be explicit in `manifest.xml`
- Requires coordination for shared utilities
- GitHub Actions workflows needed per project (or use a matrix workflow)
- Initial setup is more complex

**Best for:** Large teams (5+ developers), multi-team implementations, projects with clear functional boundaries between teams.

**Not suitable for:** Small projects; tight interdependencies between areas.

---

## Strategy D — Template + Generated

Maintain a `manifest.tpl.xml` as the source of truth. A CI script generates both the actual `manifest.xml` and `deploy.xml` at pipeline time by comparing branches.

```bash
npm run generate-manifests --headbranch=main --sourcebranch=dev
```

This is the approach used by the [devnetkc/NetSuite-CustomModules-Template](https://github.com/devnetkc/NetSuite-CustomModules-Template) project with Azure Pipelines.

**Pros:**
- Full automation of both manifest and deploy files
- Consistent with a template-first workflow

**Cons:**
- Additional build tooling required
- Less transparent than Strategy B — harder to debug what is being deployed
- Community tooling; not officially supported by Oracle

**Best for:** Teams already using Azure DevOps with a devnetkc-style setup.

---

## Decision Matrix

| Factor | A | B | C | D |
|---|:---:|:---:|:---:|:---:|
| Zero merge conflicts | ✅ | ✅ | ✅ | ✅ |
| Selective deployments (only what changed) | ❌ | ✅ | ✅ | ✅ |
| Works without CI pipeline | ✅ | ⚠️ | ⚠️ | ❌ |
| Mixed team safe (UI configurators + SDF) | ❌ | ✅ | ✅ | ✅ |
| Supports drift detection | ❌ | ✅ | ✅ | ✅ |
| Multiple team areas without collision | ❌ | ⚠️ | ✅ | ⚠️ |
| Setup effort | Low | Medium | High | High |
| Community adoption | High | High | Medium | Low |

---

## What Happens to Deleted Files

SDF cannot delete objects from a NetSuite account — it can only create or update. This limitation applies to all four strategies.

**For deleted scripts:**
1. Before deleting the script file from Git, update its deployment XML object: set `<isdeployed>F</isdeployed>`
2. Commit and deploy — this removes the script deployment from the account
3. After that deploy, remove the script and its deployment XML from the project

**For deleted non-script objects (fields, records):**
1. SDF cannot remove them from the account
2. Manual deletion required in the NetSuite UI
3. Remove the XML file from the project and commit

This applies regardless of which deploy.xml strategy you use.
