# Customization Specification: CUST-O2C-03

---

## Spec Header

| Field            | Value                                                        |
|------------------|--------------------------------------------------------------|
| **Spec ID**      | CUST-O2C-03                                                  |
| **Title**        | Auto-Populate Estimated Ship Date from Item Lead Time        |
| **Type**         | Client Script                                                |
| **Record Type**  | Sales Order (`salesorder`)                                   |
| **Trigger(s)**   | `fieldChanged`, `sublistChanged` (Items sublist)             |
| **Status**       | Draft                                                        |
| **Version**      | 1.0                                                          |
| **Author**       | Solution Architect                                           |
| **Date Created** | 2026-04-29                                                   |
| **Last Updated** | 2026-04-29                                                   |
| **Project**      | O25003 — NetSuite Migration                                  |
| **Process Area** | Order-to-Cash (O2C)                                          |

---

## Business Context

### Background

In the current order fulfillment process, sales representatives manually enter or estimate the Estimated Ship Date on Sales Orders. This manual step introduces delays and errors: reps either omit the date, set an overly optimistic date that ignores actual item lead times, or spend time cross-referencing procurement or inventory data.

Each item in the NetSuite Item catalogue carries a custom field (`custitem_lead_time_days`) that records the number of business days required to source or manufacture the item before it can be shipped. This field is maintained by the Supply Chain or Purchasing team and represents the most accurate, up-to-date lead time available in the system.

### Business Need

When a Sales Order is being created or edited, the Estimated Ship Date should be automatically calculated and surfaced to the sales rep as soon as they add or change a line item. If multiple items with different lead times appear on the same order, the longest lead time must govern the ship date — the order cannot ship until every item is ready.

### Business Value

- Reduces manual data entry errors and omissions on Sales Orders.
- Ensures customer-facing ship dates are realistic and based on actual item data.
- Decreases order entry time for sales representatives.
- Improves downstream fulfillment accuracy and customer satisfaction.

---

## Trigger and Scope

### Script Type

`ClientScript` — executes in the browser (or SuiteCommerce context) on the Sales Order entry form.

### Entry Point Functions Used

| Entry Point         | NetSuite API Function Name | Purpose                                                  |
|---------------------|----------------------------|----------------------------------------------------------|
| `fieldChanged`      | `fieldChanged(context)`    | Fires when a field on the Items sublist changes value.   |
| `pageInit`          | `pageInit(context)`        | Recalculates on form load to handle existing line items. |

### Why `fieldChanged` and Not `sublistChanged`

`sublistChanged` fires after the entire sublist row is committed (i.e., when the user moves to the next line or saves). `fieldChanged` fires immediately when a specific field value is changed, allowing real-time feedback to the sales rep. Both entry points are considered, but `fieldChanged` is the primary trigger for responsiveness.

`pageInit` is included to ensure the field is correctly populated when an existing Sales Order is opened in Edit mode that already has line items.

### Scope

- **Applies to:** Sales Order record in Create and Edit modes.
- **Does not apply to:** View mode, other transaction types, or server-side contexts.
- **Sublist targeted:** `item` (the Items sublist on Sales Order).
- **Field triggering recalculation:** Any change to the `item` field (item selection) or the `quantity` field within the Items sublist. The item selection is the primary trigger since lead time is item-specific.

---

## Affected Records and Fields

### Records

| Record       | Internal ID    | Role                                          |
|--------------|----------------|-----------------------------------------------|
| Sales Order  | `salesorder`   | Host record; Estimated Ship Date is written here. |
| Item         | `inventoryitem`, `noninventoryitem`, `assemblyitem`, etc. | Source of lead time data. |

### Fields

| Record       | Field Label              | Field ID                      | Field Type | Notes                                                                 |
|--------------|--------------------------|-------------------------------|------------|-----------------------------------------------------------------------|
| Sales Order  | Estimated Ship Date      | `shipdate`                    | Date       | Standard NetSuite field. Written by this script.                      |
| Sales Order  | Transaction Date         | `trandate`                    | Date       | Used as the base date for lead time calculation.                      |
| Sales Order (Items sublist) | Item    | `item`                        | List/Record | Triggers recalculation when changed.                                 |
| Sales Order (Items sublist) | Quantity | `quantity`                 | Integer/Decimal | Included as a secondary trigger in case quantity change affects fulfillment logic in future. |
| Item         | Lead Time (Days)         | `custitem_lead_time_days`     | Integer    | Custom field. Number of calendar (or business) days to source/make the item. |

