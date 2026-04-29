# Customization Specification

---

## Header

| Field | Value |
|-------|-------|
| **Spec ID** | CUST-O2C-03 |
| **Name** | Auto-Populate Estimated Ship Date from Item Lead Time on Sales Order |
| **Functional Area** | O2C |
| **Type** | Client Script (CS) |
| **Status** | Draft |
| **Author** | NS Solution Architect |
| **Date** | 2026-04-29 |
| **Version** | 0.1 |
| **Linked SDD** | SDD_O2C.md §3.x (Estimated Ship Date Automation) |
| **Linked RTM Rows** | FR-O2C-xx (to be assigned in RTM) |
| **Linked BRD Req IDs** | FR-O2C-xx (to be confirmed from BRD) |

---

## Type Reference

| Type | Script Type | When to Use |
|------|-------------|-------------|
| **Client Script (CS)** | SuiteScript 2.1 | Immediate UI feedback: field defaulting when user adds or changes a line item, before the record is saved |

> **Design decision rationale:** This requirement specifically calls for real-time UI feedback as the sales rep adds or changes line items. A User Event Script (server-side) would only update the field on save, giving no visual feedback during data entry. A SuiteFlow Workflow cannot reliably react to sublist line-level changes in real time in the UI. Client Script with a `lineInit` and `validateLine` / `sublistChanged` trigger is the correct pattern for immediate, in-session field derivation on a sublist.

---

## 1. Business Context

Sales representatives frequently add items to Sales Orders without knowing the correct Estimated Ship Date, leading to inaccurate customer commitments and fulfillment scheduling errors. Each item in the NetSuite item catalog carries a custom field `custitem_lead_time_days` representing the number of business days required to source and prepare that item. When an order contains multiple items with different lead times, the shipment cannot leave until all items are ready; therefore the longest lead time drives the Estimated Ship Date.

This customization auto-populates the `custbody_estimated_ship_date` field on the Sales Order header in real time — every time a line is added, changed, or removed — eliminating manual calculation and reducing customer delivery promise errors. Without it, sales reps must query item lead times manually and calculate the date themselves, which is error-prone and inconsistently applied.

---

## 2. Trigger & Scope

| Field | Value |
|-------|-------|
| **Record Type(s)** | Sales Order (`salesorder`) |
| **Trigger Event** | `sublistChanged` — fires after any change to the `item` sublist (line added, line modified, line removed). Additionally `pageInit` to populate the field on form load when editing an existing record with lines already present. |
| **Trigger Condition** | Always runs when the `item` sublist changes. If no lines are present, the Estimated Ship Date is cleared. |
| **Runs In** | UI only (Client Scripts do not execute during CSV import or API calls). No server-side equivalent is in scope for this spec — if API/import coverage is required, a companion User Event Script (CUST-O2C-04) should be created. |

---

## 3. Affected Records & Fields

| Record Type | Operation | Field Label | Field Internal ID | Field Type | Notes |
|-------------|-----------|-------------|-------------------|------------|-------|
| Sales Order | Read | Item (sublist) | `item` (sublist ID) | Sublist | Iterate all lines to collect lead times |
| Sales Order | Read | Item (line field) | `item` | List/Record | Line-level item reference — used to look up the item record |
| Sales Order | Write | Estimated Ship Date | `custbody_estimated_ship_date` | Date | Header field set to: today + max lead time days |
| Item (Inventory Item / Non-Inventory Item / etc.) | Read | Lead Time Days | `custitem_lead_time_days` | Integer | Custom field on the Item record; must exist prior to script deployment |

> **Note on item lookup:** Because Client Scripts cannot call `record.load` on arbitrary records at scale without risking governance issues, the item's `custitem_lead_time_days` value should be retrieved via a `search.lookupFields` call (SuiteScript N/search module). This is a single server call per unique item, not a full record load.

---

## 4. Business Logic

> This section contains the complete logic the developer must implement. The pseudocode is written in SuiteScript 2.1 idioms.

### 4.1 Decision Table / Pseudocode

