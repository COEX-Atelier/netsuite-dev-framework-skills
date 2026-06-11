---
name: ns-pr-diagnose
description: "[PR Lifecycle — Diagnose] Diagnoses why a pull request cannot merge. Classifies the blocker — merge conflict, CI failure, or branch protection — and routes to the specialist skill that resolves it."
---

# NS PR Diagnose

Pre-merge triage: "why can't this PR merge?" Classifies the blocker and routes to the specialist that fixes it. Stop at the first confirmed blocker.

---

## Blocker Classification Order

1. **Merge conflicts** → classify conflicting files (below); hand XML conflicts to `ns-conflict-resolve`
2. **CI failing** → hand off to `ns-ci-diagnose` (drills into the run: one cause, one fix)
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

## Escalation Rules

- XML conflicts → always `ns-conflict-resolve`, never inline
- CI failures → always `ns-ci-diagnose`, never match patterns inline
- Base is `main` → flag explicitly before advising any unblock action

---

## Reference

| Topic | File |
|---|---|
| CI run diagnosis (one cause, one fix) | `ns-ci-diagnose` |
| SDF XML conflict resolution | `ns-conflict-resolve` |
