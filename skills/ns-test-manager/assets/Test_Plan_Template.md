# Test Plan

<!-- Fill in the header table, then work section by section. 
     Sections marked [Brownfield Only] can be deleted for greenfield projects. -->

| Field | Value |
| :--- | :--- |
| **Project** | [Project Name] |
| **Functional Scope** | [e.g., O2C, P2P, Inventory — list all areas in scope] |
| **Scope Tier** | [Tier 1 / Tier 2 / Tier 3] |
| **Project Type** | [Greenfield / Brownfield Full Migration / Brownfield Partial / Isolated] |
| **Test Plan Version** | [1.0] |
| **Prepared By** | [Name, Role] |
| **Date** | [Date] |
| **Phase 3 Sign-off Reference** | [Link or document name confirming build is complete] |
| **RTM Reference** | [Link or file name for the RTM from Phase 2] |

---

## 1. Scope Statement

<!-- One paragraph: what this testing covers and what it explicitly does NOT cover.
     "Out of Scope" is as important as "In Scope" — it prevents scope creep during UAT. -->

### 1.1 In-Scope Functional Areas

| Area | Processes Being Tested | CUST/INT Specs Included |
| :--- | :--- | :--- |
| [e.g., O2C] | [e.g., Sales Order Entry, Invoice Generation, Cash Application] | [e.g., CUST-O2C-01, CUST-O2C-02, INT-SFDC-01] |

### 1.2 Out-of-Scope Items

<!-- List anything explicitly excluded. Examples: "Report formatting changes deferred 
     to post go-live", "Vendor portal integration — separate project", "Legacy data 
     older than 3 years not subject to migration validation" -->

- [Item 1]
- [Item 2]

### 1.3 [Brownfield Only] Brownfield Testing Additions

| Brownfield Obligation | Required? | Notes |
| :--- | :--- | :--- |
| Parallel Run | [Y / N] | If Y: specify financial areas and comparison period |
| Regression Testing | [Y / N] | If Y: see Section 1.4 |
| Data Migration Validation | [Y / N] | If Y: see Section 3 |
| Legacy System Shutdown Criteria | [Y / N] | If Y: see Section 8 |

### 1.4 [Brownfield Only] Regression Scope

<!-- List all existing processes NOT being changed that must be verified as unchanged.
     These are tested during SIT Round 1. -->

| Process | Functional Area | Tested By | Evidence Required |
| :--- | :--- | :--- | :--- |
| [e.g., Standard PO Approval] | [P2P] | [Lead Consultant] | [Screenshot] |

---

## 2. Test Environments

<!-- Environment readiness is the #1 cause of delayed UAT. Every field in this 
     table must be filled in — "TBD" is not acceptable when testing begins. -->

| Environment | URL / Account ID | Who Has Access | Data State | Refresh Plan |
| :--- | :--- | :--- | :--- | :--- |
| SIT Sandbox | [e.g., system.netsuite.com/accountID] | [Consultants, Developers] | [Clean config + migrated master data] | [Refresh before Round 2 SIT] |
| UAT Sandbox | [URL] | [Consultants, BPOs] | [Realistic business data — see Section 3] | [Refresh after SIT sign-off] |

---

## 3. Test Data Requirements

<!-- What data must exist before testing can start?
     For brownfield: which migrated records will be used as test data?
     Be specific — "customers must exist" is not sufficient. -->

| Data Required | Specific Records / Values | Responsible For Loading | Ready By Date |
| :--- | :--- | :--- | :--- |
| [e.g., Customer records] | [e.g., ACME Corp (multi-currency, USD/EUR), Beta LLC (COD terms)] | [Data Migrator / Consultant] | [Date] |
| [e.g., Inventory items] | [e.g., SKUs with lot tracking, items with tiered pricing] | [Consultant] | [Date] |
| [e.g., Open sales orders] | [e.g., 10 open SOs at various stages of fulfillment] | [Data Migrator] | [Date] |

---

## 4. Roles and Responsibilities

| Role | Name | SIT Responsibilities | UAT Responsibilities |
| :--- | :--- | :--- | :--- |
| Lead Consultant | [Name] | SIT coordination, defect triage | UAT facilitation, defect logging |
| Developer | [Name] | Execute SIT test cases, fix defects | Available for technical questions |
| QA / Test Lead | [Name] | Review SIT results, manage defect log | Review UAT results |
| BPO — [Area] | [Name] | N/A | Execute UAT scripts, sign-off per session |
| BPO — [Area] | [Name] | N/A | Execute UAT scripts, sign-off per session |
| Project Manager | [Name] | Monitor SIT progress, escalate blockers | Monitor UAT progress, manage sign-offs |

---

## 5. SIT Plan

### 5.1 SIT Test Cases

<!-- One row per test case. Source: every CUST-XX-NN and INT-XX-NN spec from Phase 2 
     must appear here. Standard configuration is covered by functional smoke tests. -->

| Test Case ID | Linked Req (RTM) | Description | Spec Being Tested | Expected Result | Tester |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SIT-[Area]-01 | [FR-XX] | [e.g., User Event script fires on SO save, updates approval status field] | [CUST-O2C-01] | [Field value changes to "Pending Approval"; no script errors in execution log] | [Name] |

### 5.2 SIT Rounds

| Round | Purpose | Scope | Target Start | Target End |
| :--- | :--- | :--- | :--- | :--- |
| Round 1 | Full initial execution | All test cases in Section 5.1 | [Date] | [Date] |
| Round 2 | Defect re-test | Affected test cases only (or full regression if shared logic was touched) | [Date] | [Date] |

