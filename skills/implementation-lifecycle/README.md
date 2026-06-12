# Implementation Lifecycle

The 7-phase NetSuite implementation methodology: one orchestrator that tracks progress through `PLAN.md` and delegates to phase specialists that produce the actual work.

| Skill | Phase | What it does |
|---|---|---|
| **ns-erp-navigator** | 1–7 | Orchestrator. Handles Discovery (BRDs, scoping), As-Is reviews, system landscape mapping, roadmaps, project charters, and go-live/cutover planning. Answers "where are we / what's next" and delegates to the specialists below. |
| **ns-solution-architect** | 2 | Translates BRD/discovery requirements into a concrete, NetSuite-specific solution design. Runs only after Phase 1 deliverables exist. |
| **ns-configurator** | 3 | Builds configuration objects — custom fields, records, forms, saved searches, PDF/HTML templates, and roles/permissions. |
| **ns-suitescript-dev** | 3 | Implements Customization Specs in SuiteScript 2.1 (User Event, Client, Map/Reduce, Scheduled, RESTlet, Suitelet), including governance and deployment prep. |
| **ns-workflow-dev** | 3 | Designs and implements SuiteFlow workflows for state-based automation, approvals, notifications, and field defaulting — no SuiteScript required. |
| **ns-data-migrator** | 4 | Cleanses legacy records, maps fields to NetSuite schemas, validates data quality, and runs sequenced CSV imports. |
| **ns-test-manager** | 5 | Builds test plans and runs UAT/SIT, defect logging and triage, regression testing, and go-live readiness sign-off. |
| **ns-change-orchestrator** | 6 | Develops training strategies, role-based user guides, communication plans, and adoption tracking for go-live. |
| **ns-session-retrospective** | Meta | Analyzes a completed session to surface frictions, pivots, and skill gaps; produces a privacy-safe report and publishes it as a GitHub issue. |

> Deliverables in this category are written through the **deliverable-authoring** co-writing protocol.
