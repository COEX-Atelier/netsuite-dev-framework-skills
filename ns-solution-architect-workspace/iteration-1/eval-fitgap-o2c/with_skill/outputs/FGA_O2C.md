# Fit-Gap Analysis

## Document Header

| Field | Value |
|-------|-------|
| **Project** | O25003 — NetSuite Migration |
| **Functional Area** | Order-to-Cash (O2C) |
| **Author** | NS Solution Architect |
| **Date** | 2026-04-29 |
| **Version** | 0.1 Draft |
| **BRD Reference** | O2C Requirements — April 2026 |
| **Reviewed By** | Pending |

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
| FR-O2C-01 | Sales reps must be able to place a Sales Order on hold and record a reason code explaining why the order is held. | High | C | NetSuite does not have a native "Hold" status with a picklist reason code on Sales Orders out-of-the-box. However, this is fully achievable through configuration: a custom body field for Hold Status and a custom reason code list, combined with a SuiteFlow workflow to restrict fulfillment while the hold flag is active. No SuiteScript is required because the logic (set a flag, block a status transition) is within SuiteFlow's capability. | (1) Create a custom checkbox field `custbody_order_on_hold` (label: "On Hold") on the Sales Order. (2) Create a custom List `customlist_hold_reason` with values defined by Sales Ops (e.g., Credit Review, Inventory Shortage, Customer Request, Other). (3) Create a custom body field `custbody_hold_reason` of type List/Record pointing to `customlist_hold_reason`, displayed only when `custbody_order_on_hold = T`. (4) Create a SuiteFlow Workflow on Sales Order: when On Hold = true, lock the "Approve" and "Pick/Ship/Bill" transitions and send an email notification to the sales rep's manager. (5) Add both fields to the Sales Order form used by sales reps. | CUST-O2C-01 | M | Low | Confirm the list of valid hold reason codes with Sales Ops before build. Confirm whether held orders should also be excluded from fulfillment queue saved searches. Decide whether a manager approval is required to release a hold — if yes, that is additional workflow logic. |
| FR-O2C-02 | Orders that contain 100 or more units of the same line item must automatically receive a 10% discount on that line. | High | X | NetSuite's native Quantity Pricing Schedules (standard feature) can apply tiered pricing per item at 100+ units, but only if a Pricing Schedule is configured per item. This works cleanly if the same pricing applies across all customers. If customer-specific pricing is required alongside this rule, or if the 10% must display as a visible discount line (rather than a reduced unit price), a Client Script or User Event Script is needed to compute and write the discount at order entry time. Given the requirement as stated (automatic, quantity-based, uniform 10%), Quantity Pricing Schedules are the preferred path — classified as Configuration — but a fallback Customization path is documented. **Decision: Attempt Configuration first via Quantity Pricing Schedules. If business rules require a discrete discount line or item-level overrides, escalate to a Client Script (CUST-O2C-02).** | **Primary (Configuration):** Enable Quantity Pricing under Setup > Accounting Preferences. For each affected item, configure a Quantity Pricing Schedule with a price break at Qty >= 100 applying a 10% reduction from base price. Assign the schedule to the item. NetSuite will automatically apply the discounted price when the rep enters 100+ units. **Fallback (Customization — if discrete discount line is required):** Client Script on Sales Order: `fieldChanged` event on the Quantity field on the sublist. If `quantity >= 100`, set `rate = basePrice * 0.90` on that line. User Event Script `beforeSubmit` serves as a server-side enforcement backstop. | SDD-O2C §3.2 / CUST-O2C-02 (fallback) | M | Medium | Clarify: Should the discount show as a reduced unit price, or as a separate Discount line item on the order? Clarify: Does this apply to all customers, or only specific customer categories? Clarify: Is the 100-unit threshold per line or per item across multiple lines on the same order? Confirm whether Quantity Pricing Schedules are already in use for other pricing tiers — conflicts must be resolved before enabling. |
| FR-O2C-03 | Every invoice must be automatically emailed to a secondary billing contact on the customer record, in addition to the primary billing contact. | High | X | NetSuite's standard Invoice email action (Send Email on Save, or the Email button) sends to the default billing contact or the "To Be Emailed" address on the customer record. It does not natively support a second recipient from a structured "secondary billing contact" relationship. This cannot be resolved through configuration alone — a secondary contact address either needs to be appended to the CC field dynamically or a post-save action must trigger a separate email. A SuiteFlow Workflow can handle this if the secondary contact's email is stored in a known custom field; however, reliably selecting the correct contact record from the Contacts sublist requires scripted logic. **Classification: Customization (X) — User Event Script is the most reliable approach.** | (1) On the Customer record, create a custom field `custentity_secondary_billing_email` (Free-Form Text, label: "Secondary Billing Email") OR designate a Contact Role "Secondary Billing" and use the Contacts sublist. The structured Contact Role approach is preferred for data integrity. (2) Deploy a User Event Script (`afterSubmit`, event: `create` and `edit`) on the Invoice record. Logic: when the invoice is created or marked "To Be Emailed", retrieve the customer's secondary billing contact (by role or custom field), and send a duplicate email using `N/email` module with the invoice PDF attached (rendered via `N/render`). (3) Ensure the script respects the "To Be Emailed" checkbox — only fire if the standard email flag is set, to avoid double-sends on manually processed invoices. | CUST-O2C-03 | L | Medium | Clarify: Is the secondary billing contact stored as a Contact record with a designated role, or as a free-text email field on the customer? This decision affects the data model and the script logic. Clarify: Should the secondary contact receive the exact same PDF as the primary, or a different template? Confirm whether this applies to all subsidiaries (OneWorld) or only specific ones. Confirm who maintains the secondary billing contact data — this is a data quality dependency. |
| FR-O2C-04 | Sales commissions must be calculated weekly and posted as a General Journal Entry in NetSuite. | High | X | NetSuite's Incentive Compensation module (if licensed) can calculate commissions, but does not automatically post journal entries on a weekly schedule — it requires manual export/import steps. Advanced Financials (licensed) provides manual journal entry creation but no native automated commission calculation. This requirement involves: (a) calculating commissions from closed sales data across multiple records, (b) aggregating by sales rep, and (c) posting a balanced journal entry — all of which require multi-record processing logic that exceeds what SuiteFlow can do. **Classification: Customization (X) — Scheduled SuiteScript 2.1 Map/Reduce.** | Deploy a Scheduled SuiteScript 2.1 using the Map/Reduce framework: **Schedule:** Weekly (e.g., Sunday night or Monday AM). **Map phase:** Search for all invoices/sales orders with a "Paid" or "Billed" status in the prior week, grouped by sales rep. **Reduce phase:** Apply the commission rate formula (rate table to be defined by Sales Ops — store in a Custom Record `customrecord_commission_rate`). **Summarize phase:** For each sales rep with a calculated commission, create a Journal Entry using the `N/record` module. Debit: Commission Expense account (per subsidiary). Credit: Commissions Payable account (per subsidiary). OneWorld: set `subsidiary` on each JE line per the sales rep's subsidiary. Advanced Financials: use department/class/location tracking on JE lines if required. Store a Commission Run record (`customrecord_commission_run`) per execution for audit trail. | CUST-O2C-04 | XL | High | Clarify: What is the commission rate structure? (Flat %, tiered by revenue, tiered by product category?) This determines complexity of the rate table and the Map phase. Clarify: Are commissions calculated on Invoices only, or also on Cash Sales and partially-paid invoices? Clarify: Which GL accounts should be debited/credited — confirm with Finance. Clarify: Is there a manager review/approval step before the JE posts, or does it post automatically? (If approval required, add a workflow approval gate before `record.save()`.) Clarify: OneWorld — single subsidiary or multi-subsidiary commission runs? If multi-subsidiary, intercompany elimination implications must be reviewed with Finance. Confirm: Does the business already use the Incentive Compensation module? If yes, assess whether it can be extended rather than building from scratch. |

