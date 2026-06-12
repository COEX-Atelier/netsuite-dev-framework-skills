# SIT vs. UAT Protocols

## 1. The Fundamental Difference

SIT (System Integration Testing) answers: **"Does what was built match what was designed?"**

UAT (User Acceptance Testing) answers: **"Does this work the way the business needs it to work?"**

These are different questions. A system can pass SIT and fail UAT. When that happens,
it is almost always a design failure — the spec was implemented correctly, but it
addressed the wrong requirement. The earlier this is caught in Phase 2 (Solution Design),
the cheaper it is to fix.

Business users should never encounter a defect that SIT should have caught. Every UAT
defect that is a SIT miss is a trust failure between the consulting team and the client.

---

## 2. SIT Protocol

### Who Runs SIT
Consultants and developers. Business users do not participate in SIT.

### Focus
Technical correctness: do integrations connect, do scripts execute without errors, does
data flow through the system correctly, are field permissions enforced, do financial
postings hit the right GL accounts?

### SIT Test Coverage Requirements
- Every Customization Spec (CUST-XX-NN from Phase 2) must have at least one SIT test case
- Every Integration Spec (INT-XX-NN) must be tested end-to-end with the real endpoint — not mocked
- Standard configuration (custom fields, forms, roles) is covered by functional smoke tests
- Regression scope (brownfield only): see Section 5

### SIT Test Evidence Requirements
A SIT test case is not passed by verbal confirmation. Evidence must be recorded:
- Screenshot of the successful result in the test environment
- Log output confirming the script executed without errors
- Export showing the expected record was created or updated correctly

"I tested it and it works" with no artifact is not a SIT pass.

### SIT Round Planning
Plan for at least two SIT rounds on Tier 3 projects and Tier 2 projects with
multiple interdependent customizations:

- **Round 1:** Initial execution — expect failures; the point is to find defects
- **Round 2:** Re-test after defect fixes

Re-run scope after a fix:
- If the fix touched isolated logic: re-test only affected test cases
- If the fix touched shared logic (utilities, base records, integration endpoints):
  re-run the full regression suite for that area

---

## 3. UAT Protocol

### Who Runs UAT
Business Process Owners (BPOs) and end-users. Consultants are present to answer
questions and log defects, but should not execute the test steps on behalf of the BPO.

If the consultant must run the steps because the BPO is unavailable or doesn't know
how, this is a training gap — not a UAT pass. Escalate to `ns-change-orchestrator`.

### Focus
Functional usability and business alignment: does this process solve the business
pain point, is the UI intuitive for a daily user, do the printed PDF layouts meet
brand standards, are the financial reports accurate and readable?

### UAT Session Structure
Each UAT session follows this sequence:

1. **Opening briefing** (15 min): Consultant walks the BPO through the session scope,
   the test data to use, and how to log defects. Confirm the environment is accessible.
2. **Scenario execution**: BPO executes each UAT script step by step. Consultant
   observes and takes notes but does not guide the execution.
3. **Defect logging**: Tester records actual vs. expected results in real time.
   Do not wait until the end of the session to document failures.
4. **Closing review** (15 min): Walk through results together. Classify each
   open issue as Defect, Training Gap, or Enhancement Request.
5. **BPO sign-off**: BPO signs off on the session once all defects are logged.
   Sign-off does not mean "no defects" — it means "I have reviewed the results and
   accept the documented state."

### What Fails UAT That Passes SIT (Common Examples)
- Process technically works but requires 12 clicks where the old process required 3
- A report is numerically accurate but the column layout is illegible on a printed page
- A workflow approval requires a role the named approver doesn't have in production
- PDF outputs are functionally correct but do not match brand standards
- An integration works in SIT but fails with production data volumes or credentials

---

## 4. SIT → UAT Handoff Ceremony

These activities must be completed before UAT begins:

- [ ] SIT exit criteria confirmed: 0 Critical open, 0 High open
- [ ] Defect log reviewed with client: all Medium defects disclosed, workarounds documented
- [ ] Test environment refreshed with clean, representative data (not SIT execution leftovers)
- [ ] UAT test data verified as loaded and accessible
- [ ] All BPOs notified of session schedule and have confirmed attendance
- [ ] UAT script package distributed to BPOs at least 24 hours before first session

---

## 5. [Brownfield] Parallel Run Protocol

### What a Parallel Run Is

For full ERP migrations, a parallel run means running the same business transactions
in both the legacy system and NetSuite simultaneously for a defined period, then
comparing financial outputs. This provides audit evidence that NetSuite produces
the same results as the system it is replacing.

Required for full brownfield migrations involving financial transactions.

### What to Compare
- GL balances by account (balance sheet and P&L)
- AR aging report (open invoices by customer)
- AP aging report (open bills by vendor)
- Open purchase orders and sales orders
- Inventory on-hand quantities (if in scope)
- Bank reconciliation totals

### Acceptable vs. Unacceptable Variance

**Acceptable:** Timing differences in accruals (e.g., a bill posted at end-of-day in
the legacy appears the next day in NetSuite due to time zone handling). Document the
cause and confirm it is systematic, not a defect.

**Not acceptable:** Any balance sheet account mismatch that cannot be traced to a
timing difference. Any AR/AP aging discrepancy that cannot be explained.

### Legacy System Shutdown Criteria

Define these in the Test Plan before the parallel run begins:

- [ ] GL balances reconcile within approved variance for N consecutive business days
- [ ] All open AR/AP items validated in NetSuite
- [ ] Inventory counts verified (if applicable)
- [ ] Finance team sign-off on reconciliation results

---

## 6. [Brownfield] Regression Testing Protocol

### What Regression Testing Is

Regression testing confirms that existing business processes — the ones **not** being
changed — continue to work correctly after the new build is deployed.

This is the most commonly under-scoped obligation in brownfield projects. The assumption
"we didn't touch that, so it still works" is wrong often enough to cost real money.

### Defining the Regression Scope

1. List all operational business processes in the current NetSuite environment
2. Remove: processes being redesigned as part of this project
3. The remainder is the regression scope — document it in the Test Plan

A process not on the regression list is an accepted risk. The business sponsor should
know which processes are and are not being regression-tested.

### Regression Test Execution

- Regression tests run during SIT Round 1, before UAT begins
- Each regression test requires documented evidence (screenshot or result record)
- A regression defect in an untouched process defaults to **High** severity —
  something that was working is now broken