```
/**
 * CUST-O2C-03 — Auto-Populate Estimated Ship Date from Item Lead Time
 * Script Type : Client Script (SuiteScript 2.1)
 * Triggers    : pageInit (mode = edit|create), sublistChanged (sublistId = 'item')
 * Modules     : N/record, N/search, N/format, N/log
 */

// ─── ENTRY POINT: pageInit ───────────────────────────────────────────────────
FUNCTION pageInit(scriptContext):
  IF scriptContext.mode IN ['edit', 'create', 'copy']:
    CALL recalculateEstimatedShipDate(scriptContext.currentRecord)
  END IF
END FUNCTION

// ─── ENTRY POINT: sublistChanged ─────────────────────────────────────────────
FUNCTION sublistChanged(scriptContext):
  IF scriptContext.sublistId = 'item':
    CALL recalculateEstimatedShipDate(scriptContext.currentRecord)
  END IF
END FUNCTION

// ─── CORE FUNCTION ───────────────────────────────────────────────────────────
FUNCTION recalculateEstimatedShipDate(currentRecord):

  lineCount = currentRecord.getLineCount({ sublistId: 'item' })

  // Guard: no lines → clear the field and exit
  IF lineCount <= 0:
    currentRecord.setValue({ fieldId: 'custbody_estimated_ship_date', value: null })
    RETURN
  END IF

  // Step 1: collect all item internal IDs across non-closed, non-cancelled lines
  itemIds = []  // array of { lineIndex, itemId }
  FOR i = 0 TO lineCount - 1:
    isClosed   = currentRecord.getSublistValue({ sublistId:'item', fieldId:'isclosed',   line: i })
    itemId     = currentRecord.getSublistValue({ sublistId:'item', fieldId:'item',        line: i })

    IF itemId IS NOT NULL AND NOT isClosed:
      itemIds.push({ line: i, itemId: String(itemId) })
    END IF
  END FOR

  // Guard: all lines closed or no items set
  IF itemIds.length = 0:
    currentRecord.setValue({ fieldId: 'custbody_estimated_ship_date', value: null })
    RETURN
  END IF

  // Step 2: de-duplicate item IDs to minimise server calls
  uniqueItemIds = DISTINCT values of itemId from itemIds

  // Step 3: bulk-look up custitem_lead_time_days for all unique items in one search
  leadTimeMap = {}  // { itemId: leadTimeDays (integer or null) }

  results = search.lookupFields({
    type   : search.Type.ITEM,           // covers all item types
    id     : uniqueItemIds,              // array overload — single API call
    columns: ['custitem_lead_time_days']
  })
  // Note: if search.lookupFields does not support array IDs in this version,
  // fall back to a search.create with an internalid filter:
  //   search.create({ type:'item', filters:[['internalid','anyof', uniqueItemIds]],
  //                   columns:['internalid','custitem_lead_time_days'] }).run().each(...)

  FOR EACH itemId IN uniqueItemIds:
    rawValue = results[itemId]['custitem_lead_time_days']
    leadTimeMap[itemId] = (rawValue IS NOT NULL AND rawValue != '') ? parseInt(rawValue, 10) : null
  END FOR

  // Step 4: find the maximum lead time across active lines
  maxLeadTime = 0
  hasAtLeastOneValidLeadTime = false

  FOR EACH entry IN itemIds:
    days = leadTimeMap[entry.itemId]
    IF days IS NOT NULL AND days > 0:
      hasAtLeastOneValidLeadTime = true
      IF days > maxLeadTime:
        maxLeadTime = days
      END IF
    END IF
    // Lines with null or 0 lead time are skipped (treated as "no lead time constraint")
  END FOR

  // Guard: no item has a valid lead time — clear field and warn
  IF NOT hasAtLeastOneValidLeadTime:
    currentRecord.setValue({ fieldId: 'custbody_estimated_ship_date', value: null })
    log.debug('CUST-O2C-03', 'No valid lead time found on any active line. Estimated Ship Date cleared.')
    RETURN
  END IF

  // Step 5: calculate Estimated Ship Date = today + maxLeadTime calendar days
  today            = new Date()           // client-side JS Date, time stripped to midnight
  today.setHours(0, 0, 0, 0)
  estimatedShipDate = new Date(today)
  estimatedShipDate.setDate(today.getDate() + maxLeadTime)

  // Step 6: write the date back to the header field
  currentRecord.setValue({
    fieldId  : 'custbody_estimated_ship_date',
    value    : estimatedShipDate,          // NS Client Script accepts a JS Date object
    ignoreFieldChange: false               // allow any downstream field-change handlers to fire
  })

  log.debug('CUST-O2C-03',
    'Estimated Ship Date set to ' + format.format({ value: estimatedShipDate, type: format.Type.DATE }) +
    ' (max lead time = ' + maxLeadTime + ' days, across ' + itemIds.length + ' active lines)')

END FUNCTION
```

