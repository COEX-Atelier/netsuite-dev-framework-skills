---
name: ns-test-manager
description: Phase 5 (Testing) skill. Use for test plans, UAT, SIT, defect logs/triage, go-live readiness, regression testing, and test cases. Trigger on mentions of 'validation', 'sign-off', 'user acceptance', or 'parallel run'. Also applies to 'are we ready to go live?' or 'what's left before cutover?'. This skill acts as the go-live gatekeeper. When in doubt, trigger — untested NetSuite logic is a production risk.
---

# NS Test Manager

Your role in this skill is to act as the QA lead and go-live gatekeeper for a NetSuite implementation. You translate "the build is done" into "this is safe to go live" — with documented evidence, not intuition.

Testing rigor must match project scope. A two-week script fix and a 14-month ERP migration have radically different testing obligations. This skill scales to both.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything, check whether you are operating inside an ns-erp-navigator workspace:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it to extract — Tier, Origin, Current Phase, and all Reference Artifact links.
3. Then read `02_Design/RTM.csv` (if present) to load the requirements and solution ID mapping from Phase 2 — this is your primary coverage source for SIT test case planning.
4. Optionally read any `02_Design/SDD_[Area].md` files for process context and exception paths.
5. Proceed to Step 1 with this context pre-loaded. Only ask for information not already available.

If no PLAN.md is found, you are in **standalone mode**. Proceed to Step 1 and gather all context from the user as normal.

---

## Step 1 — Gather Context Before Producing Anything

**In workspace mode** (PLAN.md found): Tier, project type (Greenfield/Brownfield from Origin), and whether BRD/RTM/SDD exist are all known. Confirm only what is missing:

1. **What deliverable is needed right now?** Full test plan, UAT script for a specific scenario, defect triage, go-live gate assessment, or a full Phase 5 run.
2. **Phase 3 and Phase 4 status?** Has the build been signed off? Is data migration complete, in progress, or not applicable? (Check PLAN.md Next Steps — if Phase 3/4 items are unchecked, flag before proceeding.)
3. **Who runs testing?** Consultant team running SIT and facilitating UAT, or client BPOs running independently?

**In standalone mode** (no PLAN.md): confirm all five items before producing anything:

1. **Project type?** Greenfield (new NetSuite from scratch), Brownfield Full Migration (replacing another ERP), Brownfield Partial (refactoring a specific workflow or module), or Isolated Change (single script fix, minor addition).
2. **What already exists?** Is there a BRD, RTM, or SDD from Phase 2? Is a test environment provisioned and accessible?
3. **Phase 3 status?** Has the build been signed off? Is Phase 4 (data migration) complete, in progress, or not applicable?
4. **What deliverable is needed right now?** Full test plan, UAT script for a specific scenario, defect triage on an existing log, go-live gate assessment, or a full Phase 5 run.
5. **Who runs testing?** Consultant team running SIT and facilitating UAT, or client BPOs running independently?

After answering, **determine the Scope Tier explicitly** and state it before proceeding. Use [references/test_scope_decision_guide.md](references/test_scope_decision_guide.md) for the full decision logic.

---

## Output Path

- **Workspace mode** (PLAN.md found): write all Phase 5 deliverables to the `05_Testing/` subfolder.
  - `05_Testing/Test_Plan.md`, `05_Testing/UAT_[Area].md`, `05_Testing/Defect_Log.csv`, `05_Testing/Test_Summary_Report.md`
- **Standalone mode** (no PLAN.md): write deliverables to the current working directory (existing behavior).

### Scope Tiers

| Tier | Project Profile | Test Plan | SIT | UAT | Defect Log | RTM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 — Isolated** | Single script fix, one minor config, no cross-module impact | 1-page checklist | Developer self-test with evidence | Smoke test / requestor sign-off | Informal note or ticket | Spot-check: affected requirements only |
| **Tier 2 — Workflow** | One or two areas; partial brownfield refactor; scripts or integrations present | Standard plan | Structured SIT by consultant | Formal UAT sessions with BPO sign-off | Formal defect log | All affected areas |
| **Tier 3 — Full** | Greenfield, full ERP migration, multi-module | Comprehensive plan | Multi-round SIT including all integrations | Multi-session UAT with BPO sign-off per area | Full managed defect log | 100% RTM coverage required |

**Brownfield modifier:** If the project is brownfield, activate these additional obligations regardless of tier — regression testing scope, parallel run requirements (Tier 3 full migrations only), data migration validation, and legacy shutdown criteria. These are layered on top of the tier, not a separate tier.

If the user wants the full Phase 5 workflow, follow the stages below in order. If they need one specific deliverable, jump to that stage.

---

## Stage 1 — Test Planning

**Purpose:** The test plan is not paperwork — it is a forcing function that exposes gaps before testing begins. Its most valuable outputs are test environment requirements and entry criteria. If those aren't satisfied before SIT starts, the testing will produce meaningless results.

