# Defect Triage Workflow

## 1. Purpose

Without severity classification, all defects are treated equally — which means either
everything blocks go-live or nothing does. Triage provides the framework for making
go/no-go decisions with evidence, not instinct.

A defect log without triage is a list of complaints. A triaged defect log is a
go-live instrument.

---

## 2. Severity Classification Decision Tree

Work through these questions in order. Assign the severity of the first question
that matches. When in doubt, assign higher.

### Step 1 — Is there a data integrity impact?
Does the defect cause any of:
- Incorrect financial postings or wrong GL entries
- Corrupted, duplicated, or silently deleted records
- Incorrect balances (AR, AP, inventory, bank)
- Data that will fail an audit

→ **CRITICAL**

### Step 2 — Is there a complete process failure with no workaround?
Can a core business process not be completed at all — and there is no manual
workaround available?

Examples: cannot create an invoice, cannot approve a purchase order, integration
silently drops records, a scheduled script throws a runtime error and stops.

→ **HIGH**

If the same failure exists but a documented workaround exists (even an inconvenient one):
→ **MEDIUM**

### Step 3 — Is there a partial process degradation?
Does the process complete, but something is wrong along the way?

Examples: an edge case fails, a non-critical field displays incorrectly, a report
format is wrong but the data is correct, a workflow sends the approval email late.

→ **MEDIUM**

### Step 4 — Is it cosmetic or a minor enhancement?
The process works correctly. The issue is a wrong label, spacing, color, PDF formatting
detail, or a "nice to have" suggestion.

→ **LOW**

---

## 3. Severity Reference Table

| Severity | Definition | Example |
| :--- | :--- | :--- |
| **Critical** | Data corruption, financial mispost, security exposure, or complete process failure with no workaround | Invoice posts to wrong GL account; AP bill creates duplicate payment; integration silently loses line items |
| **High** | Core process fails, no workaround — but data integrity is intact | User cannot save a Sales Order due to script error; approval workflow is stuck |
| **Medium** | Process works, experience is degraded, or an edge case fails | Discount calculation wrong for items over $10,000 (workaround: manual override); report runs 3x slower than expected |
| **Low** | Cosmetic, minor inconvenience, or post-go-live enhancement | Column header has wrong capitalization; PDF logo is slightly off-center |

---

## 4. Go/No-Go Decision Criteria

### Gate 1: SIT → UAT

| Open Defect State | Decision |
| :--- | :--- |
| Any Critical open | **Block UAT** — fix and re-test first |
| Any High open | **Block UAT** — fix and re-test affected area |
| Medium open (with workaround) | Proceed — document workaround in UAT notes |
| Low open | Proceed — log for post-go-live backlog |

### Gate 2: UAT → Go-Live

| Open Defect State | Decision |
| :--- | :--- |
| Any Critical open | **Block go-live** — no exceptions |
| Any High open | **Block go-live** — no exceptions |
| Medium open | Proceed **only if** BPO has reviewed and accepted each one in writing, with a committed fix date |
| Low open | Proceed — log for post-go-live backlog |

---

## 5. Deferred Defect Policy

**Critical defects cannot be deferred.** A Critical defect that cannot be resolved
before go-live means go-live must be postponed.

For all other severities, deferral is allowed only when all four conditions are met:

1. **Sponsor written acceptance** — the business sponsor (not just the project manager)
   acknowledges the defect in writing and accepts the go-live risk.
2. **Documented workaround** — a step-by-step workaround exists that business users
   can follow without consultant support.
3. **Committed resolution date** — a specific date no more than 60 days post go-live,
   with a named owner responsible for the fix.
4. **Deferred items log** — the defect appears in the Deferred Items section of the
   Test Summary Report, reviewed and signed off before go-live.

---

## 6. Root Cause Categories

Every defect in the Defect Log must have a Root Cause Category. This field generates
value after the project ends — it tells you which upstream process produced the defect
so you can improve it on the next engagement.

| Category | What It Signals |
| :--- | :--- |
| **Config** | Phase 3 configuration quality: fields, forms, saved searches, roles set up incorrectly |
| **Custom Code** | SuiteScript quality: either the spec was vague or the developer introduced a logic error |
| **Data** | Phase 4 data migration quality: migrated records are incorrect, missing, or malformed |
| **Integration** | Integration spec quality or external system behavior: payload mismatch, auth failure, mapping error |
| **Environment** | Test environment setup problem — the same issue would not appear in production; not a real defect |
| **User Error** | The tester performed the steps incorrectly — this is a training gap, not a defect. Reassign to `ns-change-orchestrator` |

If more than 30% of defects in a single category appear in one project, that upstream
phase deserves a retrospective.

---

## 7. Defect Triage Meeting Agenda (20 minutes)

Run this meeting daily during active SIT and UAT phases.

| Time | Agenda Item |
| :--- | :--- |
| 0–5 min | Review new defects logged since last meeting — confirm severity assignment |
| 5–12 min | Review all open Critical and High — confirm owner, target fix date, and blockers |
| 12–17 min | Review Medium defects — confirm workarounds are documented and BPO is aware |
| 17–20 min | Update go/no-go gate status — are we ready to advance to the next phase? |

Attendees: Lead Consultant, Developer(s), QA lead. BPO joins only if a Medium/Low
defect needs their acceptance decision.
