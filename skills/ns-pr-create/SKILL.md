---
name: ns-pr-create
description: "[PR Lifecycle — Create] Creates a well-formed GitHub pull request for an SDF feature branch. Inspects the diff, flags SDF anti-patterns, and generates a NetSuite-aware description."
---

# NS PR Create

## Context

Workspace mode: read `PLAN.md` for the project code (sets the title `[Area]`) and `ci/setup-complete.json` for `branchModel` + `environments` (sets the deployment target). Standalone (neither present): get the `[Area]` and target environment from the user, or infer from the branch name. Don't ask for what these files already answer.

---

## Diff Categories

Split `git diff --name-only <base>...HEAD` into:

| Category | Pattern |
|---|---|
| SuiteScript | `SuiteScripts/**/*.js` |
| Object XML | `Objects/**/*.xml` — note object type (CustomRecord, WorkflowAction, etc.) |
| Manifest | `manifest.xml` — carries feature/dependency declarations |
| CI / config | `ci/**`, `.github/**` |

---

## Paired-Change Check

If `Objects/**/*.xml` contains a **new file** (not a modification), verify both of these are also in the diff:

- `OBJECT_OWNERSHIP.md` — new object must be declared as SDF-owned or UI-owned
- `ci/objects-manifest.json` — new SDF-owned object must be listed for drift detection

If either is missing, warn before generating the PR body. These three always move together when a new SDF object is introduced.

> `ci/objects-manifest.json` is committed source control (not gitignored) — it is always correct to include it in a PR.

---

## SDF Anti-Pattern Flags

Stop and warn before generating the PR if any of these appear in the diff:

| File | Risk |
|---|---|
| `deploy.xml` | Environment-specific; must be gitignored — breaks other devs if committed |
| `client.properties` | Contains OAuth credentials |
| `*.pem` | Private key |
| `manifest.xml` | Feature flag changes can break deploys to accounts missing that feature |

---

## PR Title Format

`[Area] Imperative description (CUST-XX-NN if applicable)`

e.g. `[O2C] Add approval validation to Sales Order UE`

`[Area]` is the project/functional code — from `PLAN.md` in workspace mode; ask in standalone mode.

---

## PR Body

Use [assets/pr-body-template.md](assets/pr-body-template.md). Pre-fill from the diff:
- Summarise each changed SuiteScript and Object XML (infer from filename + diff context)
- Set the deployment target by mapping the base branch through `ci/setup-complete.json` (`branchModel` + `environments`) — the same mapping `ns-pr-merge` uses

Show the generated title + body to the user and wait for confirmation before creating the PR.

---

## Reference

| Topic | File |
|---|---|
| PR body template | [assets/pr-body-template.md](assets/pr-body-template.md) |
| Deploy strategy & branch→environment map | `ci/setup-complete.json` (project root, if present) |
| Project code, tier, current phase | `PLAN.md` (project root, if present) |
| Object ownership | `OBJECT_OWNERSHIP.md` (project root, if present) |
