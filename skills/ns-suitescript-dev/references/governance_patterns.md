# SuiteScript Governance Patterns

NetSuite enforces a hard governance unit ceiling per script execution. Exceeding it throws an `SSS_USAGE_LIMIT_EXCEEDED` error and rolls back the current operation. These patterns are non-negotiable for production-quality scripts.

---

## Governance Unit Cost Reference

| Operation | Approximate Cost |
|-----------|-----------------|
| `record.load()` | 10 units |
| `record.save()` | 20 units |
| `record.submitFields()` | 10 units |
| `search.create().run()` (per page of 1,000) | 10 units |
| `search.lookupFields()` | 1 unit |
| `search.lookupFields()` (array of fields) | 1 unit (same cost, batch multiple fields) |
| `https.get()` / `https.post()` | 10 units |
| `log.debug()` / `log.error()` | 0 units |

**Script type limits:**
- User Event / Client Script / RESTlet / Suitelet: **1,000 units**
- Scheduled Script / Map/Reduce (per stage): **10,000 units**

---

## Pattern 1 — Governance Guard (User Event / RESTlet)

Always check remaining governance before entering a loop or loading records.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
    const GOVERNANCE_BUFFER = 100; // stop processing if fewer than this many units remain

    const afterSubmit = (context) => {
        const script = runtime.getCurrentScript();

        if (script.getRemainingUsage() < GOVERNANCE_BUFFER) {
            log.error('GOVERNANCE', 'Insufficient governance to proceed. Skipping execution.');
            return;
        }

        // safe to proceed
        processRecord(context.newRecord);
    };

    return { afterSubmit };
});
```

---

## Pattern 2 — Governance-Aware Loop with Early Exit

For loops that process multiple records in a User Event or Scheduled Script.

```javascript
const GOVERNANCE_BUFFER = 200;

const processItems = (items, script) => {
    for (const item of items) {
        if (script.getRemainingUsage() < GOVERNANCE_BUFFER) {
            log.audit('GOVERNANCE_LIMIT', `Stopped at item ${item.id} — units remaining: ${script.getRemainingUsage()}`);
            break; // exit loop gracefully; log which item stopped processing
        }

        // process each item
        record.submitFields({
            type: item.recordType,
            id: item.id,
            values: { custbody_processed: true }
        });
    }
};
```

---

## Pattern 3 — Scheduled Script with Self-Rescheduling

For large-volume batch operations spanning multiple executions.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/task', 'N/search', 'N/log'], (runtime, task, search, log) => {
    const GOVERNANCE_BUFFER = 500;
    const SCRIPT_ID = 'customscript_proj_nightly_sync';
    const DEPLOY_ID = 'customdeploy_proj_nightly_sync';

    const execute = (context) => {
        const script = runtime.getCurrentScript();
        // read progress from script parameter to know where to resume
        const lastProcessedId = Number(script.getParameter({ name: 'custscript_last_processed_id' })) || 0;

        const searchResults = getPendingRecords(lastProcessedId);

        let lastId = lastProcessedId;
        for (const result of searchResults) {
            if (script.getRemainingUsage() < GOVERNANCE_BUFFER) {
                log.audit('RESCHEDULE', `Governance limit approaching. Last processed ID: ${lastId}`);
                reschedule(lastId);
                return;
            }

            processResult(result);
            lastId = result.id;
        }

        log.audit('COMPLETE', 'All records processed successfully.');
    };

    const reschedule = (lastProcessedId) => {
        const scheduledTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: SCRIPT_ID,
            deploymentId: DEPLOY_ID,
            params: { custscript_last_processed_id: lastProcessedId }
        });
        scheduledTask.submit();
    };

    return { execute };
});
```

---

## Pattern 4 — search.lookupFields Instead of record.load

`record.load` costs 10 units. `search.lookupFields` costs 1 unit. For read-only data access, always prefer `lookupFields`.

