# SuiteScript Script Type Decision Guide

Use this reference before writing a single line of code. Choosing the wrong script type is a build defect — it means rewriting the file, re-creating the deployment record, and re-testing from scratch.

---

## Decision Table

| Trigger / Need | Script Type |
|---------------|-------------|
| Logic must fire when a record is **saved, loaded, or deleted** (server-side) | **User Event Script** |
| Immediate **UI feedback** — field changes, inline validation as the user types | **Client Script** |
| Processing **hundreds or thousands of records** in a batch | **Map/Reduce Script** |
| Task that runs on a **timer** (nightly, weekly, recurring batch) | **Scheduled Script** |
| External system needs to **call NetSuite as an API endpoint** | **RESTlet** |
| Internal users need a **custom NetSuite page** (form, dashboard, report) | **Suitelet** |
| Running an ad-hoc **mass update** across a record set from the UI | **Mass Update Script** |
| **Simple approvals, field defaulting, state changes** — no developer needed to maintain | **SuiteFlow Workflow** (not SuiteScript) |

---

## Per-Type Quick Reference

### User Event Script
- **Governance limit:** 1,000 units per invocation
- **Entry points:** `beforeLoad`, `beforeSubmit`, `afterSubmit`
- **Runs in contexts:** UI, CSV import, web store, web services, scheduled, map/reduce (configurable)
- **Key restrictions:**
  - `beforeLoad` — read-only; do not modify the record being loaded
  - `beforeSubmit` — can modify the record; cannot call `record.save()`
  - `afterSubmit` — record is already saved; use `record.load()` + `record.save()` to modify related records
- **When to use:** Validation, field defaulting, triggering downstream updates on save, creating related records after submit

### Client Script
- **Governance limit:** 1,000 units per page load (shared across all client scripts on the page)
- **Entry points:** `pageInit`, `fieldChanged`, `sublistChanged`, `saveRecord`, `validateField`, `validateLine`
- **Runs in:** Browser only — no server access
- **Key restrictions:**
  - Cannot use `N/record` server module; use `currentRecord` module instead
  - All API calls are async in SuiteScript 2.1 (`require` with promises)
  - Cannot trigger other scripts or workflows directly
- **When to use:** Show/hide fields dynamically, calculate totals on the fly, validate before save, populate sublist fields based on user selections

### Map/Reduce Script
- **Governance limit:** 10,000 units per stage (`getInputData`, `map`, `reduce`, `summarize`)
- **Entry points:** `getInputData`, `map`, `reduce`, `summarize`
- **Runs in:** Background (queued); never interactive
- **Key restrictions:**
  - Each `map` and `reduce` invocation is independent — do not rely on shared state between keys
  - Errors in individual keys do not stop the entire run — check `summarize.mapSummary.errors`
  - Deploy with `concurrencyLimit` set appropriately (default: 1)
- **When to use:** Bulk record updates, data transformation across thousands of records, anything that would exhaust a Scheduled Script's governance

### Scheduled Script
- **Governance limit:** 10,000 units per execution
- **Entry points:** `execute`
- **Runs in:** Background on a timer or triggered via `N/task`
- **Key restrictions:**
  - Reschedule itself using `task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT })` if processing incomplete
  - Use `runtime.getCurrentScript().getRemainingUsage()` to decide when to reschedule
- **When to use:** Nightly syncs, periodic cleanup, background processing that doesn't need per-record triggers

### RESTlet
- **Governance limit:** 5,000 units per request
- **Entry points:** `get`, `post`, `put`, `delete`
- **Authentication:** Token-Based Authentication (TBA) or OAuth 2.0 — never user/password
- **Key restrictions:**
  - Always validate the incoming payload — treat it as untrusted external input
  - Return structured JSON with explicit error responses (HTTP 4xx/5xx)
  - Not suitable for long-running operations (request timeout: ~5 minutes)
- **When to use:** External systems calling NetSuite (Salesforce, custom apps, middleware), webhook receivers

### Suitelet
- **Governance limit:** 1,000 units per request
- **Entry points:** `onRequest`
- **Runs in:** Browser-accessible URL (internal NetSuite users only, unless set to external)
- **Key restrictions:**
  - Use `serverWidget` module to build forms
  - Avoid long processing — hand off to a Scheduled/Map-Reduce if needed
- **When to use:** Custom approval pages, internal tools, dashboards not achievable with saved searches/reports

### Mass Update Script
- **Governance limit:** 1,000 units per record processed
- **Entry points:** `each`
- **Runs in:** Triggered manually from the Mass Update UI (Lists > Mass Update)
- **When to use:** One-off admin data corrections, backfilling new fields across existing records

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Correct Approach |
|-------------|---------------|-----------------|
| Client Script doing server-side record saves | Will fail — no `N/record` server module in browser | Move save logic to a User Event `afterSubmit` triggered by a field flag |
| User Event `beforeSubmit` calling `record.save()` | Recursive loop — the save triggers `beforeSubmit` again | Use `record.submitFields` from `afterSubmit` on a different record, or use a flag to prevent recursion |
| Scheduled Script processing 50,000 records without rescheduling | Will hit 10,000 unit limit and fail mid-run | Add governance check every N records; reschedule if `getRemainingUsage() < BUFFER` |
| RESTlet using password authentication | Security violation; NetSuite deprecating basic auth | Always use TBA or OAuth 2.0 |
| User Event on every record type "just in case" | Performance degradation; governance consumed unnecessarily | Apply only to the specific record type(s) and contexts where the logic applies |
| Map/Reduce for a task processing 5 records | Overkill; adds queue latency | Use a Scheduled Script or User Event instead |

---

## SuiteFlow vs. SuiteScript Checklist

Before writing any SuiteScript, ask:

- [ ] Can this be accomplished with a SuiteFlow workflow? (field defaults, simple approvals, email notifications, record creation on state change)
- [ ] Does this require complex calculations, external API calls, sublist manipulation, or high-volume data? → SuiteScript
- [ ] Will a non-developer need to modify this logic in the future? → Prefer SuiteFlow
- [ ] Is this logic too complex to express in workflow conditions? → SuiteScript

A SuiteFlow workflow is visible to admins, has no deployment record complexity, and survives NetSuite version upgrades better than custom code. Default to it whenever it's sufficient.
