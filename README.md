# NetSuite Dev Framework Skills

This repository collects reusable NetSuite-focused skills for planning, building, testing, and shipping SuiteCloud / SDF work.

The current gap in the repo is discoverability: there are many skills under `skills/`, but no top-level map explaining when to use each one or how they fit together. This README is meant to be that map.

## Repository Layout

Each skill lives in its own folder under `skills/<skill-name>/` and can include:

- `SKILL.md`: the skill's instructions and trigger conditions.
- `references/`: supporting guidance the skill reads when it needs deeper rules or examples.
- `assets/`: templates, checklists, sample files, and handoff artifacts.
- `scripts/`: helper automation used by the skill.
- `evals/`: evaluation data for the skill when applicable.

At the root, `skills-lock.json` tracks published skill metadata such as the source repo, skill entrypoint, and content hash.

## How The Workflow Fits Together

The skills are designed to mirror a practical NetSuite delivery lifecycle instead of acting like unrelated prompts.

### 1. Start and classify the project

- `ns-init-project`: classify the engagement by origin, scope, tier, and development environment.
- `ns-init-workspace`: scaffold or reconcile the working folder so the project has a consistent structure and `PLAN.md`.

### 2. Run the delivery phases

- `ns-erp-navigator`: orchestration hub for the overall implementation lifecycle and phase handoffs.
- `ns-solution-architect`: turn discovery outputs into NetSuite-specific designs and implementation specs.
- `ns-configurator`: build forms, fields, records, searches, templates, and permissions.
- `ns-suitescript-dev`: implement SuiteScript 2.1 customizations.
- `ns-workflow-dev`: implement SuiteFlow workflows where configuration is the right tool.
- `ns-data-migrator`: clean, map, validate, and import legacy data.
- `ns-test-manager`: plan SIT/UAT, manage defects, and decide release readiness.
- `ns-change-orchestrator`: create training, SOP, and adoption materials for go-live.

### 3. Operate the GitHub / SDF lifecycle

- `ns-github-setup`: one-time repository and CI/CD setup for GitHub-based SDF collaboration.
- `ns-object-sync`: bring an SDF-owned object changed in the NetSuite UI back into source control safely.
- `ns-conflict-resolve`: resolve SDF merge conflicts with XML-aware rules instead of plain-text merges.
- `ns-ci-diagnose`: isolate one failing CI run to one root cause and one exact fix.
- `ns-pr-create`: prepare a NetSuite-aware pull request from a feature branch.
- `ns-pr-diagnose`: explain why a PR cannot merge and route to the right specialist skill.
- `ns-pr-merge`: validate merge gates and confirm the downstream deployment target.

### 4. Co-write project deliverables when needed

- `ns-cowrite-align`: agree on the document structure before writing starts.
- `ns-cowrite-develop`: draft the document section by section.
- `ns-cowrite-approve`: run the review-and-approval gate before calling the deliverable done.

## Skill Directory At A Glance

| Skill | Primary purpose |
| --- | --- |
| `ns-change-orchestrator` | Training, SOPs, change management, and adoption planning. |
| `ns-ci-diagnose` | Diagnose a single failing GitHub Actions / SDF CI run. |
| `ns-configurator` | Build NetSuite configuration objects from approved design inputs. |
| `ns-conflict-resolve` | Resolve Git conflicts in SDF XML and related project files safely. |
| `ns-cowrite-align` | Confirm a deliverable outline before any writing happens. |
| `ns-cowrite-approve` | Review and approve a co-written deliverable. |
| `ns-cowrite-develop` | Draft a deliverable section by section with the user. |
| `ns-data-migrator` | Cleanse, map, validate, and import legacy data. |
| `ns-erp-navigator` | Orchestrate the 7-phase NetSuite implementation workflow. |
| `ns-github-setup` | Set up GitHub collaboration, CI/CD, ownership rules, and drift controls. |
| `ns-init-project` | Classify a project before delivery work starts. |
| `ns-init-workspace` | Create or reconcile the project workspace structure. |
| `ns-object-sync` | Sync a single SDF-owned UI-edited object back into Git. |
| `ns-pr-create` | Create a NetSuite-aware PR with the right context. |
| `ns-pr-diagnose` | Triage merge blockers on an open PR. |
| `ns-pr-merge` | Safely merge a PR and verify deployment implications. |
| `ns-solution-architect` | Turn business requirements into NetSuite design artifacts. |
| `ns-suitescript-dev` | Build SuiteScript 2.1 customizations. |
| `ns-test-manager` | Handle SIT, UAT, defect triage, and release readiness. |
| `ns-workflow-dev` | Build SuiteFlow workflows and approvals. |

## Recommended Usage Patterns

### New implementation or major enhancement

1. Run `ns-init-project`.
2. Run `ns-init-workspace`.
3. Use `ns-erp-navigator` to coordinate the phase plan.
4. Move into the appropriate specialist skill for the current phase.

### Existing SDF repository that needs DevOps discipline

1. Run `ns-github-setup`.
2. Use `ns-object-sync` for UI-originated object changes.
3. Use `ns-ci-diagnose`, `ns-pr-diagnose`, `ns-conflict-resolve`, and `ns-pr-merge` as the delivery loop requires.

### Deliverable-heavy project work

1. Start with `ns-cowrite-align`.
2. Draft with `ns-cowrite-develop`.
3. Finish with `ns-cowrite-approve`.

## Why This Repository Exists

NetSuite projects usually fail from process gaps more often than missing code: unclear design ownership, bad object boundaries, weak testing discipline, rushed data migration, or undocumented handoffs. This skill set is organized to reduce those gaps by giving each stage of the workflow a dedicated operating mode.
