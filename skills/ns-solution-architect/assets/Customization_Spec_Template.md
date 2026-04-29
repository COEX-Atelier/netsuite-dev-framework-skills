# Customization Specification
<!-- Copy this file and rename it using the ID below. One file per customization. -->

---

## Header

| Field | Value |
|-------|-------|
| **Spec ID** | CUST-[AreaCode]-[NN] *(e.g., CUST-O2C-01)* |
| **Name** | [Short descriptive name, e.g., "Auto-Approve Low-Value Sales Orders"] |
| **Functional Area** | [O2C / P2P / R2R / Inventory / HR / Projects] |
| **Type** | [See Type Reference below] |
| **Status** | Draft / In Review / Approved / Built / Tested |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Version** | 0.1 |
| **Linked SDD** | [SDD filename and section, e.g., SDD_O2C.md §3.2] |
| **Linked RTM Rows** | [e.g., FR-03, FR-07] |
| **Linked BRD Req IDs** | [e.g., FR-03] |

---

## Type Reference

Choose one. This determines deployment, governance, and maintenance approach.

| Type | Script Type | When to Use |
|------|-------------|-------------|
| **User Event Script (UE)** | SuiteScript 2.1 | Logic runs on beforeLoad / beforeSubmit / afterSubmit of a record (server-side, triggered by saves in UI or API) |
| **Client Script (CS)** | SuiteScript 2.1 | Immediate UI feedback: field validation as user types, field defaulting on pageInit, button injections |
| **Map/Reduce (MR)** | SuiteScript 2.1 | Batch processing of many records — built-in parallelism, restart-safe |
| **Scheduled Script (SS)** | SuiteScript 2.1 | Timer-based tasks (daily, weekly, hourly) — cleanup, batch updates, report generation |
| **RESTlet (RL)** | SuiteScript 2.1 | Custom inbound API endpoint — external systems POST/GET to NetSuite |
| **SuiteFlow Workflow (WF)** | SuiteFlow | Simple state machines, approvals, field defaulting, email alerts — no developer needed to maintain |

> Prefer Workflow over SuiteScript when the logic is simple enough to be described as "if X then Y." See `references/design_decision_tree.md`.

---

## 1. Business Context

> *Why does this customization exist? What business problem does it solve? What would happen without it?*

[Describe in 2–4 sentences. Reference the BRD requirement.]

---

## 2. Trigger & Scope

| Field | Value |
|-------|-------|
| **Record Type(s)** | [e.g., Sales Order (salesorder), Invoice (invoice)] |
| **Trigger Event** | [e.g., beforeSubmit on Create and Edit / pageInit / scheduled daily at 02:00 UTC] |
| **Trigger Condition** | [e.g., Only when `custbody_approval_status` = "Pending" AND `amount` < 500] |
| **Runs In** | [UI only / UI + CSV import / UI + API / All contexts] |

---

## 3. Affected Records & Fields

List every record and field this customization reads from or writes to. Use NetSuite internal IDs where known — this prevents ambiguity during build.

| Record Type | Operation | Field Label | Field Internal ID | Field Type | Notes |
|-------------|-----------|-------------|-------------------|------------|-------|
| Sales Order | Read | Amount | `amount` | Currency | Used to check approval threshold |
| Sales Order | Write | Approval Status | `custbody_approval_status` | List/Record | Set to "Approved" if threshold met |
| Sales Order | Write | Approved By | `custbody_approved_by` | Free-Form Text | Set to "AUTO" when auto-approved |

---

## 4. Business Logic

> *This is the core of the spec. Be precise enough that a developer can write unit tests from this section alone.*

### 4.1 Decision Table / Pseudocode

```
TRIGGER: Sales Order — beforeSubmit (Create, Edit)

IF record.type = 'salesorder'
  AND record.getValue('custbody_approval_status') = 'PENDING'
  AND record.getValue('amount') < 500
THEN
  record.setValue('custbody_approval_status', 'APPROVED')
  record.setValue('custbody_approved_by', 'AUTO')
  log.audit('AutoApproval', 'SO auto-approved. Amount: ' + record.getValue('amount'))
ELSE IF record.getValue('amount') >= 500
  -- Do nothing; let standard approval routing handle
END IF
```

### 4.2 Edge Cases & Exception Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Amount is exactly $500 | Requires manual approval (threshold is strictly < 500) |
| Approval Status is already "Approved" | Script exits without changes — no double-processing |
| Record saved via CSV import | Script does NOT run (scoped to UI only — see §2) |
| Amount field is null/empty | Log warning and skip auto-approval; do not error |

---

## 5. Error Handling

| Error Scenario | Handling Approach |
|----------------|-------------------|
| Unexpected exception in beforeSubmit | Catch error, log to Script Execution Log, surface user-friendly message: "Approval automation failed — please contact IT." Do NOT silently swallow errors. |
| Field ID not found on record | Log error with field ID, fail gracefully without blocking the save |
| Script governance limit approaching | For Map/Reduce / Scheduled: implement restart checkpoint logic using `scriptContext.isRestarted` |

---

## 6. Performance Considerations

> *Relevant for User Event scripts that could run on high-volume records, and critical for Map/Reduce / Scheduled scripts.*

- [ ] Does this script call the database? If yes, use `search.create` with filters — avoid loading entire record lists.
- [ ] Does this script run on a high-volume record type (Transaction, Item)? If yes, minimize `record.load` calls.
- [ ] For Map/Reduce: define map/reduce/summarize phases and expected record counts.
- [ ] Are there API call limits to respect? (1000 concurrent governance units for user event, 10,000 for scheduled)

[Describe specific considerations here]

---

## 7. Dependencies

| Dependency | Type | Details |
|------------|------|---------|
| `custbody_approval_status` custom field | Configuration | Must exist on Sales Order before script deploys |
| `custbody_approved_by` custom field | Configuration | Must exist on Sales Order before script deploys |
| FR-03 Approval Workflow | Workflow | Must be disabled or scoped to exclude auto-approved records to avoid conflict |

---

## 8. Testing Notes

> *What test cases should QA use to verify this customization? Give specific data conditions.*

| Test Case ID | Scenario | Input Data | Expected Result |
|--------------|----------|------------|-----------------|
| TC-CUST-O2C-01-01 | Auto-approve under threshold | SO Amount = $250, Status = Pending | Status set to Approved, Approved By = AUTO |
| TC-CUST-O2C-01-02 | Do not auto-approve at threshold | SO Amount = $500, Status = Pending | Status remains Pending |
| TC-CUST-O2C-01-03 | Do not modify already-approved | SO Amount = $100, Status = Approved | No change — script exits |
| TC-CUST-O2C-01-04 | Null amount | SO Amount = null | Log warning, no error thrown, record saves normally |

---

## 9. Governance

| Field | Value |
|-------|-------|
| **Script File Name** | `[area]_[descriptor]_ue.js` *(e.g., o2c_autoapprove_ue.js)* |
| **Script Record ID** | [Assigned after deployment] |
| **Deployment ID** | [Assigned after deployment] |
| **Code Repository** | [Git repo / folder path] |
| **Owner (Developer)** | [Name] |
| **Owner (Business)** | [Name / Role] |
| **Change Control Process** | All changes require a new version entry in this document and re-approval before deployment to production |
| **Upgrade Risk** | Low / Medium / High — [explain if not Low] |

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Solution Architect | | |
| Lead Developer | | |
| Functional Lead | | |
| Client Sign-Off | | |
