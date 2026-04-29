# Fit-Gap Analysis: Order-to-Cash Process
**Project:** O25003 – NetSuite Migration
**Platform:** NetSuite OneWorld with Advanced Financials
**Document:** FGA_O2C – Order-to-Cash Functional Requirements
**Date:** 2026-04-29
**Author:** Solution Architecture Review

---

## Summary Table

| Req. ID | Requirement | Fit Classification | Effort Estimate | Risk Level |
|---|---|---|---|---|
| FR-O2C-01 | Sales order hold with reason code | Configuration | Small (1–3 days) | Low |
| FR-O2C-02 | Volume discount – 10% off for 100+ units same item | Configuration | Small–Medium (2–5 days) | Low–Medium |
| FR-O2C-03 | Invoice emailed to secondary billing contact | Customization | Medium (5–10 days) | Medium |
| FR-O2C-04 | Weekly sales commissions posted as journal entry | Customization | Medium–Large (10–20 days) | Medium–High |

---

## Detailed Analysis

---

### FR-O2C-01 – Sales Order Hold with Reason Code

**Requirement:**
Sales representatives must be able to place a sales order on hold and record a structured reason code explaining why the hold was applied.

**Fit Classification:** Configuration

**Fit Assessment:**
NetSuite natively supports order holds through the **Order Management** module. Sales orders can be set to a "Pending Approval" or custom order status. The platform supports custom transaction body fields (Custom Fields) that can capture a hold reason code using a dropdown list (Custom List). Workflow-driven status transitions (SuiteFlow) can enforce that a reason code is mandatory before an order is saved in a held state.

**Gap Description:**
There is no out-of-the-box "Hold with Reason Code" feature as a single turnkey function. The capability must be assembled from native building blocks:
- A custom order status or a custom checkbox/field to flag an order as on hold.
- A custom list of reason codes surfaced as a dropdown field on the Sales Order form.
- A SuiteFlow workflow to validate the reason code is populated when the hold flag is set and to restrict editing of held orders by unauthorized roles.

**Recommended Solution:**
1. Create a Custom List: `Hold Reason Code` (e.g., Credit Review, Inventory Shortage, Customer Request, Compliance Hold).
2. Add a Custom Body Field on Sales Order: `Hold Reason` (type: List, sourced from the custom list above); display conditionally or always visible.
3. Add a Custom Body Field or use a Custom Form checkbox: `On Hold` (type: Checkbox).
4. Build a SuiteFlow Workflow on Sales Order that:
   - Triggers on Before Record Save.
   - Validates: if `On Hold = True`, then `Hold Reason` must not be empty (display error if blank).
   - Optionally transitions the order status to a custom "On Hold" status to prevent fulfillment processing.
5. Set Role permissions so only authorized roles (e.g., Sales Manager, Order Management) can check/uncheck the hold flag.

**Effort Estimate:** Small — 1 to 3 days (configuration and workflow setup; no SuiteScript required unless advanced logic is needed).

**Risk Level:** Low — All required capabilities are native NetSuite configuration. Well-understood pattern with minimal regression risk.

---

### FR-O2C-02 – Volume Discount: 10% Off for Orders of 100+ Units of the Same Item

**Requirement:**
When a single line item on a sales order reaches 100 or more units, the system must automatically apply a 10% discount to that line without manual intervention by the sales representative.

**Fit Classification:** Configuration

**Fit Assessment:**
NetSuite's **Quantity Pricing Schedules** (available under Items > Pricing) natively support tiered/volume pricing at the item level. When enabled on an item, NetSuite automatically adjusts the unit price based on the quantity entered on the transaction line. This is the standard mechanism for volume discounts and requires no scripting.

**Gap Description:**
Minor gap exists in configuration scope and governance:
- Quantity pricing must be enabled globally (Setup > Accounting Preferences > Enable Quantity Pricing).
- Each item must have a pricing schedule configured individually, which could be labor-intensive if the item catalog is large.
- The 10% discount must be modelled as a price reduction relative to the base price, not as a separate discount line, unless the business wants an explicit discount line for reporting. If a visible discount line is required (e.g., for audit or commission calculation clarity), Quantity Pricing alone does not produce a separate discount amount — a different approach using a Discount Item or SuiteFlow would be needed.
- Quantity Pricing applies per transaction line (same item, same line). If the requirement extends to aggregating quantities of the same item across multiple lines on the same order, native Quantity Pricing will not handle this — a SuiteScript would be required.

**Recommended Solution (assuming single-line quantity, no cross-line aggregation):**
1. Enable Quantity Pricing in accounting preferences.
2. Create a Quantity Pricing Schedule: `Volume Discount – 100 Units`:
   - Tier 1: 1–99 units → 0% adjustment (base price).
   - Tier 2: 100+ units → Base Price × 0.90 (i.e., 10% off).
3. Assign the pricing schedule to all applicable items.
4. Validate on a test order that the price adjusts automatically at the 100-unit threshold.

