# SuiteFlow Workflow Patterns

Copy-paste-ready workflow designs for common NetSuite automation needs. Adapt states, field IDs, and conditions to the specific SDD requirements.

---

## Pattern 1 — Single-Level Approval Workflow

**Use case:** A Sales Order requires approval from a Finance manager before fulfillment.

```
Record Type: Sales Order
Initiation: custbody_o2c_approval_required is True AND Status is Pending Approval

State Map:
  [Record Created/Updated]
       ↓ (Workflow initiates)
  ┌─────────────────────┐
  │   Pending Approval  │  ← Entry: Lock Record, Set custbody_o2c_approval_status = "Pending"
  │                     │    Entry: Send email to Finance Approver role
  └────────┬────────────┘
           │
     ┌─────┴──────┐
     ↓ Approve    ↓ Reject
     (button)     (button)
     │            │
  ┌──┴──┐      ┌──┴──┐
  │     │      │     │
  │  Approved  │ Rejected│  ← Entry: Unlock Record
  │     │      │     │      Entry: Set status field
  │     │      │     │      Entry: Send notification email
  └──┬──┘      └──┬──┘
     ↓ terminal   ↓ terminal
```

**Key configuration:**

| State | Entry Actions |
|-------|--------------|
| Pending Approval | Lock Record; Set `custbody_o2c_approval_status` = "Pending"; Send email to role "Finance Approver" |
| Approved | Unlock Record; Set `custbody_o2c_approval_status` = "Approved"; Set `custbody_o2c_approved_date` = {today}; Set `custbody_o2c_approver` = {current user}; Send email to record creator |
| Rejected | Unlock Record; Set `custbody_o2c_approval_status` = "Rejected"; Set `custbody_o2c_rejection_reason` from transition button prompt; Send email to record creator |

**Transition buttons:**
- "Approve" button on Pending Approval state — restricted to role: Finance Approver
- "Reject" button on Pending Approval state — restricted to role: Finance Approver

---

## Pattern 2 — Multi-Level Approval Workflow

**Use case:** Large orders (>$50,000) require Director approval after Manager approval.

```
Record Type: Sales Order
Initiation: custbody_o2c_approval_required is True

State Map:
  Pending Manager Approval → (Approve button, Manager role) → Pending Director Approval
                           → (Reject button, Manager role) → Rejected (terminal)

  Pending Director Approval → (Approve button, Director role) → Approved (terminal)
                            → (Reject button, Director role) → Rejected (terminal)
                            → (Return to Manager, Director role) → Pending Manager Approval
```

**Condition on transition from Manager to Director:**
```
Amount >= 50000  → goes to Pending Director Approval
Amount < 50000   → goes directly to Approved (skip Director for small orders)
```

This uses two separate **Approve** transitions from the Pending Manager Approval state, each with a different condition and a different target state.

---

## Pattern 3 — Escalation Workflow (Time-Based)

**Use case:** If a record stays in "Pending Approval" for more than 3 business days, escalate to the manager's supervisor.

```
State: Pending Approval
  Entry Action: Send email to Approver
  Scheduled Action (after 3 days in this state):
    → Send email to [custbody_o2c_approver_supervisor]
    → Set custbody_o2c_escalated = True
  Scheduled Action (after 7 days in this state):
    → Send email to VP Finance
    → Return User Error: "This approval has been pending for 7 days. Please take action."
```

**Scheduled action configuration:**
- Delay Type: Days
- Delay Value: 3
- Day of Week constraint: Weekdays only (check "Business Days" if available in your account)
- Repeat: Yes (to re-notify every 3 days if still not actioned)

**Note:** SuiteFlow scheduled actions fire based on the time the record entered the state, not the workflow initiation time. Confirm this is the correct trigger.

---

## Pattern 4 — Field Defaulting on Creation

**Use case:** When a Sales Order is created, auto-populate `custbody_o2c_territory` based on the Customer's `custentity_o2c_territory_code`.

```
Record Type: Sales Order
Initiation: Record is Created (Run On: On Creation only)
No states needed — this is a single-trigger, single-action workflow

State: [No states — use the "Before Record Submit" action timing]
  Action: Set Field Value
    Field: custbody_o2c_territory
    Source: Customer > custentity_o2c_territory_code
    Timing: Before Record Submit (so the value is saved with the record)
```

**When field defaulting is too complex for a workflow:**
If the defaulting requires looking up data from a saved search or calculating across multiple records, use a User Event Script `beforeSubmit` instead.

---

## Pattern 5 — Notification-Only Workflow

**Use case:** When an Invoice is marked as overdue, send an automated email to the AR team.

```
Record Type: Invoice
Initiation: Status changes to "Overdue"
  Condition: {status} changed to Overdue

State: Notification Sent (terminal)
  Entry Action: Send email to role "Accounts Receivable"
    Subject: "Invoice ${tranid} is now overdue — Customer: ${entity.companyname}"
    Body: Use email template customtemplate_o2c_overdue_notification
```

**De-duplication:** Add a condition check — if `custbody_o2c_overdue_notified is True`, do not re-initiate. Set that flag in the Entry Action to prevent the email from sending on every subsequent save.

---

## Pattern 6 — Record Creation on Trigger

**Use case:** When a Sales Order is approved, automatically create an Approval Log entry (custom record).

```
State: Approved
  Entry Action: Create Record
    Record Type: customrecord_o2c_approval_log
    Field mappings:
      custrecord_o2c_log_sales_order = {internalid}   (current record)
      custrecord_o2c_log_approver = {currentuser}
      custrecord_o2c_log_action = "Approved"
      custrecord_o2c_log_date = {today}
      custrecord_o2c_log_amount = {amount}
```

**Limitation:** The "Create Record" action can set body fields but cannot add sublist lines. For complex record creation (with line items), use a Custom Action calling a SuiteScript function.

---

## Pattern 7 — Conditional Field Lock / Unlock

**Use case:** Fields should be read-only once an order is approved, but editable before.

```
State: Pending Approval
  Entry Action: Lock Record (locks all fields)
  Transition: Reject → (unlocks, returns to editable)

State: Approved
  Entry Action: Lock Record (permanent — no unlock transition)
  Entry Action: Set field custbody_o2c_locked_by_wf = True (flag for scripts to check)
```

**Selective field locking:** SuiteFlow can lock the entire record or specific fields. Use "Set Field Display" action:
```
Action: Set Field Display Type
  Field: custbody_o2c_approval_status
  Display Type: Read-only
  Timing: Before User Interaction (On Entry)
```

---

## Common Condition Syntax Reference

```
# Field equals a value
{custbody_o2c_approval_status} = "Pending Approval"

# Field is empty
{custbody_o2c_approver} is empty

# Field is not empty
{custbody_o2c_submitted_date} is not empty

# Field changed (on edit)
{custbody_o2c_status} changed

# Current user's role
{currentrole} = [Finance Approver role ID]

# Amount comparison
{amount} >= 50000

# Date comparison
{trandate} < TODAY - 30

# Checkbox
{custbody_o2c_rush_order} is True
```
