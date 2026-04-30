# Phase 7: Go-Live and Support

## Goal

Execute the transition from legacy systems to NetSuite Production with zero data loss, no material business disruption, and a structured hypercare program that stabilizes the business in the first weeks after launch.

Go-live is not the finish line — it's the start of the most critical support window. A clean cutover followed by poor hypercare is still a failed implementation.

---

## Methodology Scaling

Before starting activities, check `PLAN.md` for the confirmed **Tier** and **Origin**.

| Activity | Tier 1 (Full) | Tier 2 (Module) | Tier 3 (Tiny) |
| :--- | :--- | :--- | :--- |
| **Go/No-Go Meeting** | Formal meeting with full project team | Senior stakeholders + Project Lead | Email confirmation from sponsor |
| **Cutover Runbook** | Minute-by-minute with full team war room | Task-based with clear owners | Simple Deployment Checklist |
| **Data Migration** | Full Master + Transactional | Delta/Master updates only | Smoke test configuration only |
| **Hypercare** | 4–8 weeks; daily stand-ups | 2 weeks; triage queue only | 1 week; point-of-contact only |

---

## Pre-Launch Checklist (2 Weeks Before Cutover)

Run this checklist at the formal Go/No-Go meeting. Every item must be green before cutover weekend is confirmed.

### Phase Gate Confirmations

- [ ] UAT formally signed off by client business owner (Phase 5 complete)
- [ ] Training completion ≥ 90% of target user base (Phase 6 complete)
- [ ] All High and Critical defects from UAT resolved and regression-tested
- [ ] RTM (Requirements Traceability Matrix) shows 100% of requirements tested

### Technical Readiness

- [ ] Production NetSuite account provisioned and configured (Company Info, features enabled, subsidiaries, currencies)
- [ ] All custom scripts deployed to production and smoke-tested
- [ ] All custom forms, fields, and records deployed and confirmed on production forms
- [ ] All integrations deployed and connectivity confirmed (test calls to/from production)
- [ ] User accounts created in production — roles and permissions validated for a representative sample
- [ ] Email templates, PDF templates, and branding confirmed in production
- [ ] Opening balances prepared and agreed with Finance (trial balance sign-off)

### Data Migration Readiness

- [ ] Final data migration dry-run completed in staging environment
- [ ] Dry-run error rate is within the agreed acceptance threshold (typically < 1% of records)
- [ ] All migration errors from the dry-run have been investigated; root causes resolved
- [ ] Data owners have signed off on migrated data accuracy
- [ ] Delta migration strategy defined (what changes between dry-run and cutover?)

> **Note:** Skip Data Migration Readiness for **Greenfield** projects (unless loading opening balances from external sheets).

### Operational Readiness

- [ ] Cutover runbook finalized (minute-by-minute schedule with owners and durations)
- [ ] Cutover runbook dry-run completed or walk-through conducted with the full cutover team
- [ ] Legacy system freeze timeline communicated to all stakeholders
- [ ] Rollback plan documented and sponsor-approved

> **Note:** Skip "Legacy system freeze" for **Greenfield** projects.

- [ ] Rollback trigger criteria defined (e.g., "if production validation fails by Sunday 18:00, rollback")
- [ ] Hypercare team roster confirmed (names, roles, on-call coverage)
- [ ] Help desk / support channel activated (email, Teams/Slack channel, ticket system)
- [ ] Communication plan sent to all users: what's changing, when, what to do if they have issues

---

## Cutover Sequencing

### Recommended Cutover Window

**Start:** Friday evening (17:00–18:00) after business close
**Target end:** Monday morning (08:00) business open on NetSuite

This provides a ~60-hour working window with a safety buffer. Never plan a weekday cutover unless the business window is under 4 hours.

### Cutover Phases

**Phase A — Pre-Freeze (1–2 days before cutover)**
- Communicate legacy system freeze: no new transactions after [date/time]
- Complete any in-flight transactions in the legacy system before freeze
- Generate final reports from the legacy system (AR aging, AP aging, inventory snapshot)
- Prepare final data extract files

**Phase B — Production Setup (Friday evening)**
- Enable production account features (company preferences, accounting periods, tax settings)
- Deploy any last configuration items (roles, workflows, scripts — should already be done in pre-launch)
- Validate all integrations are disabled/paused during cutover to prevent race conditions

**Phase C — Master Data Load (Friday night)**
- Load in this order: Items → Chart of Accounts → Vendors → Customers → Employees
- Run validation searches after each load. Zero-tolerance for duplicate records.
- Log record counts: expected vs. actual. Investigate any discrepancy before proceeding.

**Phase D — Opening Balances & Transactional Data (Saturday)**
- Load GL opening balances (agreed trial balance)
- Load open transactions: open POs, open SOs, open invoices, open vendor bills
- Load historical transactions if in scope (prior periods, for reporting)
- Run balance validation: does NetSuite trial balance match the agreed opening balance?

**Phase E — Validation & Testing (Saturday afternoon)**
- Smoke test all critical process paths: place an order, create a PO, post a JE, generate an invoice
- Test all integrations end-to-end
- Verify user access for at least one user per role
- Finance validates opening balances and aging reports