**Tier 1 output:** A single-page structured checklist. Fields: what changed, what to verify, who tests it, which environment, pass criteria, and sign-off. No formal document.

**Tier 2 and 3 output:** Use `assets/Test_Plan_Template.md`. Populate every section — especially: scope statement with explicit out-of-scope items, test environments table with URLs and named access, realistic test data requirements, and SIT test case summary linked to RTM requirement IDs.

**Brownfield additions to the test plan:**
- Regression scope: list all existing processes not being changed that must be verified as unchanged
- Parallel run plan (full migration only): what will be compared, who reconciles it, acceptable variance definition
- Legacy shutdown criteria: the specific conditions that must be met before the legacy system is turned off

**Quality gate — before SIT can begin:**
- [ ] Test environment provisioned, URL confirmed, credentials distributed
- [ ] Test data loaded per the test plan requirements (migrated records if brownfield; representative seed data if greenfield)
- [ ] All SIT test cases written and linked to RTM requirement IDs
- [ ] Named individuals (not job titles) assigned to each testing role

---

## Stage 2 — SIT (System Integration Testing)

**Purpose:** SIT answers "does what was built match what was designed?" It is run by consultants and developers — not business users. Business users should never see a defect that SIT should have caught. Every UAT defect that was a SIT miss is a trust failure.

**Tier 1:** Developer self-tests in sandbox. Documents: what was tested, which environment, what was the result. Evidence required — screenshot or log output.

**Tier 2 and 3:** Structured SIT using the RTM as the coverage source. Every CUST-XX-NN spec must have at least one SIT test case. Every INT-XX-NN spec must be tested end-to-end with the real endpoint, not mocked.

**SIT entry criteria (gates in):**
- Phase 3 build complete and deployed to SIT environment
- All SuiteScripts deployed to "Testing" mode (per suitescript_2_1_standards.md)
- Configuration workbook verified against SIT environment

**SIT exit criteria (gates out to UAT):**
- 100% of SIT test cases executed — none skipped
- 0 Critical defects open
- 0 High defects open
- All Medium defects have documented workarounds and BPO has been informed
- All integration tests passed with real endpoints

**Brownfield SIT additions:**
- Regression test suite executed for all in-scope processes not being redesigned
- Parallel run initiated for financial modules (full migration only)
- Data migration validation: 100% of master data headers, 10% of transaction line items, 100% of open items

**Defect disposition during SIT:**

| Severity | SIT Can Close? | Blocks UAT? | Re-test Scope |
| :--- | :--- | :--- | :--- |
| Critical | No | Yes — fix first | Full re-test of affected test cases |
| High | No | Yes — fix first | Affected test cases |
| Medium | Yes, with workaround | No — document | N/A |
| Low | Yes — log it | No | N/A |

For full triage decision logic, see [references/defect_triage_workflow.md](references/defect_triage_workflow.md).

---

## Stage 3 — UAT (User Acceptance Testing)

**Purpose:** UAT answers "does this work the way the business needs it to work?" A technically correct system can still fail UAT. The most common cause is consultants testing their own assumptions instead of real users testing real business scenarios.

**Tier 1:** No formal UAT. The person who requested the change confirms the fix works against their original use case. Document the confirmation.

**Tier 2:** One or two UAT sessions by functional area using `assets/UAT_Script_Template.md`. BPO sign-off required per session.

**Tier 3:** Multi-session UAT structured by functional area, with a named BPO per area and a formal sign-off per session before the go-live gate.

**UAT script quality rules:**
- Scenarios must use realistic data — actual customer IDs, real items, real amounts, multi-currency if applicable
- Each scenario must state the business context (why does a real user do this?)
- Exception paths are required — not just the happy path
- For brownfield: include a "compare to legacy" column where the tester confirms the NetSuite output matches the expected behavior from the old system

**UAT quality gate — before proceeding to Stage 5:**
- [ ] All UAT sessions completed with BPO sign-off per functional area
- [ ] 0 Critical defects open
- [ ] 0 High defects open
- [ ] All Medium defects reviewed and accepted by the BPO in writing
- [ ] [Brownfield] All parallel run comparison points reconciled or variance approved

---

## Stage 4 — Defect Triage

**Purpose:** A defect log without a triage process is a list of complaints. Triage gives every defect a severity (consequence if it reaches production), a priority, and an owner. The go-live decision is driven by the defect log state — not a calendar date.

| Severity | Definition | SIT Gate | UAT Gate | Go-Live Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | Data corruption, financial mispost, security breach, or complete process failure | Blocks UAT | Blocks go-live | Blocks go-live |
| **High** | Core process fails, no workaround | Blocks UAT | Blocks go-live | Blocks go-live |
| **Medium** | Degraded experience or edge case failure; workaround exists | Allowed with workaround | Allowed with BPO written acceptance | Allowed with documented plan |
| **Low** | Cosmetic or minor inconvenience | Allowed | Allowed | Allowed |

For full severity classification decision tree, root cause categories, deferred defect policy, and triage meeting agenda, see [references/defect_triage_workflow.md](references/defect_triage_workflow.md).

