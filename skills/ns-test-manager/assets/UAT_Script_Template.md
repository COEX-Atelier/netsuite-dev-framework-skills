# UAT Script

<!-- One file per scenario. Name it UAT-[Area]-[NN].md (e.g., UAT-O2C-01.md)
     Realistic test data is not optional. Using placeholder data ("Customer A", 
     "Item 1", amounts of $100) produces false passes. Use actual customer IDs, 
     real items, realistic amounts, and multi-currency or multi-subsidiary records 
     if those conditions apply in production. -->

## Scenario Information

| Field | Value |
| :--- | :--- |
| **Scenario ID** | UAT-[Area]-[NN] (e.g., UAT-O2C-01) |
| **Process Area** | [e.g., Order-to-Cash] |
| **Business Process** | [e.g., Sales Order Entry to Invoice Generation and Payment Application] |
| **Business Context** | [Why does a real user perform this process? What business outcome does it produce? e.g., "The AR team creates an invoice from a fulfilled sales order and applies the customer's wire payment."] |
| **Tester Role** | [e.g., AR Manager — the person who owns this process day-to-day] |
| **Prerequisites** | [What must exist before this test can run? Be specific. e.g., "Customer ACME Corp (ID: 1234) must exist with active Net 30 terms and USD/EUR currency enabled. Sales Order #5500 must be created and fulfilled in full."] |
| **Test Data** | [Specific values to use — not placeholders. e.g., "Customer: ACME Corp (1234); Item: Widget Pro (WDGT-001), Qty 50, Price $125.00; PO# from customer: PO-2024-887"] |
| **Linked RTM Req IDs** | [e.g., FR-01, FR-03, FR-07] |
| **Test Environment** | [Sandbox URL / Account ID] |
| **[Brownfield] Compare to Legacy?** | [Y / N — if Y, complete the Legacy Comparison section below] |

---

## Happy Path Test Steps

| Step | Action | Expected Result | Actual Result | Pass / Fail | Comments |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Log in as [Role Name, e.g., AR Manager] | Dashboard loads. Relevant KPIs are visible. No error messages. | | | |
| 2 | Navigate to [Menu Path, e.g., Transactions > Sales > Create Invoices] | [Expected screen or list appears] | | | |
| 3 | [Action with specific data, e.g., Select SO #5500 and click "Bill"] | [Invoice record opens, pre-populated. Verify: Customer = ACME Corp, Amount = $6,250.00, Terms = Net 30] | | | |
| 4 | [Verification step, e.g., Confirm GL impact before saving] | [DR AR Trade $6,250 / CR Revenue $6,250 — verify in the GL Impact subtab] | | | |
| 5 | [Save action] | [Record saves successfully. Invoice number assigned. No script errors.] | | | |
| 6 | [Add steps as needed for the full scenario] | | | | |

---

## Exception Path Testing

<!-- At least one exception scenario is required per UAT script.
     Untested exception paths are where production incidents come from.
     Choose the exception most likely to occur in real use. -->

| Step | Action | Expected Result | Actual Result | Pass / Fail | Comments |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E-1 | [e.g., Attempt to save the invoice without entering a required field (e.g., remove the PO Number)] | [Error message appears: "PO Number is required for this customer." Record is not saved.] | | | |
| E-2 | [e.g., Attempt to bill a Sales Order that has already been fully billed] | [System prevents duplicate billing. Message: "This order has already been billed in full."] | | | |
| E-3 | [Add additional exception path if applicable] | | | | |

---

## [Brownfield Only] Legacy Comparison

<!-- Complete this section only if "Compare to Legacy?" = Y above.
     Run the same scenario in the legacy system (if still accessible) and record 
     the outputs side by side. Discrepancies are defects unless explained. -->

| Comparison Point | Legacy System Result | NetSuite Result | Match? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| GL Impact | [e.g., DR AR $6,250 / CR Revenue $6,250] | | [Y / N] | |
| Invoice Total | [$6,250.00] | | [Y / N] | |
| Tax Amount (if applicable) | [$0.00 — tax-exempt customer] | | [Y / N] | |
| PDF Output — Layout | [Reference screenshot from legacy] | | [Y / N] | |
| [Add comparison points relevant to this scenario] | | | | |

---

## Result Summary

| Field | Value |
| :--- | :--- |
| **Tester Name** | [Name] |
| **Date Executed** | [Date] |
| **Test Environment** | [Sandbox URL] |
| **Happy Path Result** | [Pass / Fail] |
| **Exception Path Result** | [Pass / Fail] |
| **[Brownfield] Legacy Comparison Result** | [Match / Mismatch / N/A] |
| **Overall Result** | [Pass / Pass with Conditions / Fail] |
| **Conditions (if applicable)** | [Describe any accepted conditions or open defects that do not prevent overall sign-off] |
| **Defects Logged** | [DEF-XXX, DEF-XXX — or "None"] |
| **BPO Sign-off** | [Name] |
| **Sign-off Date** | [Date] |
