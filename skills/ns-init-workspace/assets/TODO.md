# TODO & Next Steps

Living TODO / work-breakdown for the project, organized by phase. Check items off as they complete, nest sub-tasks under each work item, and annotate decisions, defects, dates, branches, worktrees, and PRs inline. `PLAN.md` stays the slim high-level status; this file is where the detail lives.

> Conventions — `- [x]` done · `- [ ]` open. Annotate inline: decisions `D-XX`, defects `DEF-XXX`, dates `YYYY-MM-DD`, `Branch: feat/...`, `Worktree: ...`, `PR #NN`.

<!-- Tier 1 & 2 — 7 phases. For Tier 3, collapse to: Discovery & Design / Build & Test / Deployment. -->

## Phase 1: Discovery
- [ ] **Draft Project Charter** — success criteria, budget, formal sponsor sign-off
- [ ] **Refine BRD** — capture all functional (FR-XX) and technical (TR-XX) requirements
- [ ] **Document System Landscape** — map internal and external dependencies
- [ ] **Finalize Roadmap** — realistic timeline to go-live
- [ ] **Phase Gate Review** — confirm documentation is ready for sponsor sign-off

## Phase 2: Solution Design
- [ ] **Fit-Gap Analysis**
- [ ] **Future-State Process Map**
- [ ] **Solution Design Document (SDD)**
- [ ] **Customization Specifications**
  - [ ] **[CUST-ID]** — [short description]
    - [ ] Functional requirements mapped
    - [ ] Fit-gap documented
    - [ ] NS object type / approach identified
    - [ ] Technical spec drafted
    - [ ] Reviewed and signed off
    - [ ] Update RTM
- [ ] **Requirements Traceability Matrix (RTM)**
- [ ] **Phase Gate Review** — SDD, RTM, and all specs reviewed and approved

## Phase 3: Build
- [ ] **[CUST-ID]** — [short description] | Branch: `feat/...` | Worktree: `...` | PR #
  - [ ] Discovery
  - [ ] Technical Specification Documentation
  - [ ] Update RTM, Configuration Workbook
  - [ ] File setup (one or more objects/scripts)
  - [ ] Quality control sandbox
  - [ ] PR merge
  - [ ] Update TODO, CHANGELOG, references
- [ ] **Phase Gate Review** — all CUSTs merged, Configuration Workbook complete

## Phase 4: Data Integrity
- [ ] **[Object type]** — [description]
  - [ ] Data mapping
  - [ ] Cleansing rules
  - [ ] Validated load
  - [ ] Update TODO, references
- [ ] **Phase Gate Review** — all data maps validated and loaded

## Phase 5: Testing
- [ ] **Test Plan**
- [ ] **SIT execution**
  - [ ] Test script execution
  - [ ] Defect log
  - [ ] Retests
- [ ] **UAT execution**
  - [ ] User acceptance sessions
  - [ ] Defect log
  - [ ] Retests
- [ ] **Phase Gate Review** — UAT sign-off obtained

## Phase 6: Change Management
- [ ] **Training Matrix**
- [ ] **[SOP-ID]** — [short description] (can span multiple CUSTs)
  - [ ] Draft SOP
  - [ ] Review
  - [ ] Sign-off
- [ ] **User guides**
- [ ] **Training schedule**
- [ ] **Phase Gate Review** — all training materials approved and schedule confirmed

## Phase 7: Go-Live
- [ ] **Cutover Checklist**
- [ ] **Go/No-Go sign-off**
- [ ] **Hypercare log**
- [ ] **Post-mortem**
- [ ] **Phase Gate Review** — go-live complete, hypercare closed