### 5.3 SIT Entry Criteria

Before SIT begins, all of the following must be true:

- [ ] Phase 3 Build sign-off received
- [ ] All SuiteScripts deployed to "Testing" mode in SIT environment
- [ ] Configuration workbook verified against SIT environment
- [ ] SIT environment URL and credentials confirmed for all testers
- [ ] Test data loaded per Section 3

### 5.4 SIT Exit Criteria

SIT is complete when all of the following are true:

- [ ] 100% of SIT test cases executed (none skipped)
- [ ] 0 Critical defects open
- [ ] 0 High defects open
- [ ] All Medium defects have documented workarounds and BPO is aware
- [ ] All integration tests passed with real endpoint (not mocked)
- [ ] [Brownfield] Regression scope fully executed with documented evidence
- [ ] SIT → UAT handoff ceremony complete (see sit_vs_uat_protocols.md Section 4)

---

## 6. UAT Plan

### 6.1 UAT Sessions

| Session Name | Functional Area | BPO | Planned Date | UAT Scripts |
| :--- | :--- | :--- | :--- | :--- |
| [e.g., O2C UAT Session 1] | [O2C] | [Name] | [Date] | [UAT-O2C-01, UAT-O2C-02, UAT-O2C-03] |

### 6.2 UAT Entry Criteria

UAT does not begin until SIT exit criteria are fully met. Additionally:

- [ ] UAT environment refreshed with clean data
- [ ] BPOs confirmed available for scheduled sessions
- [ ] UAT scripts distributed to BPOs at least 24 hours before first session
- [ ] BPOs briefed on defect logging process

### 6.3 UAT Exit Criteria

UAT is complete when all of the following are true:

- [ ] All UAT sessions completed
- [ ] BPO sign-off received per functional area
- [ ] 0 Critical defects open
- [ ] 0 High defects open
- [ ] All Medium defects reviewed and formally accepted by BPO in writing
- [ ] [Brownfield] All parallel run comparison points reconciled (or variance approved)

### 6.4 BPO Sign-Off Requirement

Each BPO must sign off on their functional area before UAT for that area is considered
complete. Sign-off confirms: "I have reviewed the UAT results for [area] and accept
the documented state, including the open defects listed."

---

## 7. Defect Management

**Defect Log:** Use `assets/Defect_Log_Template.csv`. One file per project.

**Severity Definitions:** See `references/defect_triage_workflow.md` Section 3.

**Escalation Path for Critical Defects:** [Name of escalation contact] → [Name of sponsor].
Target response time: same business day.

**Triage Meeting Schedule:**
- During SIT: [Daily at Time / Async via tool]
- During UAT: [Daily at Time]
- Attendees: Lead Consultant, Developer, QA Lead; BPO joins only for Medium/Low acceptance decisions

---

## 8. [Brownfield Only] Parallel Run Plan

<!-- Skip this section entirely for greenfield and brownfield partial projects
     where financial balances are not being migrated. -->

| Field | Value |
| :--- | :--- |
| **Parallel Run Start Date** | [Date] |
| **Parallel Run End Date** | [Date — run for at least N business days] |
| **Modules in Parallel Run** | [e.g., AR, AP, GL] |
| **Comparison Frequency** | [e.g., Daily for GL; weekly for aging reports] |
| **Reconciliation Owner** | [Name — typically Finance lead] |
| **Approved Variance Threshold** | [e.g., <$0.01 for balance sheet; timing differences must be explained] |

### Legacy System Shutdown Criteria

The legacy system will not be shut down until all of the following are confirmed:

- [ ] GL balances reconcile within approved variance for [N] consecutive business days
- [ ] All open AR items confirmed in NetSuite (aging report matches)
- [ ] All open AP items confirmed in NetSuite (aging report matches)
- [ ] Inventory counts verified (if applicable)
- [ ] Finance Lead sign-off: [Name, Date]

---

## 9. Schedule and Milestones

| Milestone | Target Date | Owner | Dependencies |
| :--- | :--- | :--- | :--- |
| Test environments provisioned | [Date] | [Name] | Phase 3 build complete |
| Test data loaded | [Date] | [Name] | Environment ready |
| SIT Round 1 start | [Date] | [Name] | Entry criteria met |
| SIT Round 1 complete | [Date] | [Name] | — |
| SIT Round 2 complete (if needed) | [Date] | [Name] | Round 1 defects fixed |
| SIT exit gate confirmed | [Date] | [PM] | 0 Critical/High open |
| UAT sessions start | [Date] | [Name] | SIT exit, handoff ceremony |
| UAT sessions complete | [Date] | [Name] | — |
| BPO sign-offs received (all areas) | [Date] | [PM] | UAT exit criteria |
| Go-Live Gate Review | [Date] | [PM, Sponsor] | UAT exit, RTM complete |
| Go-Live | [Date] | [PM] | Gate approved |

---

## 10. Risks and Assumptions

| # | Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Test environment not ready on time | Medium | High — delays all SIT | Confirm environment readiness 1 week before SIT start; escalate to PM if not confirmed |
| 2 | Key BPO unavailable for UAT sessions | Medium | High — cannot complete sign-off | Identify backup BPO per area before UAT planning is finalized |
| 3 | Phase 3 build delivered late | Low–Medium | High — compresses test schedule | Monitor Phase 3 completion weekly; hold test environment provisioning in parallel |
| 4 | [Add project-specific risk] | | | |