**Key design decisions captured in pseudocode:**

1. **`pageInit` + `sublistChanged`** — `pageInit` handles the case where an existing SO is opened in Edit mode and the field needs to reflect the current lines immediately. `sublistChanged` fires after every add/remove/modify on the item sublist.
2. **De-duplication before lookup** — if the same item appears on five lines, only one server call is made for that item.
3. **`search.lookupFields` preferred over `record.load`** — avoids loading full item records, keeping governance unit consumption low.
4. **Calendar days, not business days** — the spec uses simple calendar day arithmetic (`Date.setDate`). If business-day calculation is required, that must be raised as a scope change (requires a holiday calendar or third-party logic).
5. **Closed lines excluded** — lines where `isclosed = true` are not counted; they no longer affect fulfillment.
6. **Lead time of 0 or null treated as "no constraint"** — rather than making today the ship date due to a data gap, those lines are silently skipped. An item with no lead time configured does not cap the rest of the order.

---

### 4.2 Edge Cases & Exception Handling

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | All lines removed from the order | `custbody_estimated_ship_date` is set to `null` (cleared). |
| 2 | Single line with no item selected yet (item field blank) | Line is skipped. If it is the only line, Estimated Ship Date is cleared. |
| 3 | `custitem_lead_time_days` is `null` or not configured on the Item record | That item's line contributes no lead time constraint. Other lines still drive the date. If ALL lines have null lead time, field is cleared and a debug log is written. |
| 4 | `custitem_lead_time_days` is `0` | Treated identically to null — no contribution. A 0-day lead time item does not reset the date to today if other items have longer lead times. |
| 5 | `custitem_lead_time_days` is negative (bad data) | Negative values are ignored (same as null). Log a warning with the item ID for data-quality follow-up. |
| 6 | All lines are closed (`isclosed = true`) | Treated as "no active lines" — Estimated Ship Date is cleared. |
| 7 | Only one line on the order | Max lead time equals that line's lead time. Date = today + that value. |
| 8 | Multiple lines, all with the same lead time | Max lead time equals that shared value — result is deterministic regardless of line order. |
| 9 | Multiple lines with different lead times (e.g., 5, 10, 3 days) | Max = 10 days. Estimated Ship Date = today + 10. |
| 10 | Sales Order opened in View mode | `pageInit` runs but `scriptContext.mode = 'view'` — script exits immediately without writing any field (field is read-only in View mode). |
| 11 | Sales Order created via CSV import or SuiteScript API | Client Script does not execute in non-UI contexts. A companion User Event Script (CUST-O2C-04) should be considered to cover those paths. |
| 12 | `search.lookupFields` call fails (network/governance error) | Caught in a try/catch. Error is logged. Field is NOT cleared (preserve the existing value if any). A non-blocking `alert` informs the user: "Could not recalculate Estimated Ship Date — please verify or contact IT." |
| 13 | `custbody_estimated_ship_date` field does not exist on the form/transaction | `setValue` will throw. The try/catch block logs the error and surfaces a user message. The save is NOT blocked — the error is informational. |
| 14 | Sales rep manually overrides the Estimated Ship Date after auto-population | No conflict. The script only writes on `sublistChanged` and `pageInit`. A manual change after the last line edit will persist. If the user adds another line afterward, the script recalculates and overwrites the manual entry. This is by design; document in user training. |
| 15 | Copy of Sales Order | `pageInit` fires with `mode = 'copy'`. Script recalculates based on copied lines, which is the correct behavior. |

