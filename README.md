# NetSuite Dev Framework Skills

A library of [Claude](https://claude.com/claude-code) skills for running NetSuite implementation projects — from first scoping conversation through SuiteScript development, testing, go-live, and the GitHub/SDF source-control workflow that supports them.

Each skill is a self-contained `SKILL.md` (plus assets) that Claude loads on demand. Skills call each other **by name**, so they compose into an end-to-end pipeline rather than living in isolation.

---

## The pipeline at a glance

```
  SET UP                IMPLEMENT (7 phases)                   SHIP
  ──────                ────────────────────                   ────
  ns-init-project   →   ns-erp-navigator (orchestrates 1–7)
  ns-init-workspace      ├─ P2  ns-solution-architect
  ns-github-setup        ├─ P3  ns-configurator                ns-pr-create
                         ├─ P3  ns-suitescript-dev      ───►   ns-pr-diagnose
                         ├─ P3  ns-workflow-dev                 ns-pr-merge
                         ├─ P4  ns-data-migrator
                         ├─ P5  ns-test-manager                 ns-object-sync
                         └─ P6  ns-change-orchestrator          ns-conflict-resolve
                                                                ns-ci-diagnose
                  every deliverable is written via
              ns-cowrite-align → develop → approve
```

1. **Set up** the project once — classify it, scaffold the workspace, and configure GitHub/SDF collaboration.
2. **Implement** through the 7-phase lifecycle. `ns-erp-navigator` is the orchestrator: it tracks progress in `PLAN.md` and delegates each phase to a specialist.
3. **Author** every document (BRD, Charter, SDD, test plan…) through the three-phase co-writing protocol, which keeps you in control of structure and content.
4. **Ship** changes through the SDF source-control and pull-request skills.

---

## Skills by category

Skills are grouped into five folders. Each folder has a `README.md` describing the skills it contains.

| Category | Folder | Use it for |
|---|---|---|
| **Project Setup** | [`skills/project-setup/`](skills/project-setup/) | Standing up a new project: classification, workspace scaffolding, GitHub/SDF setup. |
| **Implementation Lifecycle** | [`skills/implementation-lifecycle/`](skills/implementation-lifecycle/) | The 7-phase methodology — orchestrator plus the architecture, configuration, SuiteScript, SuiteFlow, data, testing, and change-management specialists. |
| **Deliverable Authoring** | [`skills/deliverable-authoring/`](skills/deliverable-authoring/) | The co-writing protocol every deliverable runs through (align → develop → approve). |
| **Source Control & CI** | [`skills/source-control/`](skills/source-control/) | SDF-aware git and CI: syncing UI edits back to git, resolving conflicts, diagnosing CI failures. |
| **Pull Requests** | [`skills/pull-requests/`](skills/pull-requests/) | The create → diagnose → merge path for SDF feature branches. |

---

## Which skill do I want?

| If you want to… | Start with |
|---|---|
| Start a brand-new NetSuite project | `ns-init-project` |
| Organize or reconcile a messy project folder | `ns-init-workspace` |
| Set up GitHub CI/CD and team collaboration for an SDF repo | `ns-github-setup` |
| Figure out where the project stands or what's next | `ns-erp-navigator` |
| Turn a BRD into a NetSuite solution design | `ns-solution-architect` |
| Build fields, forms, saved searches, roles, templates | `ns-configurator` |
| Write or debug SuiteScript | `ns-suitescript-dev` |
| Build an approval/notification workflow without code | `ns-workflow-dev` |
| Migrate or cleanse legacy data | `ns-data-migrator` |
| Plan testing, run UAT, or check go-live readiness | `ns-test-manager` |
| Plan training and user adoption | `ns-change-orchestrator` |
| Write any document with the user in the loop | `ns-cowrite-align` (then develop → approve) |
| Pull a UI-edited object back into git | `ns-object-sync` |
| Resolve an SDF merge conflict | `ns-conflict-resolve` |
| Understand why a CI run failed | `ns-ci-diagnose` |
| Open, unblock, or merge a pull request | `ns-pr-create` / `ns-pr-diagnose` / `ns-pr-merge` |
| Analyze a session for friction and improvement signals | `ns-session-retrospective` |

---

## Full skill directory

Every skill, alphabetically, with the folder it lives in. Each folder's own `README.md` has the detail.

| Skill | Category | Primary purpose |
|---|---|---|
| `ns-change-orchestrator` | implementation-lifecycle | Training, SOPs, change management, and adoption planning. |
| `ns-ci-diagnose` | source-control | Diagnose a single failing GitHub Actions / SDF CI run down to one root cause. |
| `ns-configurator` | implementation-lifecycle | Build NetSuite configuration objects (fields, forms, searches, roles, templates) from approved designs. |
| `ns-conflict-resolve` | source-control | Resolve Git conflicts in SDF XML and related project files with XML-aware rules. |
| `ns-cowrite-align` | deliverable-authoring | Confirm a deliverable outline before any writing happens. |
| `ns-cowrite-approve` | deliverable-authoring | Run the review-and-approval gate before a co-written deliverable is called done. |
| `ns-cowrite-develop` | deliverable-authoring | Draft a deliverable section by section with the user. |
| `ns-data-migrator` | implementation-lifecycle | Cleanse, map, validate, and import legacy data. |
| `ns-erp-navigator` | implementation-lifecycle | Orchestrate the 7-phase NetSuite implementation and phase handoffs. |
| `ns-github-setup` | project-setup | Set up GitHub collaboration, CI/CD, object-ownership rules, and drift controls. |
| `ns-init-project` | project-setup | Classify a project by origin, scope, tier, and environment before delivery starts. |
| `ns-init-workspace` | project-setup | Create or reconcile the project workspace structure and `PLAN.md`. |
| `ns-object-sync` | source-control | Sync a single SDF-owned, UI-edited object back into Git safely. |
| `ns-pr-create` | pull-requests | Create a NetSuite-aware pull request from a feature branch. |
| `ns-pr-diagnose` | pull-requests | Triage why an open PR cannot merge and route to the right specialist. |
| `ns-pr-merge` | pull-requests | Safely merge a PR and confirm the downstream deployment target. |
| `ns-session-retrospective` | implementation-lifecycle | Analyze a completed session to surface frictions, pivots, and skill gaps; publish a privacy-safe report as a GitHub issue. |
| `ns-solution-architect` | implementation-lifecycle | Turn business requirements into NetSuite design artifacts (SDD, Fit-Gap, RTM). |
| `ns-suitescript-dev` | implementation-lifecycle | Build and debug SuiteScript 2.1 customizations. |
| `ns-test-manager` | implementation-lifecycle | Plan SIT/UAT, triage defects, and decide release readiness. |
| `ns-workflow-dev` | implementation-lifecycle | Build SuiteFlow workflows and approvals where configuration is the right tool. |

---

## Recommended usage patterns

**New implementation or major enhancement**
1. `ns-init-project` — classify the engagement.
2. `ns-init-workspace` — scaffold the workspace and `PLAN.md`.
3. `ns-erp-navigator` — coordinate the phase plan.
4. Move into the specialist skill for the current phase as the navigator delegates.

**Existing SDF repo that needs DevOps discipline**
1. `ns-github-setup` — one-time CI/CD, ownership, and drift setup.
2. `ns-object-sync` — bring UI-originated object changes back into Git.
3. `ns-ci-diagnose`, `ns-pr-diagnose`, `ns-conflict-resolve`, `ns-pr-merge` — the delivery loop, as needed.

**Deliverable-heavy work**
1. `ns-cowrite-align` → 2. `ns-cowrite-develop` → 3. `ns-cowrite-approve`.

---

## Repository layout

```
skills/
├── project-setup/            # ns-init-project, ns-init-workspace, ns-github-setup
├── implementation-lifecycle/ # ns-erp-navigator + 7 phase specialists + ns-session-retrospective
├── deliverable-authoring/    # ns-cowrite-align / -develop / -approve
├── source-control/           # ns-object-sync, ns-conflict-resolve, ns-ci-diagnose
└── pull-requests/            # ns-pr-create, ns-pr-diagnose, ns-pr-merge
```

Skills reference each other by name, so the folder a skill lives in is purely organizational — moving a skill between categories does not change how it is invoked.

### Anatomy of a skill folder

Each skill lives in its own folder and can include:

- `SKILL.md` — the skill's instructions and trigger conditions (always present).
- `references/` — deeper rules and examples the skill reads on demand.
- `assets/` — templates, checklists, and handoff artifacts.
- `scripts/` — helper automation the skill runs (e.g. `ns-github-setup/scripts/check-drift.js`).
- `evals/` — evaluation data for the skill, where applicable.

At the repo root, `skills-lock.json` tracks published skill metadata (source repo, entrypoint, content hash).
