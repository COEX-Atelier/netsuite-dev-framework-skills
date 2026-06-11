# Test Scope Decision Guide

## 1. Why Scope Calibration Matters

Over-testing a small change wastes budget, fatigues BPOs, and delays go-live for work
that doesn't need the ceremony. Under-testing a large change causes production incidents
and destroys client trust. The goal is testing proportional to **risk**, not proportional
to deliverable count.

This guide gives you a repeatable way to calibrate testing depth before you produce a
single test case.

---

## 2. Scope Tier Determination

Answer these six questions. Each "yes" increases the scope tier.

| # | Question | Impact |
| :--- | :--- | :--- |
| 1 | Are **two or more functional areas** affected? (e.g., both O2C and P2P) | Increases to Tier 2 at minimum |
| 2 | Are there **custom scripts or integrations** in scope? (any CUST-XX or INT-XX from Phase 2) | Increases to Tier 2 at minimum |
| 3 | Are **migrated data records** involved in this change? (records loaded during Phase 4) | Adds data validation obligation |
| 4 | Will the change **create or post financial transactions**? (invoices, bills, journal entries, payments) | Increases to Tier 2 at minimum; adds GL verification requirement |
| 5 | Are **multiple roles or departments** affected by the change? | Increases UAT session count; may increase to Tier 2 |
| 6 | Is this **brownfield** — i.e., there is an existing system whose behavior must not be broken? | Adds regression and (for full migrations) parallel run obligations |

### Tier Determination Table

| Conditions | Scope Tier |
| :--- | :--- |
| 0–1 yes answers; single functional area; no scripts; no financial postings; one team | **Tier 1 — Isolated** |
| 2–4 yes answers; one or two functional areas; scripts or integrations present; financial postings possible | **Tier 2 — Workflow** |
| 5–6 yes answers; multi-module; full migration or greenfield; financial posting required; multiple BPOs | **Tier 3 — Full** |

When conditions straddle tiers, choose the higher tier. The cost of under-scoping
is always higher than the cost of over-scoping.

---

## 3. Tier-by-Tier Testing Approach

### Tier 1 — Isolated Change

**What it is:** A single script fix, one minor configuration change (e.g., adding a
custom field to a form), a report format correction, or a saved search update.
No cross-module impact. No migrated data involved. No new financial transaction types.

**Concrete examples:**
- Scheduled SuiteScript was miscalculating a commission field — developer has fixed it
- A custom field was added to the Vendor Bill form
- An existing saved search needs a new filter

**What "done" looks like:**
- Developer tests the change in sandbox and records the result (screenshot or log output)
- The requestor (or a single named user) confirms the fix works against their original use case
- Confirmation is documented (email, message, or a line in a change log)

**What is overkill for Tier 1:**
- A formal multi-section test plan
- A structured defect log (use a simple note or ticket)
- Multiple UAT sessions with BPO sign-off per area

**The rule:** Scale down, never skip. Even Tier 1 needs documented evidence that the
change was tested. "I tested it and it works" with no record is not testing.

---

### Tier 2 — Workflow-Level Change

**What it is:** One or two functional areas being added or significantly modified. May
include custom scripts, integrations, or configuration changes that affect a business
process end-to-end. Brownfield partial refactors typically land here.

**Concrete examples:**
- Refactoring the AP vendor bill approval workflow (replaces a manual email approval)
- Adding a new SuiteScript to automate intercompany journal entries
- Integrating a third-party payroll system with NetSuite for the first time

**What "done" looks like:**
- Standard Test Plan covering the affected functional areas (not the entire implementation)
- Structured SIT: each custom script and integration tested end-to-end with documented results
- UAT: one or two sessions with BPO sign-off per functional area, using realistic test data
- Defect log with triage for all issues found
- Regression scope defined (Brownfield: which existing processes in the affected area
  must be verified as unchanged)

**For brownfield partial:** No parallel run required unless financial balances are being
migrated. Regression scope is limited to processes in the affected functional area.

---

### Tier 3 — Full Implementation

**What it is:** Greenfield (new NetSuite from scratch), full ERP migration (replacing
another ERP), or a multi-module brownfield upgrade affecting the majority of the business.

