---
name: ns-pr-diagnose
description: "[PR Lifecycle — Diagnose] Diagnoses why a pull request cannot merge. Classifies blockers as merge conflicts, CI failures, or branch protection violations, with SDF-specific CI failure pattern matching."
---

# NS PR Diagnose

## Blocker Classification Order

Check in this order — stop at the first confirmed blocker:

1. **Merge conflicts** → classify conflicting files (see below), redirect XML conflicts to `ns-conflict-resolve`
2. **CI failures** → match log output against the SDF failure table below
3. **Branch protection** → list unmet required reviewers or status checks

---

## Conflict File Classification

| File type | Action |
|---|---|
| `Objects/*.xml` | Hand off to `ns-conflict-resolve` — do not resolve inline |
| `SuiteScripts/**/*.js` | Standard 3-way merge; check for governance guard duplication |
| `manifest.xml` | Take the superset of feature declarations |
| `ci/**`, `.github/**` | Keep the most recent pipeline version |

---

## SDF CI Failure Patterns

| Log pattern | Root cause | Fix |
|---|---|---|
| `invalid_client` / `INVALID_LOGIN_ATTEMPT` | OAuth cert mismatch or expired | Match `NS_CERTIFICATE_ID` secret to the Certificate ID on the NetSuite integration record; regenerate if expired |
| `base64: invalid input` | `NS_PRIVATE_KEY_B64` secret has line breaks | Re-encode: `base64 -w 0 key.pem` — result must be a single line |
| `INSUFFICIENT_PERMISSION` | CI role missing SDF permission | NetSuite → Manage Roles → CI role → Permissions → Setup → add **SuiteCloud Development Framework: Full** |
| `deploy.xml` in diff | `deploy.xml` committed | `git rm --cached deploy.xml` + add to `.gitignore` + push |
| Drift detection exit 1 | SDF-owned object edited in UI but not committed | Re-import with `suitecloud object:import` and commit, or revert the UI change |
| `project:validate` failed | XML syntax error or missing feature/object dependency | Run `suitecloud project:validate` locally; fix reported XML errors or add missing entries to `manifest.xml` |

Full catalogue: [references/ci-failure-patterns.md](references/ci-failure-patterns.md)

---

## Escalation Rules

- XML conflicts → always `ns-conflict-resolve`, never inline
- Unknown CI pattern → show first 20 error lines, ask user for context
- Base is `main` → flag explicitly before advising any unblock action
