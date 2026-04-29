# Fit-Gap Analysis
<!-- Copy this file and rename it: FGA_[FunctionalArea].md (e.g., FGA_O2C.md) -->

## Document Header

| Field | Value |
|-------|-------|
| **Project** | [Project Name] |
| **Functional Area** | [e.g., Order-to-Cash / Procure-to-Pay / Record-to-Report] |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Version** | 0.1 Draft |
| **BRD Reference** | [Link or document name] |
| **Reviewed By** | [Name, Date] |

---

## How to Use This Template

**Fit Categories:**
- **S — Standard:** Requirement is fully met by NetSuite out-of-the-box with no configuration changes.
- **C — Configuration:** Met through NetSuite setup only — custom fields, saved searches, form layouts, approval routing, preferences. No code required.
- **X — Customization:** Requires SuiteScript (code) or SuiteFlow (workflow engine). Consult `references/design_decision_tree.md`.
- **O — Out-of-Scope:** Cannot be met by NetSuite. Requires a third-party tool, manual process, or a change to the business requirement.

**Effort Scale:**
- **S (Small):** < 4 hours
- **M (Medium):** 4–16 hours (1–2 days)
- **L (Large):** 16–40 hours (up to 1 week)
- **XL (Extra Large):** > 40 hours — flag for scope review

**Risk Level:**
- **Low:** Well-understood solution, similar work done before, no data migration impact
- **Medium:** Some complexity, dependencies on other areas, or limited prior precedent
- **High:** Novel approach, integration dependency, data migration risk, or impacts financial records

---

## Fit-Gap Table

| Req ID | Requirement Description | Priority | Fit | Gap Description | Recommended NetSuite Solution | Solution ID | Effort | Risk | Notes / Open Questions |
|--------|------------------------|----------|-----|-----------------|-------------------------------|-------------|--------|------|------------------------|
| FR-01 | *(example)* Customer prepayments must be applied to Sales Orders before fulfillment | High | S | None — feature exists natively | Enable Customer Deposits feature under Accounting Preferences | SDD-O2C §3.1 | S | Low | Confirm Deposits feature is enabled in sandbox |
| FR-02 | *(example)* Invoice PDF must display subsidiary logo based on the subsidiary on the transaction | Medium | C | NetSuite's Advanced PDF/HTML allows conditional logic in templates | Advanced PDF/HTML Template with `${record.subsidiary}` conditional | SDD-O2C §4.2 | M | Low | Need logo files from Marketing |
| FR-03 | *(example)* Sales Orders under $500 must be auto-approved without manager sign-off | Low | C | Native workflow can handle threshold-based approvals | SuiteFlow Workflow: `IF Amount < 500 THEN Set Approval Status = Approved` | CUST-O2C-01 | S | Low | Confirm $500 threshold with Finance |
| FR-04 | *(example)* Commission calculation based on tiered rates per product category, recalculated nightly | High | X | Complex multi-record logic — not achievable via configuration alone | Scheduled SuiteScript 2.1 Map/Reduce to calculate and write commission records nightly | CUST-O2C-02 | XL | High | Tiered rate table needs to be defined by Sales Ops |
| FR-05 | *(example)* Real-time two-way sync with Salesforce CRM for Opportunity and Customer data | High | X | External system integration — requires API layer | RESTlet or SuiteTalk REST integration with Salesforce | INT-SFDC-01 | L | High | Salesforce team must confirm webhook capability |
| FR-06 | *(example)* Bi-weekly export of GL transactions to legacy reporting tool (CSV) | Low | O | Tool is being decommissioned — no NetSuite solution needed | Retire requirement at go-live | N/A | S | Low | Confirm decommission date with IT |

---

## Summary

### Count by Fit Category

| Category | Count | % of Total |
|----------|-------|------------|
| Standard (S) | | |
| Configuration (C) | | |
| Customization (X) | | |
| Out-of-Scope (O) | | |
| **Total** | | 100% |

### High-Risk Items (flag for project sponsor review)

| Req ID | Risk Reason | Mitigation |
|--------|-------------|------------|
| | | |

### Open Questions Tracker

| # | Question | Owner | Due Date | Status |
|---|----------|-------|----------|--------|
| 1 | | | | Open |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Solution Architect | | | |
| Functional Lead | | | |
| Client Business Owner | | | |