> **Assumption:** `custitem_lead_time_days` is a positive integer representing calendar days. If the field is empty or zero for a given item, that item does not contribute to the lead time calculation (treated as 0).

---

## Business Logic

### Overview

When any item field changes on the Items sublist, the script:
1. Iterates over all lines in the Items sublist.
2. For each line, retrieves the value of `custitem_lead_time_days` from the associated Item record.
3. Determines the maximum lead time across all lines.
4. Adds that number of days to the Sales Order's Transaction Date (`trandate`).
5. Sets the result as the Estimated Ship Date (`shipdate`) on the Sales Order header.

### Date Calculation

The calculation uses **calendar days**, not business days, unless a future requirement specifies otherwise. The base date is `trandate` (the order date). If `trandate` is not set, today's date is used as a fallback.

### Pseudocode

```
FUNCTION fieldChanged(context):
    IF context.sublistId != 'item' THEN
        RETURN  // Not the items sublist — exit early
    END IF

    IF context.fieldId NOT IN ['item', 'quantity'] THEN
        RETURN  // Not a field we care about — exit early
    END IF

    recalculateEstimatedShipDate(context.currentRecord)


FUNCTION pageInit(context):
    IF context.mode == 'edit' OR context.mode == 'create' THEN
        recalculateEstimatedShipDate(context.currentRecord)
    END IF


FUNCTION recalculateEstimatedShipDate(currentRecord):
    lineCount = currentRecord.getLineCount({ sublistId: 'item' })

    IF lineCount <= 0 THEN
        // No lines present — clear the Estimated Ship Date or leave unchanged
        // Policy decision: leave existing value untouched if no lines
        RETURN
    END IF

    maxLeadTime = 0

    FOR i = 0 TO lineCount - 1:
        itemId = currentRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: i
        })

        IF itemId IS NULL OR itemId IS EMPTY THEN
            CONTINUE  // Skip blank lines
        END IF

        leadTimeDays = currentRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'custitem_lead_time_days',
            line: i
        })

        // Coerce to integer; treat null/undefined/non-numeric as 0
        leadTimeDays = parseIntSafe(leadTimeDays, defaultValue: 0)

        IF leadTimeDays < 0 THEN
            leadTimeDays = 0  // Guard against negative values
        END IF

        IF leadTimeDays > maxLeadTime THEN
            maxLeadTime = leadTimeDays
        END IF
    END FOR

    // Determine base date
    tranDate = currentRecord.getValue({ fieldId: 'trandate' })

    IF tranDate IS NULL OR tranDate IS EMPTY THEN
        tranDate = TODAY()
    END IF

    // Add maxLeadTime calendar days to tranDate
    estimatedShipDate = addCalendarDays(tranDate, maxLeadTime)

    // Write the result back to the header field
    currentRecord.setValue({
        fieldId: 'shipdate',
        value: estimatedShipDate,
        ignoreFieldChange: true  // Prevent re-entrant trigger loops
    })


FUNCTION addCalendarDays(baseDate, days):
    result = new Date(baseDate)
    result.setDate(result.getDate() + days)
    RETURN result


FUNCTION parseIntSafe(value, defaultValue):
    parsed = parseInt(value, 10)
    IF isNaN(parsed) THEN
        RETURN defaultValue
    END IF
    RETURN parsed
```

### Reading `custitem_lead_time_days` on the Sublist

In NetSuite Client Scripts, custom item fields that are configured to appear on transaction sublists can be read directly via `getSublistValue`. This requires that `custitem_lead_time_days` has the **"Show on Transactions"** option enabled and is set to display on the Sales Order Items sublist. If this is not configured, a `nlapiLoadRecord` / `record.load` call would be needed inside the loop — which is a synchronous REST call and should be avoided in Client Scripts for performance reasons.

> **Configuration prerequisite:** Verify that `custitem_lead_time_days` is configured to display on the Sales Order Items sublist. If not, a deployment-time configuration change is required before the Client Script can read it via `getSublistValue`.

---

## Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-01 | A line item has no value in `custitem_lead_time_days` (field is blank). | Treat as 0 days. That item does not contribute to the maximum. |
| EC-02 | `custitem_lead_time_days` contains a non-numeric or negative value. | Treat as 0 days. The `parseIntSafe` guard handles NaN; negative values are clamped to 0. |
| EC-03 | All line items have a lead time of 0. | Estimated Ship Date is set to `trandate` (same-day ship). |
| EC-04 | The Sales Order has only one line item. | Maximum lead time equals that item's lead time; Estimated Ship Date calculated normally. |
| EC-05 | A line is deleted, reducing the maximum lead time. | The script recalculates on the next `fieldChanged` trigger. Note: line deletion may not trigger `fieldChanged`; see Testing Notes for validation. |
| EC-06 | `trandate` is not yet populated (e.g., new order with no date set). | Fall back to today's date (`new Date()`) as the base for the calculation. |
| EC-07 | The sales rep has manually overridden `shipdate` before adding items. | The script overwrites the manual value. If manual override preservation is required, a header checkbox field (e.g., `custbody_manual_ship_date_override`) should be added to suppress script execution. This is a future enhancement. |
| EC-08 | A service or non-inventory item with no lead time field. | `getSublistValue` returns null; treated as 0. No error thrown. |
| EC-09 | The order is in View mode. | `pageInit` checks `context.mode`; no write attempted in View mode. |
| EC-10 | Multiple rapid field changes (user typing quickly). | Each `fieldChanged` invocation recalculates independently. Performance is acceptable because no server calls are made when the sublist field is visible on the form. |

---

## Error Handling

| Scenario | Handling Strategy |
|----------|-------------------|
| `getSublistValue` returns an unexpected type | `parseIntSafe` coerces the value and falls back to 0. No unhandled exception. |
| `currentRecord.setValue` fails (e.g., field is locked) | Wrap in a try/catch. Log the error to the browser console using `console.error`. Do not surface a blocking alert to the user — the failure is non-critical (ship date can still be set manually). |
| `trandate` is not a valid Date object | Wrap date construction in a try/catch. Fall back to `new Date()`. |
| `custitem_lead_time_days` field does not exist on the sublist | `getSublistValue` returns null; treated as 0. The calculation proceeds without error. A deployment-time check should confirm field availability. |

### Error Logging Pattern

```javascript
try {
    currentRecord.setValue({
        fieldId: 'shipdate',
        value: estimatedShipDate,
        ignoreFieldChange: true
    });
} catch (e) {
    console.error('[CUST-O2C-03] Failed to set shipdate: ' + e.message);
}
```

Errors are logged to the browser console with the prefix `[CUST-O2C-03]` for easy filtering during troubleshooting. No `alert()` or blocking dialogs are used.

---

## Testing Notes

### Test Environment

- **Environment:** NetSuite Sandbox (not Production).
- **Role:** Sales Rep role with standard Sales Order creation permissions.
- **Test Data:** At least 3 Item records with varying values of `custitem_lead_time_days` (e.g., 5, 10, 0), one item with the field blank.

### Test Cases

| TC ID | Description | Steps | Expected Result |
|-------|-------------|-------|-----------------|
| TC-01 | Single line item — lead time 10 days | Create Sales Order, add Item A (lead time = 10). | `shipdate` = `trandate` + 10 days. |
| TC-02 | Multiple lines — different lead times | Add Item A (lead time = 5) and Item B (lead time = 15). | `shipdate` = `trandate` + 15 days. |
| TC-03 | Multiple lines — lead time 0 on all | Add two items both with lead time = 0. | `shipdate` = `trandate` (same day). |
| TC-04 | Item with blank lead time field | Add Item A (lead time = 10) and Item C (lead time = blank). | `shipdate` = `trandate` + 10 days. Blank treated as 0. |
| TC-05 | Change item on existing line | Add Item A (lead time = 10), then change to Item B (lead time = 20). | `shipdate` updates to `trandate` + 20 days. |
| TC-06 | Remove highest-lead-time item | Add Item A (lead time = 20) and Item B (lead time = 5). Remove Item A. | `shipdate` recalculates to `trandate` + 5 days on next field interaction. |
| TC-07 | pageInit on existing order (Edit mode) | Open existing Sales Order with items in Edit mode. | `shipdate` is recalculated on page load without user interaction. |
| TC-08 | View mode — no modification | Open Sales Order in View mode. | `shipdate` is not modified. No JS errors in console. |
| TC-09 | trandate not set | Create Sales Order without setting Transaction Date, then add an item. | `shipdate` = today + lead time. |
| TC-10 | Negative lead time value in custom field | Item has `custitem_lead_time_days` = -5. | Treated as 0. `shipdate` = `trandate`. |
| TC-11 | Console error logging | Simulate a locked `shipdate` field condition (if testable). | Error logged to console with `[CUST-O2C-03]` prefix. No alert shown. |

### Regression Testing

After deployment, verify the following standard Sales Order behaviors are unaffected:
- Saving a Sales Order.
- Approving a Sales Order.
- Converting a Quote to a Sales Order.
- Creating a Sales Order from a Customer record.