**If cross-line aggregation is required (future consideration):**
A SuiteScript 2.x Client Script on Sales Order would be needed to sum quantities by item across lines and apply a discount field or recalculate pricing dynamically — this would elevate the classification to Customization and increase effort to Medium (5–8 days).

**Effort Estimate:** Small to Medium — 2 to 5 days (dependent on catalog size for bulk item configuration; setup itself is 1 day; item updates may require CSV import for large catalogs).

**Risk Level:** Low to Medium — The native feature is reliable. Risk increases if item catalog is large (data migration effort) or if cross-line aggregation is later confirmed as required (scope change).

---

### FR-O2C-03 – Invoice Emailed to Secondary Billing Contact (Not Just Primary)

**Requirement:**
Every customer invoice must be automatically emailed to a secondary billing contact in addition to the primary contact. The secondary contact is not the main billing contact on the customer record.

**Fit Classification:** Customization

**Fit Assessment:**
NetSuite's standard invoice emailing (via the **Email** button or automated invoice delivery via PDF/Email Preferences) sends the invoice to the primary email address on the customer or billing contact record. There is no native configuration to send to multiple contacts simultaneously without customization. The **Advanced PDF/HTML Templates** and **Email Capture** features do not natively support multi-recipient delivery at the transaction level.

**Gap Description:**
NetSuite does not natively support routing transaction emails to a list of contacts (primary + secondary) as a standard configuration. Specific gaps:
- The "Email Invoice" action sends to one recipient (the primary bill-to contact or customer email).
- There is no out-of-the-box "CC" or "Additional Recipients" field on invoice email delivery for automated sends.
- A secondary billing contact needs a defined home in the data model (custom field on Customer or Contact record) and a mechanism to trigger the email.

**Recommended Solution:**
1. **Data Model:** Add a Custom Field on the Customer record: `Secondary Billing Contact Email` (type: Email or Free-Form Text). Alternatively, use the Contacts sublist with a custom checkbox `Secondary Billing Contact` to allow proper Contact record management.
2. **Automation via SuiteScript (User Event or Workflow Action Script):**
   - Create a SuiteScript 2.x **User Event Script** (After Submit, on `create` and `edit` of Invoice) or a **Workflow Action Script** triggered by a SuiteFlow on Invoice creation.
   - Script logic:
     a. Load the Invoice record.
     b. Retrieve the customer's secondary billing contact email from the Customer record.
     c. If the secondary email is populated, send an additional email using `N/email` module with the invoice PDF (rendered via `N/render` module using the standard or custom invoice template).
     d. Log the send event for audit purposes.
3. **Template:** Reuse the existing Advanced PDF invoice template so the secondary contact receives the identical invoice document.
4. **Error Handling:** If the secondary email send fails, log a warning on the invoice record (custom field: `Secondary Billing Email Status`) and optionally alert an administrator — avoid blocking the primary send.

**Effort Estimate:** Medium — 5 to 10 days (includes: script development ~3 days, data model setup ~1 day, template configuration ~1 day, testing including edge cases ~2–3 days, UAT support ~1 day).

**Risk Level:** Medium — SuiteScript introduces a deployment and maintenance overhead. Email delivery failures must be handled gracefully so they do not affect invoice posting. Risk of duplicate sends if the script triggers on re-save of an invoice must be mitigated (idempotency check on the send status field).

---

### FR-O2C-04 – Weekly Sales Commissions Calculated and Posted as Journal Entry

**Requirement:**
Sales commissions must be calculated on a weekly basis based on sales activity and automatically posted to the general ledger as a journal entry.

**Fit Classification:** Customization

**Fit Assessment:**
NetSuite does not include a native sales commission calculation and automated journal entry posting module in the standard OneWorld + Advanced Financials offering. The **Incentive Compensation** module (formerly SuitePeople Incentive Compensation or the legacy Commission module) is an add-on that requires a separate license and is not included in the base Advanced Financials bundle. Even with the add-on, it may not cover all commission structures or the specific requirement to post a weekly JE automatically.

**Gap Description:**
Full gap — no native capability in scope:
1. No built-in commission calculation engine (without purchasing the Incentive Compensation add-on).
2. No automated weekly journal entry creation triggered by commission data.
3. Commission rules (rate per rep, per product, per tier, on invoiced vs. ordered amount, with clawbacks, etc.) are not defined in this analysis but will significantly affect solution complexity.
4. The GL accounts for commission expense and commission payable accrual must be defined.

**Recommended Solution:**