---

## 5. Error Handling

| Error Scenario | Handling Approach |
|----------------|-------------------|
| `search.lookupFields` / item search returns an error | Wrap in `try/catch`. Log the error details (item IDs queried, error message) via `log.error`. Display a non-blocking UI message to the sales rep. Do NOT clear the existing Estimated Ship Date — preserve the last known good value. |
| `currentRecord.setValue` fails (field not on form or incorrect type) | Wrap in `try/catch`. Log `log.error('CUST-O2C-03', 'Failed to set custbody_estimated_ship_date: ' + e.message)`. Surface a user-friendly alert. Do not block the transaction. |
| `getSublistValue` returns unexpected type for `custitem_lead_time_days` | Use `parseInt(..., 10)` with `isNaN` guard. If `isNaN`, treat as null and log a data-quality warning with the item internal ID. |
| Governance / usage limit error in Client Script | Client Scripts have no governance limit per se, but `search.lookupFields` may time out on slow connections. If the search call exceeds 5 seconds (use a client-side timeout pattern), abort the lookup, log the warning, and display "Estimated Ship Date could not be recalculated automatically." |
| Unexpected exception (any unhandled path) | Outer `try/catch` in `recalculateEstimatedShipDate`. Log full stack trace. Alert user: "An error occurred updating Estimated Ship Date. Please contact IT support (CUST-O2C-03)." |

---

## 6. Performance Considerations

- **Client Script governance:** NetSuite Client Scripts do not consume the same governance units as server-side scripts, but `search.lookupFields` is a server round-trip. For orders with many unique items, this is a single batched search call rather than N individual lookups — this is the critical optimization.
- **Trigger frequency:** `sublistChanged` fires once per change event, not once per character typed. There is no debounce concern for this trigger.
- **Maximum line count:** Sales Orders with very large line counts (100+) are uncommon in most O2C implementations. If the business regularly creates orders with 100+ distinct items, consider whether the search call should be further optimized (e.g., caching previously fetched lead times in a JavaScript object keyed by item ID within the same page session).
- **No `record.load` calls:** The design explicitly avoids `record.load` for item records. `search.lookupFields` (or equivalent `search.create` with `internalid anyof` filter) retrieves only the single field needed.
- **`pageInit` on large existing orders:** On `pageInit`, all lines are scanned and a single search is issued. This is acceptable. If the search takes more than 2–3 seconds, the UX should still be acceptable as it happens once on load, not on every keystroke.

---

## 7. Dependencies

| Dependency | Type | Status Required Before Deploy | Details |
|------------|------|-------------------------------|---------|
| `custitem_lead_time_days` custom field on Item records | Configuration | Must exist and be deployed | Field type: Integer. Must be applied to all relevant item record types (Inventory Item, Non-Inventory Item, Assembly Item, etc.). If the field is missing, all items will return null lead time and the Estimated Ship Date will be cleared. |
| `custbody_estimated_ship_date` custom field on Sales Order | Configuration | Must exist and be deployed | Field type: Date. Must be added to the Sales Order transaction body. Must be visible on the Sales Order form(s) used by sales reps. |
| Sales Order form(s) used in production | Configuration | Must include both fields above | The Client Script deployment must reference the correct form(s). If multiple SO forms exist (e.g., standard vs. international), the script deployment must cover all of them. |
| N/search SuiteScript module | Platform | Standard — no prerequisite | Available in all NetSuite accounts. |
| N/format SuiteScript module | Platform | Standard — no prerequisite | Used for date formatting in log messages. |
| Item data quality — `custitem_lead_time_days` populated | Data | Populated for all active items in the item catalog | If the field is null for most items, the script will function but will not produce useful dates. Data population should be part of migration cutover. |
| CUST-O2C-04 (companion User Event Script) | Future scope | Out of scope for this spec | If automated API/import coverage of the same logic is required, a User Event Script should be specified separately. |

---

## 8. Testing Notes