**Phase F — Go/No-Go Decision (Saturday evening)**
- Project Manager and Sponsor review validation results
- All checkpoint sign-offs collected
- If all green: proceed to Phase G
- If yellow/red: assess against rollback trigger criteria — escalate to sponsor

**Phase G — Enable Users & Go-Live (Sunday)**
- Create/activate user logins (or confirm single sign-on is working)
- [ ] Send "You are now live on NetSuite" communication to all users
- [ ] Reactivate integrations in sequence, verify data flows
- [ ] Monitor transaction activity in real time for the first hours
- [ ] **Update `PLAN.md` to reflect 'Live' status and Hypercare phase**


---

## Rollback Plan

A rollback plan is not a sign of lack of confidence — it's responsible project management. Define it before cutover weekend, not during.

### Rollback Trigger Criteria

Define specific, measurable triggers. Example:

| Trigger | Action |
|---------|--------|
| Trial balance doesn't reconcile by Saturday 14:00 after two correction attempts | Invoke rollback |
| More than 5% of master data records have unresolvable errors | Invoke rollback |
| Critical integration (e.g., e-commerce) fails to connect after 3 hours of troubleshooting | Invoke rollback |
| Go/No-Go decision not achievable by Sunday 06:00 | Invoke rollback |

### Rollback Steps

1. Disable all NetSuite user access (prevent any transactions from being entered)
2. Notify all stakeholders immediately
3. Re-enable legacy system access
4. Communicate revised go-live date (typically 2–4 weeks later for a re-run)
5. Conduct same-day post-mortem: what failed and why?

**The point of no return:** Typically after GL opening balances are posted and transactions begin in NetSuite in earnest. After users have been active for more than a few hours, rollback becomes operationally impractical — this window must be explicitly defined in the runbook.

---

## Hypercare Strategy

### Duration

| Business Complexity | Hypercare Duration |
|--------------------|--------------------|
| Simple (single entity, standard modules) | 2 weeks |
| Medium (multi-module, one integration) | 4 weeks |
| Complex (OneWorld, multiple integrations, custom scripts) | 6–8 weeks |

### Hypercare Structure

**Daily stand-up (first 2 weeks):** 15-minute call with key stakeholders. Cover: issues logged since last stand-up, resolution status, blockers.

**Issue triage:** Every issue logged in the Hypercare Log must be triaged within 4 business hours:

| Issue Type | Response |
|------------|----------|
| System bug — incorrect behavior | Fix in sandbox, test, deploy to production. Communicate fix ETA. |
| Training gap — user doesn't know how to do something | Schedule targeted training session or send a how-to guide. |
| Process gap — the SOP doesn't match how NetSuite works | Update the SOP. Schedule a process review with the team. |
| Scope gap — something was missed in Discovery | Log as a change request. Assess effort and timeline. Do not ad-hoc fix. |

**Escalation path:**
1. Consultant → Project Manager (same day for P1/P2 issues)
2. Project Manager → Sponsor (next business day for unresolved P1)
3. Sponsor → NetSuite Support (for confirmed platform bugs)

### Issue Severity Levels

| Level | Description | SLA |
|-------|-------------|-----|
| P1 — Critical | Business cannot operate (unable to post transactions, all users locked out) | Respond in 1 hour; resolve or workaround in 4 hours |
| P2 — High | Core process blocked for a significant user group | Respond in 2 hours; resolve in 1 business day |
| P3 — Medium | Process works but with manual workaround | Resolve within the week |
| P4 — Low | Cosmetic, minor inconvenience | Next maintenance window |

### Hypercare Log Template

Track every issue in a shared document or ticket system:

| # | Date | Reporter | Description | Type | Severity | Owner | Status | Resolution | Root Cause |
|---|------|----------|-------------|------|----------|-------|--------|------------|------------|

---

## Project Wrap-Up

### Post-Mortem (within 2 weeks of go-live)

Hold a 1-hour retrospective with the full project team. Cover:
- What went well? (Capture for future projects)
- What didn't go as planned? (Root cause, not blame)
- What would we do differently?
- Were the project objectives met? (Compare against the success criteria in the Project Charter)

### Handover Package

Before the implementation team exits, deliver to the long-term support team:

| Document | Contents |
|----------|----------|
| Solution Overview | Summary of all customizations, integrations, and key configuration decisions |
| Customization Specs | All CUST-XX-NN specs from Phase 2/3 |
| Integration Specs | All INT-XX-NN specs with credentials guidance (never store credentials in docs) |
| Admin Guide | How to manage users, roles, custom lists, and period close |
| Data Dictionary | All custom fields, records, and their purpose |
| Known Issues Log | Any open items from hypercare being transitioned to FMA |
| SLA Agreement | Response time, maintenance windows, upgrade support terms |

### Transition to FMA (Functional Managed Agreement / Ongoing Support)

- Define the support tier: break-fix only, or proactive optimization?
- Agree on the upgrade testing process (NetSuite releases twice yearly)
- Establish the change request process for future enhancements
- Schedule a 30-day and 90-day health check