---

## Deployment Information

### Script Deployment Record

| Property              | Value                                      |
|-----------------------|--------------------------------------------|
| Script Name           | CUST-O2C-03 Auto-Populate Ship Date        |
| Script ID             | `customscript_cust_o2c_03_shipdate`        |
| Script File           | `cust_o2c_03_shipdate.js`                  |
| Script Type           | Client Script                              |
| Deployment Record ID  | `customdeploy_cust_o2c_03_shipdate`        |
| Applied To            | Sales Order                                |
| Deployment Status     | Testing (promote to Released after UAT)    |
| Audience              | All Roles (or restrict to Sales Rep roles) |
| Log Level             | DEBUG (lower to ERROR in Production)       |

### SuiteScript 2.1 Module Dependencies

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([], function () {
    // No external modules required.
    // currentRecord is available via context object in Client Script 2.x.
});
```

No `N/record` load calls are made in this script (all data read from the sublist). No `N/search` module required.

---

## Governance and Performance

### Client Script Governance

NetSuite Client Scripts do not consume server-side governance units. However, the following performance considerations apply:

| Concern | Mitigation |
|---------|------------|
| Sublist iteration on large orders (many lines) | Iteration is O(n) over lines in memory. For typical Sales Orders (< 200 lines), this is negligible. No server calls in the loop. |
| `fieldChanged` firing on every keystroke | The script exits immediately (`RETURN`) if the sublist ID or field ID is not relevant, minimizing execution overhead. |
| Server round-trips | None. All data is read from the client-side record object. Requires `custitem_lead_time_days` to be on the sublist (see Configuration prerequisite above). |

### SuiteScript API Calls in This Script

| Call | Times Called per Trigger | Notes |
|------|--------------------------|-------|
| `currentRecord.getLineCount` | 1 | Constant cost. |
| `currentRecord.getSublistValue` (item) | n (one per line) | n = number of lines. |
| `currentRecord.getSublistValue` (lead time) | n (one per line) | Same loop as above. |
| `currentRecord.getValue` (trandate) | 1 | Constant cost. |
| `currentRecord.setValue` (shipdate) | 1 | Constant cost. |

Total: **2n + 3** client-side API calls per `fieldChanged` event, all in-memory. No governance impact.

---

## Governance Information

| Field               | Value                                      |
|---------------------|--------------------------------------------|
| Spec Owner          | NetSuite Solution Architect                |
| Business Owner      | Order Management / Sales Operations        |
| Development Owner   | NetSuite Development Team                  |
| Review Required     | Yes — Business Owner sign-off before UAT   |
| Change Control      | Standard change — sandbox testing required |
| Go-Live Approval    | UAT sign-off + Change Advisory Board (CAB) |
| Documentation       | Stored in project O25003 knowledge base    |
| Retirement Criteria | Replaced by native NetSuite ATP functionality or superseded by CUST-O2C-xx |

### Related Specifications

| Spec ID     | Title                                    | Relationship              |
|-------------|------------------------------------------|---------------------------|
| CUST-O2C-01 | (Placeholder — prior O2C customization) | Predecessor in O2C stream |
| CUST-O2C-02 | (Placeholder — prior O2C customization) | Predecessor in O2C stream |
| CUST-O2C-04 | (Placeholder — future O2C customization)| Potential successor       |

---

## Open Questions / Assumptions Log

| # | Question / Assumption | Status | Owner |
|---|-----------------------|--------|-------|
| OQ-01 | Does `custitem_lead_time_days` represent calendar days or business days? This spec assumes calendar days. | Open | Business Owner |
| OQ-02 | Should the script recalculate when a line is deleted? `fieldChanged` may not fire on line deletion — `sublistChanged` may be needed as a supplementary trigger. | Open | Developer |
| OQ-03 | Should `shipdate` be locked against manual edit once auto-populated, or can the rep override it? | Open | Sales Operations |
| OQ-04 | Is `custitem_lead_time_days` displayed on the Sales Order Items sublist? If not, a configuration change is required before development begins. | Open | NetSuite Admin |
| OQ-05 | Should the calculation consider weekends or holidays (i.e., business days)? A custom helper or `N/util` extension may be needed if so. | Open | Business Owner |
| OQ-06 | What is the expected behavior when a Sales Order is created via SuiteScript (server-side, e.g., from an integration)? Client Scripts do not execute server-side — a complementary User Event Script may be needed for non-UI creation paths. | Open | Solution Architect |

---

*End of Specification CUST-O2C-03*