| Test Case ID | Scenario | Input Data | Expected Result |
|--------------|----------|------------|-----------------|
| TC-CUST-O2C-03-01 | Single line, valid lead time | SO with 1 line; item has `custitem_lead_time_days = 7` | `custbody_estimated_ship_date` = today + 7 days |
| TC-CUST-O2C-03-02 | Multiple lines, different lead times | Lines: Item A = 5 days, Item B = 10 days, Item C = 3 days | `custbody_estimated_ship_date` = today + 10 days |
| TC-CUST-O2C-03-03 | Multiple lines, same lead time | Lines: Item A = 5 days, Item B = 5 days | `custbody_estimated_ship_date` = today + 5 days |
| TC-CUST-O2C-03-04 | Line with null lead time, other lines valid | Item A = null, Item B = 8 days | `custbody_estimated_ship_date` = today + 8 days (null line ignored) |
| TC-CUST-O2C-03-05 | All lines have null lead time | All items have `custitem_lead_time_days` = null | `custbody_estimated_ship_date` cleared (null); debug log written |
| TC-CUST-O2C-03-06 | Lead time = 0 | Item has `custitem_lead_time_days = 0` | Line is ignored (0 treated as no constraint); if only line, field cleared |
| TC-CUST-O2C-03-07 | Remove a line that had the longest lead time | SO has Item A=10, Item B=5; remove Item A | `custbody_estimated_ship_date` recalculates to today + 5 days |
| TC-CUST-O2C-03-08 | Remove all lines | Delete all item lines from the SO | `custbody_estimated_ship_date` cleared (null) |
| TC-CUST-O2C-03-09 | All lines closed | Set `isclosed = true` on all lines | `custbody_estimated_ship_date` cleared (null) |
| TC-CUST-O2C-03-10 | Edit existing SO with lines (pageInit) | Open existing SO in Edit mode with 2 lines (lead times 4 and 9) | On page load, `custbody_estimated_ship_date` set to today + 9 |
| TC-CUST-O2C-03-11 | Copy existing SO | Use Copy action on SO with 1 line (lead time 6) | `pageInit` fires, `custbody_estimated_ship_date` = today + 6 |
| TC-CUST-O2C-03-12 | View mode (read-only) | Open SO in View mode | Script exits on `pageInit`; no field modification attempted; no errors |
| TC-CUST-O2C-03-13 | Same item on multiple lines | Item A (lead time 7) appears on lines 1 and 3 | Only one lookup call made; result = today + 7 |
| TC-CUST-O2C-03-14 | Lead time field missing from item (field not deployed to item type) | Item type where `custitem_lead_time_days` field was not applied | `lookupFields` returns null for that item; line ignored; other lines drive date |
| TC-CUST-O2C-03-15 | Large order — 50 items, all unique, varied lead times | 50 lines, max lead time = 30 days | `custbody_estimated_ship_date` = today + 30; single search call; no timeout |

---

## 9. Governance

| Field | Value |
|-------|-------|
| **Script File Name** | `o2c_estimated_ship_date_cs.js` |
| **Script Record ID** | [Assigned after deployment] |
| **Deployment ID** | [Assigned after deployment] |
| **Code Repository** | [Git repo] / src/scripts/o2c/ |
| **Owner (Developer)** | [Assigned Developer Name] |
| **Owner (Business)** | Order Management Lead / Sales Operations Manager |
| **Change Control Process** | All changes require a new version entry in this document and re-approval by the Solution Architect and Functional Lead before deployment to production. A sandbox regression test covering all TC-CUST-O2C-03-xx test cases must pass before production promotion. |
| **Upgrade Risk** | Low — the script uses stable N/record, N/search, and N/format APIs (SuiteScript 2.1) with no dependency on undocumented NetSuite internals. Custom field IDs (`custitem_lead_time_days`, `custbody_estimated_ship_date`) are stable across upgrades. Review at each major NetSuite release if `sublistChanged` trigger behavior changes. |

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Solution Architect | | |
| Lead Developer | | |
| Functional Lead | | |
| Client Sign-Off | | |
