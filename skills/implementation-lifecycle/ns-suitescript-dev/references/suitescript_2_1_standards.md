# SuiteScript 2.1 Standards

---

## 1. Versioning

Always use `@NApiVersion 2.1`. SuiteScript 2.1 supports ES6+ features: use them.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/log'], (record, search, runtime, log) => {
    // ES6+: const/let, arrow functions, destructuring, template literals
    const afterSubmit = ({ newRecord, oldRecord, type }) => {
        const soId = newRecord.id;
        log.debug('AFTER_SUBMIT', `Processing SO: ${soId}`);
    };

    return { afterSubmit };
});
```

**Do not use:**
- `var` — use `const` (default) or `let` (when reassignment is needed)
- `function` declarations for entry points — use arrow functions
- String concatenation — use template literals `` `${value}` ``

---

## 2. Naming Conventions

Consistent naming is enforced at deployment time. Never deviate from these prefixes — they are set by NetSuite's account customization system.

| Object Type | Convention | Example |
|-------------|-----------|---------|
| Script ID | `customscript_[proj]_[description]` | `customscript_o2c_approval_ue` |
| Deployment ID | `customdeploy_[proj]_[description]` | `customdeploy_o2c_approval_ue` |
| Body field | `custbody_[proj]_[description]` | `custbody_o2c_approval_status` |
| Column (line) field | `custcol_[proj]_[description]` | `custcol_o2c_lead_time_days` |
| Entity field | `custentity_[proj]_[description]` | `custentity_o2c_territory_code` |
| Item field | `custitem_[proj]_[description]` | `custitem_o2c_lead_time_days` |
| Script parameter | `custscript_[proj]_[description]` | `custscript_o2c_admin_email` |
| Custom record type | `customrecord_[proj]_[description]` | `customrecord_o2c_approval_log` |
| Custom module | `SuiteScripts/[proj]/[module].js` | `SuiteScripts/O2C/lib_approval.js` |

**`[proj]`** is the 2-4 letter project code assigned at project start (e.g., `o2c`, `p2p`, `inv`). Never use generic names like `custom`, `test`, or `new`.

---

## 3. Module Imports

Only import modules you actually use. Import order: NetSuite native modules first, then custom modules.

```javascript
// Standard import pattern
define([
    'N/record',          // record.load, record.save, record.submitFields
    'N/search',          // search.create, search.lookupFields, search.Type
    'N/runtime',         // runtime.getCurrentScript, runtime.getCurrentUser
    'N/log',             // log.debug, log.audit, log.error
    'N/email',           // email.send
    'N/task',            // task.create (for rescheduling)
    'N/url',             // url.resolveScript
    'SuiteScripts/proj/lib_shared'  // custom module — always last
], (record, search, runtime, log, email, task, url, libShared) => {

    // ...

    return { afterSubmit };
});
```

---

## 4. Governance

See [governance_patterns.md](governance_patterns.md) for full patterns. Core rules:

- **Check before loops:** Call `runtime.getCurrentScript().getRemainingUsage()` before entering any loop that loads or saves records.
- **Prefer `search.lookupFields` over `record.load`** for read-only field access (1 unit vs. 10 units).
- **Prefer `record.submitFields` over `record.load` + `record.save`** for single-field updates (10 units vs. 30 units).
- **Use `search.runPaged()`** for result sets that may exceed 4,000 records.
- **Map/Reduce for bulk:** Use Map/Reduce for any operation processing more than 1,000 records.

---

## 5. Error Handling

Every transactional operation must be wrapped in a try/catch. Log both the error and enough context to diagnose it without re-running.

```javascript
const afterSubmit = (context) => {
    const { newRecord } = context;
    const soId = newRecord.id;

    try {
        const result = processApproval(soId);
        log.audit('APPROVAL_SUCCESS', `SO ${soId} approved. Result: ${JSON.stringify(result)}`);
    } catch (e) {
        log.error('APPROVAL_FAILED', `SO ${soId} — ${e.name}: ${e.message}`);
        // decide: rethrow to rollback the transaction, or swallow and send alert
        // rethrow if this is a beforeSubmit validation
        // swallow + notify if this is a non-critical afterSubmit side effect
        sendAdminAlert(soId, e);
    }
};
```

**Rules:**
- Always log `e.name` and `e.message` — never just `e`
- In `beforeSubmit`, rethrowing the error prevents the record from saving (use this for validation)
- In `afterSubmit`, the record is already saved — rethrowing does not roll it back; log and notify instead

---

## 6. Script Parameters (No Hardcoding)

Any value that might change between environments or clients must be a Script Parameter. This includes: email addresses, record IDs, saved search IDs, feature flags, thresholds.

```javascript
// Define parameters in the script deployment record, then read them at runtime:
const script = runtime.getCurrentScript();