---

## Summary

### Count by Fit Category

| Category | Count | % of Total |
|----------|-------|------------|
| Standard (S) | 0 | 0% |
| Configuration (C) | 1 | 25% |
| Customization (X) | 3 | 75% |
| Out-of-Scope (O) | 0 | 0% |
| **Total** | **4** | **100%** |

> **Note on FR-O2C-02:** This requirement is classified X (Customization) as the primary recommended path is Configuration via Quantity Pricing Schedules. If Configuration proves sufficient after validation with the business, the count would shift to 2C / 2X. The classification will be confirmed once open questions are resolved.

### High-Risk Items (flag for project sponsor review)

| Req ID | Risk Reason | Mitigation |
|--------|-------------|------------|
| FR-O2C-04 | Commission calculation posts directly to the General Ledger as a Journal Entry. Errors in the script logic (wrong rate, wrong account, wrong subsidiary) will produce incorrect financial records that require manual GL corrections. High data volume risk if commission rate table is complex or if multi-subsidiary runs are required. Scheduled script failure or timeout could mean a missed weekly run with no commissions posted. | (1) Build a Commission Run audit record so every execution is logged with totals and can be reconciled. (2) Include a dry-run mode that calculates but does not post JEs — Finance reviews before activating auto-post. (3) Implement error alerting via `N/email` to notify Finance when the script fails or produces zero results (which may indicate a logic error). (4) UAT must include end-to-end financial reconciliation against a manually calculated commission run. (5) Define a GL correction runbook for Finance if a bad run occurs. |
| FR-O2C-03 | Incorrect secondary billing contact data will cause invoices to be emailed to wrong recipients — a potential confidentiality and compliance issue. Dependency on data quality for a new customer field/contact role that does not currently exist. | (1) Validate the secondary billing email field at save time on the Customer record (Client Script or Workflow field validation). (2) Add the field to the Customer onboarding checklist / data migration template. (3) Consider an audit saved search: "Customers with invoices but no secondary billing contact" to surface data gaps. |
| FR-O2C-02 | If Quantity Pricing Schedules conflict with existing customer-specific pricing, the 10% discount may not apply correctly or may override negotiated rates unintentionally. | (1) Audit existing pricing schedules on all items before enabling. (2) Test the configuration path in sandbox with all customer price levels before go-live. (3) If conflicts exist, escalate to the Client Script fallback (CUST-O2C-02) which gives more granular control. |

