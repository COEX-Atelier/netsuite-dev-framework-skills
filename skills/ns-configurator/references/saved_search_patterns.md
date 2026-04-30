# Saved Search Patterns

Common saved search designs for NetSuite implementations. Use these as starting points — adapt filters and columns to the specific SDD requirements.

---

## Pattern 1 — Transaction Status Dashboard

**Use case:** Operations team needs to see all open Sales Orders by status.

```
Search Type: Transaction
Filters:
  Type is Sales Order
  Status is any of: Pending Fulfillment, Partially Fulfilled, Pending Billing
  Main Line is True   ← CRITICAL: prevents duplicate rows from line-level joins

Columns:
  Internal ID (for script reference — hide in UI if not needed by users)
  Document Number (tranid)
  Date
  Customer (entity)
  Status
  Amount (Remaining)
  Expected Ship Date (custbody_o2c_expected_ship_date)

Sort: Date, Descending
Summary Type: (none — show individual rows)
Public: Yes
```

**Key note:** Always add `Main Line is True` to transaction searches unless you intentionally need one row per line item. Without it, a 10-line order produces 10 result rows.

---

## Pattern 2 — Pending Approval Queue

**Use case:** Approvers need to see records waiting for their action.

```
Search Type: Transaction (or Custom Record if approval log is a custom record)
Filters:
  custbody_o2c_approval_status is Pending Approval
  custbody_o2c_approver_role is [current user's role]   ← use {role} formula
  Main Line is True

Columns:
  Document Number
  Date
  Customer
  Amount
  custbody_o2c_submitted_date (label: "Submitted On")
  Days Pending: Formula (Numeric) = TRUNC(SYSDATE) - TRUNC({custbody_o2c_submitted_date})

Sort: Days Pending, Descending (oldest first)
Public: Yes
```

**Formula for days pending:**
```sql
TRUNC(SYSDATE) - TRUNC({custbody_o2c_submitted_date})
```

---

## Pattern 3 — Records Missing Required Data

**Use case:** Data quality check — find transactions where a required custom field is empty.

```
Search Type: Transaction
Filters:
  Type is Sales Order
  Status is any of: Pending Fulfillment, Pending Billing
  custbody_o2c_approval_status is empty      ← catches NULL and blank
  Main Line is True

Columns:
  Document Number
  Date
  Customer
  Status
  Created By

Public: No (internal data quality tool)
```

---

## Pattern 4 — Line-Level Detail Search

**Use case:** Purchasing needs to see all PO lines by item and expected delivery date.

```
Search Type: Transaction
Filters:
  Type is Purchase Order
  Status is any of: Pending Receipt, Partially Received
  ← Do NOT add Main Line is True — we need one row per line

Columns:
  Document Number (tranid)
  Vendor (entity)
  Item (line-level)
  Quantity (line-level)
  Rate (line-level)
  Expected Receipt Date (custcol_p2p_expected_receipt)
  Quantity Received (line-level)
  Quantity Remaining: Formula (Numeric) = NVL({quantity}, 0) - NVL({quantityreceived}, 0)

Sort: Expected Receipt Date, Ascending
```

**Warning:** Line-level searches return one row per line. A 20-line PO returns 20 rows. Use `Main Line is True` only when you need one row per document.

---

## Pattern 5 — Joined Search (Transaction + Customer Fields)

**Use case:** Finance needs transaction data alongside customer-specific custom fields.

```
Search Type: Transaction
Filters:
  Type is Invoice
  Status is Open
  Main Line is True

Columns:
  Document Number
  Date
  Customer
  Amount Due (Remaining)
  Customer > custentity_o2c_territory_code  ← joined field from Customer record
  Customer > custentity_o2c_credit_tier
  Days Overdue: Formula (Numeric) = TRUNC(SYSDATE) - TRUNC({duedate})

Sort: Days Overdue, Descending
```

**Join notation:** In the column picker, expand the "Customer Fields" section to access joined fields. These render correctly in the search UI but may need an alias in formulas.

---

## Pattern 6 — Summary / Aggregated Search

**Use case:** Management needs total sales by customer this month.

```
Search Type: Transaction
Filters:
  Type is Invoice
  Date: within this month
  Main Line is True

Columns (Summary Type shown in parentheses):
  Customer (Group)
  Customer Internal ID (Group — needed for scripts that process results)
  Amount (Sum) — label: "Total Invoiced"
  Count (Count of Internal ID) — label: "Invoice Count"
  Max Amount (Max) — label: "Largest Invoice"

Sort: Total Invoiced, Descending
Summary Type: Summary
```

**Rules for summary searches:**
- Every column must be either **Group** (dimension) or an **aggregate function** (Sum, Count, Min, Max, Average)
- You cannot mix summary and non-summary columns
- Filters on aggregate values use the "Summary Filter" section (not the main filter)

---

## Pattern 7 — Custom Record Search

**Use case:** Find all approval log entries for a given Sales Order.

```
Search Type: customrecord_o2c_approval_log
Filters:
  custrecord_o2c_log_sales_order is {sales_order_internal_id}   ← dynamic filter from script
  Status is Active

Columns:
  Internal ID
  custrecord_o2c_log_approver
  custrecord_o2c_log_action (Approved / Rejected)
  custrecord_o2c_log_date
  custrecord_o2c_log_comments

Sort: custrecord_o2c_log_date, Descending
Public: No (used only by SuiteScript — set to private to avoid UI clutter)
```

---

## Formula Reference

### Numeric Formulas
```sql
-- Days between two dates
TRUNC(SYSDATE) - TRUNC({fieldid})

-- Remaining amount (with NULL safety)
NVL({amount}, 0) - NVL({amountpaid}, 0)

-- Conditional value
CASE WHEN {status} = 'A' THEN 1 ELSE 0 END

-- Percentage of total
ROUND((NVL({quantityreceived}, 0) / NVL({quantity}, 1)) * 100, 2)
```

### Text Formulas
```sql
-- Concatenate fields
{entity.companyname} || ' — ' || {tranid}

-- Conditional label
CASE WHEN NVL({custbody_o2c_approved_amount}, 0) >= {amount} THEN 'Fully Approved' ELSE 'Partial' END

-- Extract part of a string
SUBSTR({custbody_o2c_ref_code}, 1, 4)
```

### Date Formulas
```sql
-- Is overdue
CASE WHEN TRUNC(SYSDATE) > TRUNC({duedate}) THEN 'Overdue' ELSE 'Current' END

-- Days in current state
TRUNC(SYSDATE) - TRUNC({custbody_o2c_status_changed_date})
```

**Always wrap nullable fields in `NVL(field, default)`.** A NULL in any arithmetic expression makes the entire formula result NULL.
