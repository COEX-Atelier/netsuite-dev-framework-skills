# Workflow Action Configuration Guide

Detailed configuration reference for every SuiteFlow action type. Use this when the SKILL.md stage-by-stage guidance tells you to configure a specific action but you need the exact settings.

---

## Action Timing — Understanding When Actions Run

Every action has a timing setting that controls when it executes. Choosing the wrong timing is the most common workflow bug.

| Timing | When it runs | Use for |
|--------|-------------|---------|
| **Before User Interaction** | Before the form renders for the user | Setting field display types (show/hide), populating defaults the user will see |
| **Before Record Submit** | After the user clicks Save, before the record is committed | Field validation, setting values that must be part of the save |
| **After Record Submit** | After the record is fully committed to the database | Creating related records, sending emails, triggering downstream actions |
| **On Entry** | When the record enters the state | Setting status flags, locking records, sending initial notifications |
| **Scheduled** | After a defined time period in the current state | Escalations, reminders, deadlines |

**Most common mistake:** Running an email action **Before Record Submit** — the email fires but if the record save fails afterward, the email was sent incorrectly. Use **After Record Submit** for all email and record-creation actions.

---

## Set Field Value

**Purpose:** Programmatically populate a field value when a state is entered or a transition fires.

**Configuration:**

| Setting | Options | Notes |
|---------|---------|-------|
| Field | Any field on the record | Use the field's **internal ID** not its label |
| Type | Static value / Field reference / Formula / Custom script | Choose the simplest type that works |
| Value | Depends on type | See below |
| Timing | Before Record Submit / After Record Submit / On Entry | Use Before Record Submit to include in the save |

**Value type examples:**

```
Static value:
  Field: custbody_o2c_approval_status
  Type: Static
  Value: "Pending Approval"

Field reference (copy from another field):
  Field: custbody_o2c_approved_by
  Type: Field reference
  Value: {currentuser}    ← current logged-in user

Today's date:
  Field: custbody_o2c_approval_date
  Type: Field reference
  Value: {today}

Formula (arithmetic):
  Field: custbody_o2c_discount_amount
  Type: Formula (Currency)
  Value: {amount} * 0.1
```

**Override lock:** If the record is locked and you need to set a field (e.g., setting an approval stamp on a locked record), enable the "Override Record Lock" checkbox.

---

## Send Email

**Purpose:** Notify users, roles, or external addresses when a state is entered or a transition fires.

**Configuration:**

| Setting | Notes |
|---------|-------|
| To | Specific user field on the record, a role group, a field containing an email address, or a static email (use Script Parameter — no hardcoding) |
| CC | Optional — same options as To |
| Reply To | Use a monitored inbox, not the current user |
| Subject | Include record identifiers: `${tranid} — Action Required` |
| Body | Always use an **Email Template** — do not write inline HTML |
| Timing | **After Record Submit** for all notifications |

**Recipient targeting options (in order of preference):**

1. **Field on record** — e.g., `custbody_o2c_approver` (resolves to the assigned approver)
2. **Role group** — sends to all users with a specific role (e.g., Finance Approver)
3. **Current user** — sends to whoever triggered the action
4. **Static email** — read from a Script Parameter, never hardcoded

**Email template reference:**
- Create the template in Documents > Templates > Email Templates
- Template ID format: `customtemplate_[proj]_[description]`
- Use `${record.fieldid}` in the template body to insert field values

---

## Lock Record / Unlock Record

**Purpose:** Prevent edits to a record while it's in an approval or in-progress state.

**Configuration:**
- No settings beyond the action itself — lock/unlock applies to the entire record
- For selective field locking, use **Set Field Display Type** instead

**Important behaviors:**
- A locked record cannot be saved from the UI — users see an error if they try
- Scripts can still modify a locked record via `record.submitFields` with `ignoreMandatoryFields: true` (but set `enableSourcing: false`)
- Workflows can set fields on locked records using **Override Record Lock** in the Set Field Value action
- Locking is per-workflow-instance — if multiple workflows run on the same record, each manages its own lock