### Open Questions Tracker

| # | Question | Owner | Due Date | Status |
|---|----------|-------|----------|--------|
| 1 | FR-O2C-01: What are the valid Hold Reason Code values? (e.g., Credit Review, Inventory Shortage, Customer Request, Other) | Sales Ops | TBD | Open |
| 2 | FR-O2C-01: Is a manager approval required to release an order hold, or can the sales rep self-release? | Business Owner | TBD | Open |
| 3 | FR-O2C-02: Should the volume discount appear as a reduced unit price or as a discrete Discount line item on the Sales Order? | Sales Ops / Finance | TBD | Open |
| 4 | FR-O2C-02: Does the 100-unit threshold apply per line, or is it an aggregate across all lines of the same item on the same order? | Sales Ops | TBD | Open |
| 5 | FR-O2C-02: Are Quantity Pricing Schedules already in use on any items? Potential conflict with proposed configuration. | NetSuite Admin | TBD | Open |
| 6 | FR-O2C-03: Is the secondary billing contact stored as a Contact record with a designated Contact Role, or as a free-text email on the Customer record? | Business Owner | TBD | Open |
| 7 | FR-O2C-03: Should the secondary billing contact receive the same invoice PDF template as the primary contact? | Finance | TBD | Open |
| 8 | FR-O2C-03: Does this requirement apply to all subsidiaries, or specific subsidiaries only? | Finance | TBD | Open |
| 9 | FR-O2C-04: What is the commission rate structure? (Flat %, tiered by revenue, tiered by product category, other?) | Sales Ops | TBD | Open |
| 10 | FR-O2C-04: Are commissions calculated on Invoices only, or also on Cash Sales and/or partially-paid invoices? | Finance | TBD | Open |
| 11 | FR-O2C-04: Which GL accounts (Debit: Commission Expense, Credit: Commissions Payable) should be used, and are they consistent across subsidiaries? | Finance / Controller | TBD | Open |
| 12 | FR-O2C-04: Is there a Finance review/approval step required before the Journal Entry posts, or should it post automatically? | Controller | TBD | Open |
| 13 | FR-O2C-04: Is the Incentive Compensation module currently licensed? If yes, can it be leveraged rather than building a custom solution? | NetSuite Admin | TBD | Open |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Solution Architect | | | |
| Functional Lead | | | |
| Client Business Owner | | | |
