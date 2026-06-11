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
| Strip AI tells / context leakage from a draft | `deleak` |
| Pull a UI-edited object back into git | `ns-object-sync` |
| Resolve an SDF merge conflict | `ns-conflict-resolve` |
| Understand why a CI run failed | `ns-ci-diagnose` |
| Open, unblock, or merge a pull request | `ns-pr-create` / `ns-pr-diagnose` / `ns-pr-merge` |

---

## Repository layout

```
skills/
├── project-setup/            # ns-init-project, ns-init-workspace, ns-github-setup
├── implementation-lifecycle/ # ns-erp-navigator + 7 phase specialists
├── deliverable-authoring/    # ns-cowrite-align / -develop / -approve
├── source-control/           # ns-object-sync, ns-conflict-resolve, ns-ci-diagnose
└── pull-requests/            # ns-pr-create, ns-pr-diagnose, ns-pr-merge
```

Skills reference each other by name, so the folder a skill lives in is purely organizational — moving a skill between categories does not change how it is invoked.