const adminEmail = script.getParameter({ name: 'custscript_o2c_admin_email' });
const approvalThreshold = Number(script.getParameter({ name: 'custscript_o2c_approval_threshold' }));
const enableNotifications = script.getParameter({ name: 'custscript_o2c_enable_notifications' }) === 'T';
```

**Never** embed internal IDs, email addresses, or feature toggle booleans as literals in your code.

---

## 7. Data Integrity

```javascript
// Single-field updates — use submitFields (governance efficient)
record.submitFields({
    type: record.Type.SALES_ORDER,
    id: soId,
    values: {
        custbody_o2c_approval_status: 'APPROVED',
        custbody_o2c_approved_date: new Date()
    },
    options: { enableSourcing: false, ignoreMandatoryFields: true }
});

// Dynamic sublist manipulation — always use insertLine + setCurrentSublistValue
rec.selectNewLine({ sublistId: 'item' });
rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemId });
rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: qty });
rec.commitLine({ sublistId: 'item' });
```

---

## 8. Logging Strategy

```javascript
// Use log levels intentionally
log.debug('FUNCTION_NAME', 'Entered with value: ' + someValue);   // development only — remove or guard in production
log.audit('MILESTONE', 'Record 12345 processed successfully');     // key business events — always keep
log.error('ERROR_CODE', `Failed: ${e.name} — ${e.message}`);      // unexpected failures — always keep

// Guard debug logs in production using a script parameter flag
const isDebugMode = script.getParameter({ name: 'custscript_o2c_debug_mode' }) === 'T';
if (isDebugMode) {
    log.debug('PAYLOAD', JSON.stringify(payload));
}
```

---

## 9. Deployment

- **Script ID format:** `customscript_[proj]_[description]_[type]` where `[type]` = `ue` (User Event), `cs` (Client Script), `mr` (Map/Reduce), `ss` (Scheduled), `rl` (RESTlet), `sl` (Suitelet)
- **Deployment ID format:** `customdeploy_[proj]_[description]_[type]`
- **Status:** Always deploy in **Testing** status first. Promote to **Released** only after UAT sign-off.
- **Applied-to records:** Be explicit — never apply a User Event to "All Record Types"
- **Execution context:** Restrict contexts to only what the script needs (UI, CSV import, etc.) to avoid unintended triggering

---

## 10. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Calling `record.save()` inside `beforeSubmit` | Recursive loop, timeout error | Move save logic to `afterSubmit`, or use `submitFields` on a different record |
| `record.load` in `beforeLoad` and modifying the record | Changes are overwritten by NetSuite's load | Use `beforeLoad` to read only; use `beforeSubmit` to write |
| Using `context.newRecord` in `afterSubmit` and expecting sublists to reflect changes | Sublists in the context object may be stale | Reload the record with `record.load` after submit if sublist data is needed |
| `search.run().each()` on a potentially large result set | Silently stops at 4,000 results | Use `search.runPaged()` |
| Not checking `context.type` in User Event | Script fires on delete, CSV import, or web service calls unexpectedly | Guard with `if (context.type === context.UserEventType.CREATE \|\| ...)` |
| Async module pattern (`require`) in a server-side script | `require is not defined` error | Use `define([], () => {...})` for server-side; `require([])` only in client scripts |
