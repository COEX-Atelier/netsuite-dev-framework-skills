# Phase 2 — Solution Design Reference

## Goal

Translate every signed-off BRD requirement into a concrete, implementation-ready NetSuite design. Phase 2 ends when a developer, configurator, and tester can each pick up their respective deliverables and execute without asking follow-up questions.

---

## Spoke Skill: ns-solution-architect

Phase 2 is owned by the `ns-solution-architect` spoke skill. The navigator's role is to:

1. Run the **Phase 1 → Phase 2 gate check** (see quality gate below) before delegating.
2. Point the user at the workspace root so the spoke skill can read `PLAN.md` and `01_Discovery/BRD.md` automatically.
3. Run the **Phase 2 → Phase 3 gate check** once the spoke skill reports completion.

To invoke: tell the user to invoke `ns-solution-architect` from the project workspace root. The skill will detect `PLAN.md`, load the BRD, and only ask for information not already present (typically: NetSuite modules licensed, specific deliverable scope).

---

## What Phase 1 Provides (Inputs to Phase 2)

| Artifact | Location | Used For |
|----------|----------|----------|
| Business Requirements Document | `01_Discovery/BRD.md` | Source of all Requirement IDs (FR-XX, TR-XX), priorities, and process scope |
| Project Charter | `01_Discovery/Project_Charter.md` | Go-live date, budget envelope, success criteria |
| Implementation Roadmap | `01_Discovery/Implementation_Roadmap.md` | Timeline constraints for design decisions |
| PLAN.md | `PLAN.md` | Tier, Origin, current phase, strategic decisions to date |

---

## Phase 2 Deliverables

All artifacts are written to the `02_Design/` folder by `ns-solution-architect`.

| Deliverable | File Convention | Purpose |
|-------------|----------------|---------|
| Fit-Gap Analysis | `FGA_[Area].md` | Classify every BRD requirement as S/C/X/O; identify true gaps |
| Solution Design Document | `SDD_[Area].md` | One per functional area — complete design a builder can execute from |
| Customization Spec | `CUST-[Area]-[NN].md` | Self-contained spec for each SuiteScript or SuiteFlow customization |
| Integration Spec | `INT-[System]-[NN].md` | Technical contract for each system-to-system integration |
| Requirements Traceability Matrix | `RTM.csv` | One file — maps every BRD Requirement ID to a Solution ID |

### Tier scaling

| Tier | Expected output |
|------|----------------|
| Tier 1 | Full FGA + SDD per functional area + individual CUST/INT specs + RTM |
| Tier 2 | Abbreviated FGA + SDD for the module in scope + CUST/INT specs + RTM |
| Tier 3 | Simple Spec in `Discovery_Design/Simple_Spec.md` (no separate FGA/SDD) |

---

## Phase Gate: Phase 1 → Phase 2

Run this check before delegating to `ns-solution-architect`. Block Phase 2 if any item fails.

- [ ] BRD is complete — all requirements have a unique ID and a priority (H/M/L)
- [ ] Every in-scope functional area has at least one BRD requirement
- [ ] System landscape documented — all integration candidates identified
- [ ] In-Scope / Out-of-Scope list approved by the project sponsor
- [ ] Project Charter signed off (go-live date, budget, success criteria agreed)
- [ ] Implementation Roadmap reviewed and approved
- [ ] No open High-priority questions from Phase 1

---

## Phase Gate: Phase 2 → Phase 3

Run this check once `ns-solution-architect` reports Phase 2 complete. Block Phase 3 if any item fails.

- [ ] Fit-Gap Analysis covers every BRD Requirement ID — no gaps without a classification
- [ ] At least one SDD exists per in-scope functional area (Tier 1 & 2)
- [ ] Every requirement classified as X (Customization) has a corresponding CUST spec
- [ ] Every integration candidate identified in Phase 1 has a corresponding INT spec
- [ ] RTM.csv has 100% requirement coverage — no unmapped rows
- [ ] PLAN.md updated: Current Phase set to `Phase 2 - Design (Complete)`, all artifact links present
- [ ] Client/sponsor sign-off on the Fit-Gap classification (especially all "X" classifications)

---

## PLAN.md State After Phase 2

When Phase 2 is complete, `PLAN.md` should reflect:

```
## Governance
- Tier: [1 / 2 / 3]
- Origin: [Greenfield / Brownfield]
- Current Phase: Phase 2 - Design (Complete)

## Reference Artifacts
- [BRD]: 01_Discovery/BRD.md
- [Project Charter]: 01_Discovery/Project_Charter.md
- [Implementation Roadmap]: 01_Discovery/Implementation_Roadmap.md
- [Fit-Gap Analysis]: 02_Design/FGA_[Area].md
- [Solution Design Document]: 02_Design/SDD_[Area].md
- [Customization Specs]: 02_Design/CUST-[Area]-[NN].md (one per spec)
- [RTM]: 02_Design/RTM.csv

## Strategic Decisions
- [Date]: [Key design choice and rationale — e.g., FR-12 classified as C not X because...]

## Next Steps
- [ ] Provision NetSuite Sandbox for build
- [ ] Developer kickoff — walk through all Customization Specs
- [ ] Configuration lead — begin standard config per SDD
- [ ] Data team — begin data mapping (delegate to ns-data-migrator)
- [ ] Schedule Phase 3 gate review
```