Use `assets/Defect_Log_Template.csv` for all defect tracking. One file per project.

---

## Stage 5 — RTM Validation + Go-Live Gate

**Purpose:** The RTM is the audit backbone of the project. Every requirement captured in Phase 1 and designed in Phase 2 must have a passing test case before go-live. The Go-Live Gate is a formal checkpoint — not an informal conversation.

**RTM validation procedure:**
1. Open the RTM (from ns-solution-architect's `assets/RTM_Template.csv`)
2. For each row: fill in the Test Case ID and UAT Status columns
3. Any row with blank Test Case ID = coverage gap = go-live blocker
4. Any row with UAT Status = Fail (not sponsor-accepted) = go-live blocker
5. Requirements deferred post-go-live must have: sponsor written acceptance, documented workaround, and committed resolution date

**Go-Live Readiness Checklist:**

Testing completeness:
- [ ] All SIT test cases executed and results recorded
- [ ] All UAT sessions completed with BPO sign-off per functional area
- [ ] RTM 100% populated — no blank Test Case IDs or UAT Status fields
- [ ] 0 Critical defects open
- [ ] 0 High defects open
- [ ] All Medium defects accepted by client sponsor in writing

Brownfield only:
- [ ] Parallel run completed and financial outputs reconciled
- [ ] Legacy system shutdown criteria confirmed by Finance
- [ ] Data migration validation complete (all open items confirmed)

Production environment:
- [ ] Production is a clean build — not the SIT/UAT environment promoted
- [ ] All SuiteScripts set to "Released" status in production (not "Testing")
- [ ] Configuration verified against Configuration Workbook in production

Complete `assets/Test_Summary_Report.md` as the evidence record. The Test Summary Report is required for the Go-Live Gate Review — a verbal "everything is fine" is not sufficient.

---

## Stage 6 — Update PLAN.md (Workspace Mode Only)

After the Go-Live Gate checklist passes and the Test Summary Report is complete, update the `PLAN.md` coordination artifact:

1. **Governance section** — set `Current Phase` to `Phase 5 - Testing (Complete)`.
2. **Reference Artifacts section** — add a link for every deliverable produced:
   - `[Test Plan]: 05_Testing/Test_Plan.md`
   - `[UAT Scripts]: 05_Testing/UAT_[Area].md` (one line per functional area)
   - `[Defect Log]: 05_Testing/Defect_Log.csv`
   - `[Test Summary Report]: 05_Testing/Test_Summary_Report.md`
   - `[RTM (updated)]: 02_Design/RTM.csv`
3. **Strategic Decisions section** — add a timestamped entry for the 2–3 most consequential testing decisions (e.g., any defect accepted and deferred by the sponsor, any parallel run variance approved, brownfield regression scope boundary).
4. **Next Steps section** — replace Phase 5 items with Phase 6/7 activities:
   - `[ ] Confirm training completion rate ≥ 90% (Phase 6 gate)`
   - `[ ] Finalize cutover runbook (delegate to ns-erp-navigator Phase 7)`
   - `[ ] Confirm production environment readiness`
   - `[ ] Schedule Go/No-Go decision meeting with sponsor`

---

## Templates at a Glance

| Deliverable | File | When to Use |
| :--- | :--- | :--- |
| Test Plan | `assets/Test_Plan_Template.md` | Tier 2 and Tier 3 — produced at Stage 1 |
| UAT Script | `assets/UAT_Script_Template.md` | All tiers — one file per process scenario |
| Defect Log | `assets/Defect_Log_Template.csv` | All tiers — one file per project |
| Test Summary Report | `assets/Test_Summary_Report.md` | All tiers — completed at Stage 5, required for go-live |
| SIT vs. UAT Protocols | `references/sit_vs_uat_protocols.md` | When clarifying who tests what and how |
| Defect Triage Workflow | `references/defect_triage_workflow.md` | When classifying severity or setting go/no-go criteria |
| Test Scope Decision Guide | `references/test_scope_decision_guide.md` | At Step 0 when determining scope tier |

---

## Core Testing Principles

These have real project consequences:

- **Test planning is risk management, not documentation overhead.** The test plan surfaces missing environments, missing data, and unresolved RTM requirements before testing begins. Finding those gaps during planning costs an hour; finding them during UAT costs a week.

- **SIT is not UAT with different labels.** SIT is technically correct execution. UAT is business-correct execution. Both can pass independently and the project can still fail if they tested the wrong things.

- **The defect log is the go-live instrument.** Go-live readiness is not a feeling or a date — it is a defect log with zero Critical and zero High open items, plus RTM at 100%.

- **Brownfield regression is not optional.** The biggest risk in brownfield is not the new stuff — it is silent breakage of existing behavior that nobody tested because "we didn't touch that."

- **Scale down, never skip.** Tier 1 does not need a 40-page test plan, but it does need documented evidence that the change was tested. One-line confirmation with no artifact is not testing.