---

## Set Field Display Type

**Purpose:** Show, hide, or disable fields in the UI without locking the entire record.

| Display Type | Effect |
|-------------|--------|
| Normal | Default — visible and editable |
| Read-only | Visible but not editable by the user |
| Hidden | Removed from the form entirely |
| Disabled | Visible but greyed out (same as Read-only visually) |

**Timing:** Must be **Before User Interaction** — this action only affects the form rendering, not the saved data.

**Use case:**
```
State: Pending Approval
  Action: Set Field Display Type
    Field: custbody_o2c_approval_notes
    Type: Read-only   ← approver can see notes but can't change them
    Timing: Before User Interaction
```

---

## Create Record

**Purpose:** Create a new NetSuite record (typically a child or related record) when an event fires.

**Configuration:**

| Setting | Notes |
|---------|-------|
| Record Type | The type of record to create (standard or custom) |
| Condition | Optional — only create if this condition is true |
| Field Mappings | Map source fields from the current record to fields on the new record |
| Timing | **After Record Submit** — the parent must be saved before the child is created |

**Field mapping example (Approval Log):**
```
New Record: customrecord_o2c_approval_log
Field Mappings:
  custrecord_o2c_log_parent_so  ← {internalid}     (current Sales Order internal ID)
  custrecord_o2c_log_action     ← "Approved"        (static value)
  custrecord_o2c_log_date       ← {today}
  custrecord_o2c_log_approver   ← {currentuser}
  custrecord_o2c_log_amount     ← {amount}
```

**Limitation:** Create Record can only set body fields on the new record. It cannot add sublist lines. For record creation with line items, use a Custom Action (SuiteScript).

---

## Return User Error

**Purpose:** Block a transition and display an error message to the user.

**Use cases:**
- Prevent a required field from being empty before a transition
- Block an action if business conditions aren't met
- Force the user to complete a prerequisite step

**Configuration:**
```
Action: Return User Error
  Message: "You cannot approve this order — the customer credit limit has been exceeded. 
            Please contact Finance before proceeding."
  Condition: {custbody_o2c_credit_check_passed} is False
  Timing: Before Record Submit
```

The user sees the error message in a popup and the transition is cancelled.

---

## Custom Action

**Purpose:** Call a SuiteScript function for logic that is too complex for built-in workflow conditions and actions.

**When to use:**
- The action requires a saved search lookup
- The action requires sublist manipulation
- The action involves an external API call
- Complex field calculations across multiple records

**Setup:**
1. Write the SuiteScript function (entry point: `WorkflowAction` script type)
2. Deploy it with script type `WorkflowActionScript`
3. In the workflow, add a Custom Action and reference the script + deployment ID
4. Map workflow context values (record fields) to the script's parameters

**WorkflowAction script skeleton:**
```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/log'], (record, log) => {
    const onAction = (context) => {
        const recordId = context.newRecord.id;
        const recordType = context.newRecord.type;
        // perform complex logic here
        // return value is optionally mapped back to a field by the workflow
        return 'result value';
    };

    return { onAction };
});
```

---

## Initiate Workflow

**Purpose:** Trigger another workflow on the current record or a related record.

**Use cases:**
- Chain workflows sequentially (Workflow A completes → triggers Workflow B)
- Trigger a workflow on a related record (e.g., when a Sales Order is approved, trigger a workflow on the related Customer record)

**Configuration:**
- Target Workflow: select from the list of active workflows
- Target Record: current record, or a field reference to a related record ID
- Condition: optional — only trigger if a condition is met

**Warning:** Workflow chains can create infinite loops if the triggered workflow re-initiates the initiating workflow. Always add an initiation condition that prevents re-triggering.

---

## Go To Record Page

**Purpose:** Redirect the user to a specific record page after a transition completes.

**Use cases:**
- After creating a related record, navigate the user to it
- After an approval, redirect to a dashboard or summary page

**Configuration:**
- Record: select the record to navigate to (can be a field reference to a dynamic record ID)
- Timing: After Record Submit (the navigation happens after the save is complete)
