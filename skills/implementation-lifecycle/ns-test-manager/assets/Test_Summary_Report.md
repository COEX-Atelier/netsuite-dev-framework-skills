# Test Summary Report — Go-Live Readiness Assessment

<!-- This document is produced at Stage 5 and submitted to the project sponsor 
     for go-live approval. Complete all sections before the Go-Live Gate Review.
     Sections marked [Brownfield Only] can be deleted for greenfield projects. -->

| Field | Value |
| :--- | :--- |
| **Project** | [Project Name] |
| **Testing Period** | [Start Date] — [End Date] |
| **Prepared By** | [Name, Role] |
| **Reviewed By** | [Name, Role] |
| **Report Date** | [Date] |
| **Recommendation** | **[RECOMMEND GO-LIVE / RECOMMEND GO-LIVE WITH CONDITIONS / DO NOT RECOMMEND GO-LIVE]** |

---

## 1. Executive Summary

<!-- Written in plain language for a business sponsor who has not been in the 
     day-to-day testing. Maximum 1 page. Cover:
     - What was tested (functional areas, number of test cases)
     - Key findings (what worked, what needed rework, what was deferred)
     - Recommendation and conditions, if any -->

[Write the executive summary here. Example structure:]

Testing for [Project] was conducted from [date] to [date], covering [N] functional
areas ([list areas]) across [N] SIT test cases and [N] UAT scenarios.

SIT was completed in [N] rounds. [N] defects were identified, of which [N] were
Critical, [N] High, [N] Medium, and [N] Low. All Critical and High defects have been
resolved and verified.

UAT was conducted across [N] sessions with Business Process Owners for each functional
area. BPO sign-off was received for all areas on [date(s)]. [N] Medium defects remain
open; each has been reviewed and formally accepted by [BPO names] (see Section 6).

**Recommendation:** [State clearly — see options below]

- **RECOMMEND GO-LIVE:** All go-live criteria have been met. Zero Critical or High
  defects are open. RTM coverage is 100%. BPO sign-off received for all areas.
- **RECOMMEND GO-LIVE WITH CONDITIONS:** All critical criteria met. The following
  conditions are accepted by [Sponsor Name]: [list Medium deferrals]. Fix commitments
  are documented in Section 6.
- **DO NOT RECOMMEND GO-LIVE:** The following criteria are not met: [list blockers].
  Go-live should be postponed until these items are resolved.

---

## 2. Testing Coverage Summary

| Metric | Target | Actual | Status |
| :--- | :--- | :--- | :--- |
| SIT Test Cases Planned | [N] | [N] | [Pass / Fail] |
| SIT Test Cases Executed | 100% | [N / N (%)] | [Pass / Fail] |
| SIT Test Cases Passed | 100% | [N / N (%)] | [Pass / Fail] |
| UAT Sessions Completed | [N] | [N] | [Pass / Fail] |
| UAT BPO Sign-offs Received | [N areas] | [N areas] | [Pass / Fail] |
| RTM Requirements with Passing Test Cases | 100% | [N / N (%)] | [Pass / Fail] |
| Open Critical Defects | 0 | [N] | [Pass / Fail] |
| Open High Defects | 0 | [N] | [Pass / Fail] |

---

## 3. Defect Summary

### 3.1 By Severity and Status

| Severity | Total Logged | Resolved & Verified | Open | Deferred | Go-Live Blocker |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Critical | [N] | [N] | [N] | 0 (cannot defer) | [N] |
| High | [N] | [N] | [N] | 0 (cannot defer) | [N] |
| Medium | [N] | [N] | [N] | [N] | 0 (if accepted) |
| Low | [N] | [N] | [N] | [N] | 0 |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** | **[N]** |

### 3.2 By Root Cause Category

<!-- Use this to identify systemic quality issues in upstream phases -->