```javascript
// BAD — costs 10 units, loads entire record into memory
const rec = record.load({ type: record.Type.SALES_ORDER, id: soId });
const status = rec.getValue('status');
const entity = rec.getValue('entity');

// GOOD — costs 1 unit, retrieves only what you need
const fields = search.lookupFields({
    type: search.Type.SALES_ORDER,
    id: soId,
    columns: ['status', 'entity', 'trandate', 'amount']  // batch all needed fields in one call
});
const { status, entity, trandate, amount } = fields;
```

**Rule:** Only use `record.load` when you need to:
1. Modify sublists (insert/remove lines)
2. Read dynamic sublist values
3. Set multiple fields and save in one operation where `submitFields` would trigger too many saves

---

## Pattern 5 — search.PagedData for Large Result Sets

`search.run().each()` is limited to 4,000 results. For larger sets, use `search.runPaged()`.

```javascript
const processAllResults = () => {
    const pagedData = search.create({
        type: search.Type.TRANSACTION,
        filters: [['status', search.Operator.IS, 'SalesOrd:A']],
        columns: ['internalid', 'tranid', 'entity', 'amount']
    }).runPaged({ pageSize: 1000 });

    pagedData.pageRanges.forEach((pageRange) => {
        const page = pagedData.fetch({ index: pageRange.index });

        page.data.forEach((result) => {
            const id = result.getValue('internalid');
            const amount = result.getValue('amount');
            // process each result
        });
    });
};
```

---

## Pattern 6 — Map/Reduce for High-Volume Processing

Use Map/Reduce when you need to process more records than a Scheduled Script can handle in one run, or when parallel processing would speed up the operation.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    // getInputData runs once — return the full data set
    const getInputData = () => {
        return search.create({
            type: search.Type.CUSTOMER,
            filters: [['custentity_needs_update', search.Operator.IS, true]],
            columns: ['internalid', 'email', 'custentity_segment']
        });
    };

    // map runs once per search result — emit key/value pairs
    const map = (context) => {
        const result = JSON.parse(context.value);
        const id = result.id;
        const segment = result.values.custentity_segment;

        // group records by segment for batch processing
        context.write({ key: segment, value: id });
    };

    // reduce runs once per unique key — process the group
    const reduce = (context) => {
        const segment = context.key;
        const recordIds = context.values;

        recordIds.forEach((id) => {
            try {
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: Number(id),
                    values: { custentity_processed_segment: segment }
                });
            } catch (e) {
                log.error(`REDUCE_ERROR_${id}`, e.message);
                // do not rethrow — let Map/Reduce continue with other keys
            }
        });
    };

    // summarize runs once after all map/reduce — check for errors
    const summarize = (summary) => {
        summary.mapSummary.errors.iterator().each((key, error) => {
            log.error('MAP_ERROR', `Key: ${key}, Error: ${error}`);
            return true;
        });

        summary.reduceSummary.errors.iterator().each((key, error) => {
            log.error('REDUCE_ERROR', `Key: ${key}, Error: ${error}`);
            return true;
        });

        log.audit('SUMMARY', `Duration: ${summary.seconds}s | Input errors: ${summary.inputSummary.error}`);
    };

    return { getInputData, map, reduce, summarize };
});
```

---

## Governance Anti-Patterns

| Anti-Pattern | Cost Impact | Fix |
|-------------|------------|-----|
| `record.load` inside a loop for read-only data | 10 units × N records | Use `search.lookupFields` or a single search with all needed columns |
| `search.run().each()` on 50,000 records | Fails at 4,000 | Use `search.runPaged()` |
| Multiple `record.submitFields` calls on the same record | 10 units × N calls | Combine into a single `submitFields` with all fields at once |
| `record.load` → modify → `record.save` for a single field change | 30 units | Use `record.submitFields` (10 units) instead |
| No governance check before entering a loop | Script fails mid-run | Add `getRemainingUsage()` check before each iteration |
