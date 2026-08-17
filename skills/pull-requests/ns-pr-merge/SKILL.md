---
name: ns-pr-merge
description: "[PR Lifecycle — Merge] Safely merges a PR and confirms the downstream NetSuite deployment. Validates merge conditions, recommends the correct SDF branch strategy, and monitors the deploy pipeline."
---

# NS PR Merge

## Pre-Merge Gate (mandatory — block if any fails)

| Condition | If failed |
|---|---|
| CI green | Redirect to `ns-pr-diagnose` |
| No merge conflicts | Redirect to `ns-conflict-resolve` |
| Required reviewers approved | List who is missing |

---

## Deployment Target

State this explicitly before merging — it is not obvious to the developer which NetSuite environment is affected.

**Read `ci/setup-complete.json` first** (`productionGate`, `sandboxTrigger`) and cross-check the workflow's `on:` block. That file is authoritative; the table below is only the fallback when it is absent.

| Base branch | Environment | Approval gate |
|---|---|---|
| `develop` | Sandbox | None — CI auto-triggers |
| `main` | Production **only if `productionGate` is branch-based** | Workflow approval gate required |
| `release/*` | Staging / UAT | Check `ci/setup-complete.json` |

⚠️ **When `productionGate` is `version-tag (v*)`, merging into `main` deploys NOTHING.** `main` is validate-only; production ships when a `v*` tag is pushed (`ns-release`). Do not call a `develop` → `main` PR "the release" in that setup — it only brings `main` up to date so a tag can be cut from it. Say plainly: "ce merge ne déploie rien ; la prod part au tag `v*`."

**If neither `ci/setup-complete.json` nor a workflow file is reachable** (e.g. you are running from a project-management folder rather than the SDF repo), do **not** fall back to the table and assert an environment. Say the gate is unverified and ask, or read the repo first.

---

## Merge Strategy

| Branch pattern | Strategy | Reason |
|---|---|---|
| `feature/*` → `develop` | Squash | Linear history on develop |
| `fix/*`, `bugfix/*` → `develop` | Squash | Same |
| `develop` → `main` | Merge commit (or `--ff-only`) | Preserve full develop history in main |
| `hotfix/*` → `main` | Squash | Then backmerge to develop |
| `release/*` → `main` | Merge commit | Same as develop → main |

On a tag-gated project, `develop` → `main` is a **synchronisation**, not a deployment — see the warning above.

---

## Post-Merge

- **Hotfix**: remind to backmerge to `develop`
- **Release**: prompt to run `ns-release` for tagging + changelog
- Monitor the triggered CI run and report deploy outcome; on failure redirect to `ns-ci-diagnose`