**Concrete examples:**
- Full NetSuite implementation for a manufacturing company: O2C + P2P + Inventory + Financials
- Migrating from Sage to NetSuite for a professional services firm
- Replacing a legacy custom ERP with NetSuite across three subsidiaries

**What "done" looks like:**
- Comprehensive Test Plan covering all functional areas, all test rounds, all BPO assignments
- Multi-round SIT: every CUST-XX spec and every INT-XX spec covered; integration tests
  with real endpoints (not mocked)
- Multi-session UAT structured by functional area, with a named BPO per area and formal
  sign-off per session
- Full managed defect log with triage meeting cadence
- RTM 100% populated — no blank Test Case IDs, no UAT Status left empty
- Test Summary Report completed and reviewed before go-live gate

**For greenfield:** No parallel run. Focus on establishing correct behavior from scratch.

**For full brownfield migration:** Parallel run required (see Section 4). Regression
testing covers all processes not being redesigned. Legacy shutdown criteria must be
defined in the Test Plan.

---

## 4. The Brownfield Modifier

Brownfield is not a separate tier — it is a flag that adds obligations on top of
whichever tier applies.

| Testing Dimension | Greenfield | Brownfield Partial | Brownfield Full Migration |
| :--- | :--- | :--- | :--- |
| Regression scope | N/A — nothing existed before | Processes in affected functional area | All processes not being redesigned |
| Parallel run | Not required | Not required unless financial balances migrate | **Required** — financial outputs must reconcile |
| Data migration validation | N/A | If data was migrated in scope of this change | Full scope: 100% master data, 10% transactions, 100% open items |
| Legacy system shutdown criteria | N/A | N/A | Defined in Test Plan; confirmed before go-live gate |
| UAT comparison column | Not applicable | Optional — compare to previous process | Required — compare to legacy system output |
| Risk profile | Lower — no existing behavior to break | Medium — existing processes at risk in affected area | Higher — entire business depends on parity with legacy |

---

## 5. Common Scoping Mistakes

**Treating a brownfield partial as greenfield.** The most expensive mistake. When
you add a new feature to an existing NetSuite environment, you inherit the obligation
to verify that existing behavior is unchanged. Define the regression scope explicitly
before testing begins.

**Running UAT without real test data.** Placeholder data ("Customer A", "Item 1",
amounts of $100) produces false passes. A scenario that passes with clean test data
may fail immediately in production with real business data. Use actual customer IDs,
real items, realistic amounts, and multi-currency or multi-subsidiary records if those
conditions apply.

**Skipping SIT and going directly to UAT.** The logic is usually "the build was
simple, let's just have users test it." The result is business users discovering
developer errors — which destroys confidence and wastes UAT time on issues that
should never reach business users.

**Calling a developer self-test "SIT."** A developer testing their own code is a
unit test, not SIT. SIT is an independent structured test against the spec, in a
controlled environment, with documented results. The developer may run the SIT tests,
but someone else must review the results.

**Getting BPO sign-off before all Medium defects are disclosed.** The BPO must know
what they are signing off on. If Medium defects are pending when sign-off is requested,
the BPO is unknowingly accepting unknown risks. Disclose all open defects before
requesting sign-off.

---

## 6. Test Coverage vs. RTM: The Connection

The RTM (from ns-solution-architect's `assets/RTM_Template.csv`) has a Test Case ID
column and a UAT Status column that are filled in during Phase 5.

Every RTM row must map to at least one test case before go-live. The mechanical process:

1. Open the RTM. For each row, identify which SIT test case covers this requirement.
   Enter the Test Case ID (e.g., `SIT-O2C-03`).
2. After UAT, update the UAT Status column for every row: Pass, Fail, or Deferred.
3. Any row with no Test Case ID is a coverage gap — it must be addressed before
   the RTM can be declared complete.
4. Any row with UAT Status = Fail that has not been accepted by the business sponsor
   is a go-live blocker.

A complete RTM is not just a document — it is the audit trail that proves every
requirement the business requested in Phase 1 was designed, built, and tested.