**Option A – SuiteScript Custom Solution (Recommended if Incentive Compensation module is not licensed):**
1. **Define Commission Rules:** Capture commission rates and eligibility rules in a Custom Record (`Commission Plan`) linked to Employees/Sales Reps and optionally to Item Categories or Customers.
2. **Scheduled Script (Weekly):** Create a SuiteScript 2.x **Scheduled Script** configured to run every Monday (or last day of the week) via a **Scheduled Script Deployment** with a recurring cron schedule.
   - Script logic:
     a. Query all invoices with status = Paid In Full or Posted (per business rule) within the prior week using `N/search`.
     b. For each invoice line, identify the assigned Sales Rep (from the transaction or from a custom field).
     c. Apply the applicable commission rate from the Commission Plan custom record.
     d. Aggregate commission amounts by Sales Rep and GL account.
     e. Create a Journal Entry via `N/record` with:
        - Debit: Commission Expense account (per department/subsidiary if multi-sub).
        - Credit: Commission Payable / Accrued Commission account.
        - Memo: "Weekly Commission Accrual – Week ending [date]".
        - Attach supporting detail (saved search result) to the JE as a note or file attachment.
3. **Approval Workflow (optional but recommended):** Route the auto-created JE through a SuiteFlow approval workflow before posting, so Finance can review before GL impact.
4. **Reporting:** Create a Saved Search or SuiteAnalytics Workbook for commission detail by rep/week for reconciliation.

**Option B – Incentive Compensation Add-On Module:**
If the business intends to manage commissions long-term with complex plans, evaluate licensing NetSuite's Incentive Compensation module. This reduces custom scripting but requires additional license cost, implementation, and plan configuration. The JE automation may still require scripting unless the module's native posting feature covers the requirement.

**Effort Estimate:** Medium to Large — 10 to 20 days (includes: requirements gathering for commission rules ~2 days, data model design ~1 day, script development ~5–7 days, GL account setup ~1 day, testing and reconciliation validation ~3–4 days, UAT and sign-off ~2 days). Effort scales significantly with commission rule complexity (tiers, products, clawbacks, splits).

**Risk Level:** Medium to High —
- Commission calculation errors have direct financial and HR impact (underpayment/overpayment of sales reps).
- Automated JE posting requires strict testing against GL period controls and subsidiary accounting rules (OneWorld multi-subsidiary considerations).
- Commission rule ambiguity at requirements stage is the leading risk; a detailed commission rules workshop is recommended before development begins.
- Data dependency: script relies on accurate Sales Rep assignment on transactions and clean invoice data.

---

## Assumptions and Constraints

1. The platform is **NetSuite OneWorld with Advanced Financials**. No additional modules (Incentive Compensation, Advanced Order Management, etc.) are assumed to be licensed unless stated.
2. FR-O2C-02 assumes volume discounts apply **per line** (single item, single line quantity threshold). Cross-line aggregation is out of scope unless confirmed.
3. FR-O2C-03 assumes one secondary billing contact per customer. Multiple secondary contacts would require a more complex data model (custom sublist or related record).
4. FR-O2C-04 commission rules are not fully defined. This analysis assumes a straightforward flat-rate or tiered-rate structure per sales rep. Complex multi-split, retroactive, or draw-based plans will increase effort significantly.
5. All customizations (SuiteScript, SuiteFlow) must be deployed and maintained in a Development → Sandbox → Production promotion cycle consistent with the project's change management process.
6. All journal entries created automatically (FR-O2C-04) will be subject to the client's GL period controls and approval policies.

---

## Risk Register Summary

| Req. ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| FR-O2C-01 | Workflow logic too restrictive, blocking valid order edits | Low | Medium | Thorough UAT with Sales and Order Management teams |
| FR-O2C-02 | Cross-line aggregation requirement identified post-implementation | Medium | Medium | Confirm scope in requirements workshop; document exclusion explicitly |
| FR-O2C-03 | Duplicate invoice emails on re-save of invoice | Medium | Medium | Implement idempotency check (send-status flag) in script |
| FR-O2C-03 | Secondary email address not maintained in customer data | Medium | Low | Include data governance process and field validation |
| FR-O2C-04 | Commission rule ambiguity causes calculation errors | High | High | Conduct commission rules workshop; obtain sign-off on rules document before dev |
| FR-O2C-04 | Automated JE posted in closed GL period | Low | High | Add period-open validation in script; alert Finance if period is closed |

---

## Recommended Next Steps

1. **FR-O2C-01 & FR-O2C-02:** Schedule a 1-hour configuration workshop with Order Management and Sales Operations to confirm hold reason code values and volume discount scope (single-line vs. cross-line). These can be delivered in Sprint 1.
2. **FR-O2C-03:** Confirm the data model for secondary billing contacts (single email field vs. full Contact record). Initiate data cleansing to populate secondary billing emails in existing customer records.
3. **FR-O2C-04:** Conduct a Commission Rules Workshop (2–3 hours) with Sales Leadership and Finance to document all commission plan rules, eligible transaction types, GL accounts, and approval requirements before any development begins. This is the highest-risk item and must be resolved before estimation can be finalized.
4. **Licensing Review:** Confirm with NetSuite Account Manager whether the Incentive Compensation module is available or cost-justified given commission plan complexity (FR-O2C-04 Option B evaluation).

---

*End of Document*
