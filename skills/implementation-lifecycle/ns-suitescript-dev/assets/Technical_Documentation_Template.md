# Technical Documentation
## Script Name: [Script ID — e.g., customscript_o2c_approval_ue]
## Script Type: [User Event / Client Script / Map/Reduce / Scheduled / RESTlet / Suitelet]
## Customization Spec Reference: [CUST-XX-NN]
## Version: 1.0 | Date: [YYYY-MM-DD] | Author: [Name]

---

### 1. Purpose

[1-2 sentences: what business problem does this script solve and why is custom code required instead of configuration or a workflow?]

---

### 2. Triggering Criteria

- **Record Type(s):** [e.g., Sales Order (`salesorder`)]
- **Entry Point / Event:** [e.g., `afterSubmit`]
- **Execution Contexts:** [e.g., UI, CSV Import — list only the contexts enabled on the deployment record]
- **Conditions:** [e.g., fires only when `custbody_approval_required` is `true`; or "fires on all saves"]

---

### 3. Logic Overview

[Step-by-step description of the script's execution path. Be specific enough that a tester can derive test cases from this section alone.]

1. Read script parameters: [list each parameter name and purpose]
2. Check governance remaining; exit early if below threshold
3. [Step 3 — describe the main logic decision or branch]
4. [Step 4 — describe what happens on the happy path]
5. [Step 5 — describe what happens on the error/exception path]
6. Log completion or failure with record ID and outcome

---

### 4. Script Parameters

| Label | Script Parameter ID | Type | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| | `custscript_[proj]_[name]` | | Yes/No | |

---

### 5. Dependencies

- **Custom Fields:** [List each field — Label, Internal ID, Field Type, Record Type]
- **Custom Records:** [List any custom record types read or written]
- **Custom Modules:** [e.g., `SuiteScripts/O2C/lib_approval.js`]
- **Saved Searches:** [List search IDs and purposes]
- **Other Scripts / Workflows:** [List any scripts or workflows this script relies on or may conflict with]

---

### 6. Error Handling

| Scenario | Script Behavior | User-Facing Impact |
| :--- | :--- | :--- |
| [e.g., Required field missing] | [e.g., Throws error in `beforeSubmit`, blocks save] | [e.g., User sees NetSuite error popup] |
| [e.g., API call fails in `afterSubmit`] | [e.g., Logs error, sends email to admin] | [e.g., Record is saved; admin is notified] |
| [e.g., Governance limit reached] | [e.g., Reschedules remaining work via `N/task`] | [e.g., No immediate impact; batch completes in next run] |

---

### 7. Performance & Governance Notes

- **Script Type Governance Limit:** [e.g., 1,000 units (User Event) / 10,000 units (Scheduled)]
- **Estimated Governance per Execution:** [e.g., ~150 units for a typical 5-line order]
- **Bottlenecks:** [e.g., `record.load` called once per order line — consider `search.lookupFields` for large orders]
- **Volume Assumptions:** [e.g., Tested up to 200 line items; orders >500 lines may require rearchitecting as Map/Reduce]

---

### 8. Deployment Record

| Field | Value |
| :--- | :--- |
| Script File | `SuiteScripts/[proj]/[filename].js` |
| Script ID | `customscript_[proj]_[description]_[type]` |
| Deployment ID | `customdeploy_[proj]_[description]_[type]` |
| Applied To | [Record type(s)] |
| Status | Testing → Released after UAT |
| Execution Contexts | [List enabled contexts] |
| Log Level | DEBUG (Testing) → AUDIT (Released) |

---

### 9. Test Cases

| TC ID | Scenario | Input / Setup | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| TC-[CUST-XX-NN]-01 | Happy path | [Specific field values / record state] | [Exact expected outcome] | |
| TC-[CUST-XX-NN]-02 | Missing required field | [Field left blank] | [Error thrown / record blocked] | |
| TC-[CUST-XX-NN]-03 | Edge case: zero quantity | [Qty = 0 on all lines] | [Expected behavior] | |
| TC-[CUST-XX-NN]-04 | Edge case: large order | [50+ lines] | [Completed without governance error] | |
| TC-[CUST-XX-NN]-05 | Null / empty value | [Field = null] | [Handled gracefully, no uncaught exception] | |

Add rows for every edge case identified in the Customization Spec.

---

### 10. Quality Gate Checklist

Complete before handing off to QA:

- [ ] JSDoc header present with correct `@NApiVersion 2.1`, `@NScriptType`, `@NModuleScope`
- [ ] `scripts/validate_script_headers.js` passes with no errors
- [ ] All entry points wrapped in try/catch
- [ ] Governance guard in place before any loop that loads or saves records
- [ ] No hardcoded IDs, email addresses, or thresholds — all in Script Parameters
- [ ] `log.audit` for all key business events; `log.error` for all caught exceptions
- [ ] Pseudocode from Customization Spec maps 1:1 to implemented code
- [ ] All dependencies (custom fields, saved searches, modules) verified to exist in the target environment
- [ ] Script deployed in **Testing** status
- [ ] All test cases in Section 9 have been executed and documented

---

### 11. Sign-Off

| Role | Name | Date | Signature |
| :--- | :--- | :--- | :--- |
| Developer | | | |
| Technical Lead / Code Reviewer | | | |
| Functional Consultant | | | |
| QA / Test Manager | | | |
| Client Sign-Off | | | |
