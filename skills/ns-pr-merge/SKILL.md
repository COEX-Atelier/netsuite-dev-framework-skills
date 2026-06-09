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

State this explicitly before merging — it is not obvious to the developer which NetSuite environment is affected:

| Base branch | Environment | Approval gate |
|---|---|---|
| `develop` | Sandbox | None — CI auto-triggers |
| `main` | Production | Workflow approval gate required |
| `release/*` | Staging / UAT | Check `ci/setup-complete.json` |

Override from `ci/setup-complete.json` if present.

---

## Merge Strategy

| Branch pattern | Strategy | Reason |
|---|---|---|
| `feature/*` → `develop` | Squash | Linear history on develop |
| `fix/*`, `bugfix/*` → `develop` | Squash | Same |
| `develop` → `main` | Merge commit | Preserve full develop history in main |
| `hotfix/*` → `main` | Squash | Then backmerge to develop |
| `release/*` → `main` | Merge commit | Same as develop → main |

---

## Post-Merge

- **Hotfix**: remind to backmerge to `develop`
- **Release**: prompt to run `ns-release` for tagging + changelog
- Monitor the triggered CI run and report deploy outcome; on failure redirect to `ns-pr-diagnose`