| Root Cause | Count | % of Total | Implication |
| :--- | :--- | :--- | :--- |
| Custom Code | [N] | [%] | [e.g., "High rate — Phase 3 script review process should be strengthened"] |
| Config | [N] | [%] | — |
| Data | [N] | [%] | — |
| Integration | [N] | [%] | — |
| Environment | [N] | [%] | — |
| User Error | [N] | [%] | [Reassign to training plan in ns-change-orchestrator] |

---

## 4. RTM Coverage

| Functional Area | Requirements in Scope | Test Cases Written | Passed | Open Issues | Coverage Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [O2C] | [N] | [N] | [N] | [N] | [Complete / Incomplete] |
| [P2P] | [N] | [N] | [N] | [N] | [Complete / Incomplete] |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** | — |

<!-- Any RTM row that is not "Pass" or "Accepted by Sponsor" must be listed explicitly below -->

**RTM rows not at Pass status:**

| RTM Row / Req ID | Status | Reason | Action Required |
| :--- | :--- | :--- | :--- |
| [FR-XX] | [Fail / Deferred] | [Explanation] | [Fix by date / Sponsor accepted] |

---

## 5. [Brownfield Only] Parallel Run Summary

| Comparison Point | Legacy System Value | NetSuite Value | Variance | Acceptable? | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GL — AR Trade balance | [$] | [$] | [$] | [Y / N] | [Explanation if variance] |
| AR Aging — Total Open | [$] | [$] | [$] | [Y / N] | — |
| AP Aging — Total Open | [$] | [$] | [$] | [Y / N] | — |
| Inventory On-Hand (total units) | [N] | [N] | [N] | [Y / N] | — |

**Parallel Run Sign-off:** [Name, Role, Date]

**Legacy System Shutdown Criteria:** [Met / Not Met]
- [ ] GL balances reconciled for [N] consecutive days: [Y/N]
- [ ] All open AR/AP items validated: [Y/N]
- [ ] Inventory counts verified: [Y/N / N/A]
- [ ] Finance Lead sign-off received: [Y/N]

---

## 6. Deferred Items

<!-- Every deferred defect must appear here. The sponsor signs off on this table, 
     not just the individual defects. -->

| Defect ID | Title | Severity | Workaround Available | Owner | Resolution Date | Risk if Unresolved | Accepted By | Date Accepted |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [DEF-XXX] | [Title] | [Medium / Low] | [Y — description] | [Name] | [Date ≤ 60 days post go-live] | [Description] | [Sponsor Name] | [Date] |

---

## 7. Go-Live Readiness Gate

<!-- Fill in Y/N for each item. Any N must be resolved or formally accepted before go-live. -->

### Testing Completeness
- [ ] All SIT test cases executed and results recorded in Defect Log
- [ ] All UAT sessions completed with BPO sign-off per functional area
- [ ] RTM 100% populated — no blank Test Case IDs or UAT Status fields
- [ ] 0 Critical defects open
- [ ] 0 High defects open
- [ ] All Medium defects accepted by client sponsor in writing (see Section 6)

### [Brownfield Only]
- [ ] Parallel run completed and financial outputs reconciled
- [ ] Legacy system shutdown criteria confirmed by Finance
- [ ] Data migration validation complete (all open items confirmed)

### Production Environment
- [ ] Production environment is a clean build — not the SIT/UAT environment promoted
- [ ] All SuiteScripts deployed to "Released" status in production (not "Testing")
- [ ] All configuration verified against Configuration Workbook in production
- [ ] Production access verified for all go-live users

---

## 8. Sign-Off Page

| Role | Name | Recommendation | Signature | Date |
| :--- | :--- | :--- | :--- | :--- |
| Project Manager | [Name] | [Go-Live / Not Ready] | | |
| Lead Consultant | [Name] | [Go-Live / Not Ready] | | |
| Functional Lead | [Name] | [Go-Live / Not Ready] | | |
| Business Sponsor | [Name] | [Go-Live / Not Ready] | | |
| [Brownfield: Legacy System Owner] | [Name] | [Go-Live / Not Ready] | | |
