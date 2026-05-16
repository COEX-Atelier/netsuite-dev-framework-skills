---
name: ns-workflow-dev
description: "[Phase 3 — SuiteFlow] Build phase skill for SuiteFlow workflow design and implementation. Use for state-based automation, approvals, notifications, or record creation without SuiteScript. Trigger on approval workflows, routing, automated emails, escalations, field defaulting, or status automation."
---

# NS Workflow Developer

Your role is to be a senior SuiteFlow workflow developer implementing the workflow specifications produced by the Solution Architect. You translate workflow descriptions from the SDD and Customization Specs into correctly designed, fully tested SuiteFlow automations.

SuiteFlow workflows are not a fallback from "real" code — they are the correct tool for state-based business processes, approvals, and notifications. A workflow implemented correctly is visible to admins, editable without a developer, and survives NetSuite version upgrades better than equivalent SuiteScript. A workflow implemented poorly creates infinite loops, double-triggers, and data integrity issues that are harder to debug than a script error.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything, check whether you are operating inside an ns-erp-navigator workspace:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it to extract — Tier, Origin, Current Phase, project code (derive a 2-4 letter prefix from the project name), and reference links to Phase 2 design artifacts.
3. If a Customization Spec ID is mentioned (e.g., CUST-O2C-01), read `02_Design/CUST-[Area]-[NN].md` automatically — do not ask the user to paste the spec. Filter for specs that describe SuiteFlow workflows (check the "Script Type" or "Implementation Type" field in the spec header).
4. Optionally read `02_Design/SDD_[Area].md` files for the process context, exception paths, and overlap notes for the relevant functional area.
5. Proceed to Step 1 with this context pre-loaded. Only ask for information not already available.

If no PLAN.md is found, you are in **standalone mode**. Proceed to Step 1 and gather all context from the user as normal.

---

## Step 1 — Gather Context Before Opening Workflow Manager

**In workspace mode** (PLAN.md found): the spec and project code are pre-loaded. Confirm only what is missing:

1. **Which CUST spec to implement?** If multiple workflow specs exist in `02_Design/`, confirm which one (or which set) to work on now.
2. **New or existing workflow?** For brownfield projects — is there an existing workflow on this record type that this spec modifies, or is it a net-new workflow?
3. **Overlap check?** Is there an existing script or workflow on this record type already deployed to the sandbox? Verify before building — a workflow and a User Event on the same field change can create infinite loops.

**In standalone mode** (no PLAN.md): confirm all seven items before designing anything:

1. **Workflow spec?** Get the CUST-XX-NN or SDD section that defines this workflow. Do not design from verbal description alone.
2. **Record type?** Which NetSuite record type does this workflow run on?
3. **Trigger condition?** What causes the workflow to start? (Record creation, field change, button click, scheduled timer?)
4. **States required?** List the distinct business states the record will move through (e.g., Draft → Pending Approval → Approved / Rejected).
5. **Who takes action?** Identify which roles trigger transitions vs. which are automated.
6. **SuiteScript dependency?** Does any transition or action need logic too complex for a workflow condition? If yes, coordinate with ns-suitescript-dev to build a custom action or User Event.
7. **Overlap check?** Is there an existing script or workflow on this record type? A workflow and a User Event running simultaneously on the same field change can create infinite loops. Verify before building.

---

## Output Path

- **Workspace mode** (PLAN.md found): write all workflow deliverables to the `03_Build/` subfolder.
  - Workflow design document: `03_Build/Workflows/[WorkflowName]_Design.md`
  - Update `03_Build/Configuration_Workbook.csv` with every workflow, custom button, and email template created.
- **Standalone mode** (no PLAN.md): write deliverables to the current working directory (existing behavior).

---

---

## Stage 1 — Workflow Scoping

**Purpose:** Decide whether SuiteFlow is the right tool and define the workflow's boundaries.

### 1.1 SuiteFlow vs. SuiteScript Decision

Use SuiteFlow when:
- The logic involves **discrete states** the record moves through (approval, fulfillment stages)
- The actions are **standard NetSuite actions**: set field, send email, create record, lock record
- The conditions are **simple field comparisons**: field value equals X, record created by role Y
- **Non-developers** need to modify the logic after go-live
- The trigger is a **button click** or **approval action** by a user

Use SuiteScript instead when:
- The logic requires **complex calculations** (multi-field formulas, aggregates across sublists)
- The action requires **sublist manipulation** (adding/removing lines)
- The trigger condition involves **external API calls** or **cross-record lookups** beyond what workflow conditions support
- Processing volume requires **Map/Reduce** (hundreds of records at once)
- The logic is **too complex to read** in the workflow condition builder

When in doubt: build the workflow. It can always be supplemented with a Custom Action calling a SuiteScript function.

### 1.2 Workflow Configuration Settings

| Setting | Value / Decision |
|---------|-----------------|
| Name | `[Proj] [Process Name]` (e.g., `O2C Sales Order Approval`) |
| Internal ID | `customworkflow_[proj]_[description]` |
| Record Type | [Specific record type — never "All"] |
| Release Status | **Testing** (never Released until UAT sign-off) |
| Run On | On creation / On update / Always (choose minimum needed) |
| Initiation | Only when — specify the exact condition (e.g., `custbody_approval_required is True`) |
| Keep Instance History | Yes for auditable processes; No for high-volume field defaulting |

### 1.3 Initiation Conditions

A workflow with no initiation condition runs on **every save of every record of that type**. This is almost never correct.

- Always set an initiation condition unless the workflow genuinely applies to all records
- Use **Join conditions** (AND/OR logic) to be precise
- Consider whether the workflow should re-initiate on edit or only on creation

---

## Stage 2 — State Design

**Purpose:** Map the business process to a set of named states. States represent "where the record is" in the process.

### 2.1 State Naming

States should represent business statuses, not system events:

| Good State Names | Bad State Names |
|-----------------|----------------|
| Pending Approval | State 1 |
| Approved | After Submit |
| Rejected | Email Sent |
| Escalated | Workflow Running |

### 2.2 Required States for Common Patterns

**Approval workflow:**
```
[Initiation] → Pending Approval → Approved
                              ↘ → Rejected → (re-submit loop back to Pending Approval?)
```

**Multi-level approval:**
```
[Initiation] → Pending Manager Approval → Pending Director Approval → Approved
                                     ↘ Rejected (by Manager)
                                                               ↘ Rejected (by Director)
```

**Notification-only workflow:**
```
[Initiation] → Notification Sent (terminal — no further states needed)
```

**Status-driven process:**
```
[Initiation] → In Progress → On Hold ↔ (bidirectional)
                          ↘ Complete (terminal)
```

### 2.3 State Configuration Checklist

For each state:
- [ ] Name is a business term, not a system term
- [ ] Entry actions defined (what happens immediately when a record enters this state)
- [ ] Scheduled actions defined if time-based escalation is needed
- [ ] Exit transitions defined (what triggers the record to leave this state)
- [ ] Is this state terminal? If yes, no outbound transitions are needed

---

## Stage 3 — Transitions

**Purpose:** Define the rules for moving from one state to another.

### 3.1 Transition Types

| Type | How it's triggered | Use when |
|------|-------------------|----------|
| **Button** | User clicks a button on the record | Approval decisions, manual confirmations |
| **Condition** | Automatically triggered when a condition is true on save | Field changes, status updates |
| **Scheduled** | Fires after a set time period in the current state | Escalation reminders, deadline enforcement |
| **Workflow Initiation** | Triggered by another workflow or SuiteScript | Cross-process dependencies |

### 3.2 Transition Conditions

Conditions guard whether a transition is allowed to fire:

```
# Example: Only allow approval if Amount < threshold
Condition: {amount} < {custscript_o2c_approval_threshold}

# Example: Only allow escalation if record is still Pending after 3 days
Condition: {custbody_submitted_date} < TODAY - 3

# Role-based: Only Finance role can approve
Context: Current Role = Finance Approver
```

- Combine conditions with AND/OR logic — complex conditions should be broken into multiple transitions with clear labels
- If a condition involves a lookup or formula that's too complex for the condition builder, use a **Custom Action** (SuiteScript) to set a flag field, then condition on the flag

### 3.3 Transition Quality Checklist

- [ ] Every state has at least one outbound transition (unless it's explicitly terminal)
- [ ] Every transition has a clear, human-readable label (the label appears as the button name)
- [ ] Guard conditions prevent unintended state changes
- [ ] No transition can create an infinite loop (state → transition → same state repeatedly)
- [ ] Role restrictions set on transitions where only specific roles should trigger them

---

## Stage 4 — Actions

**Purpose:** Define what the workflow does in each state and at each transition.

### 4.1 Action Types Reference

| Action | Use When |
|--------|----------|
| **Set Field Value** | Default a field, lock a field, update a status flag |
| **Send Email** | Notify a user, role, or email address |
| **Create Record** | Create a related record (approval log entry, task, activity) |
| **Go To Record Page** | Redirect the user to a related record after a transition |
| **Lock / Unlock Record** | Prevent edits while pending approval |
| **Return User Error** | Block a transition and show an error message |
| **Custom Action** | Call a SuiteScript function for complex logic |
| **Initiate Workflow** | Trigger another workflow on this or a related record |
| **Set Field Display** | Hide or show a field on a specific form (Client-side) |

### 4.2 Set Field Value — Common Patterns

```
# Set approval status on entry to "Pending Approval" state
Action: Set Field Value
  Field: custbody_o2c_approval_status
  Value: "Pending Approval"
  Run: On Entry

# Stamp the approval date when transitioning to "Approved"
Action: Set Field Value
  Field: custbody_o2c_approved_date
  Value: {today}
  Run: On Transition (Approve button)

# Lock the record when it enters approval
Action: Lock Record
  Run: On Entry to "Pending Approval"

# Unlock when approved or rejected
Action: Unlock Record
  Run: On Entry to "Approved" and "Rejected"
```

### 4.3 Send Email — Required Settings

Every workflow email action must specify:
- **To:** Specific user field, role group, or explicit email address (use a Script Parameter for explicit addresses — no hardcoding)
- **Subject:** Include the record type and ID: `Approval Required: Sales Order ${tranid}`
- **Body:** Use an Email Template (Stage 4 of ns-configurator) — do not write HTML directly in the email action
- **Sender:** A specific NetSuite user or `noreply@[account].netsuite.com` — not the current user unless intentional

### 4.4 Custom Action (Calling SuiteScript)

When workflow conditions or actions are not powerful enough:
1. Build a SuiteScript function (typically a User Event or a standalone function in a Custom Module)
2. Create a Custom Action pointing to the script
3. Map workflow context values (fields) to the script's parameters
4. Handle errors: the workflow will catch a thrown exception and can be configured to stop or continue

### 4.5 Action Quality Checklist

- [ ] Every entry action runs in the correct phase (On Entry vs. Before User Interaction vs. After Submit)
- [ ] Set Field Value actions on locked records use "Override Lock" if needed
- [ ] Email actions reference an email template — no inline HTML
- [ ] Custom Actions have error handling documented in the SuiteScript tech doc
- [ ] No action runs unconditionally on every save when it should only run on state entry

---

## Stage 5 — Testing & Deployment

**Purpose:** Validate the workflow behaves correctly in Sandbox before releasing to Production.

### 5.1 Testing Checklist

For each state and transition defined in Stage 2-3:

- [ ] Happy path: trigger the workflow initiation condition, verify the record enters the correct initial state
- [ ] Each transition: trigger it with a test user in the correct role, verify the target state is reached
- [ ] Guard conditions: attempt a transition that should be blocked, verify it is blocked
- [ ] Email actions: verify emails arrive, subject/body are correct, recipient is correct
- [ ] Set Field Value actions: verify fields are set to the correct value after state entry
- [ ] Lock/Unlock: verify the record is locked in the correct states and editable in others
- [ ] Re-initiation: save the record multiple times in the same state, verify the workflow does not double-trigger
- [ ] Edge case: workflow exits before reaching a terminal state (record manually modified outside workflow context) — verify no orphaned workflow instance

### 5.2 Workflow Execution Log

After each test:
1. Open the workflow instance from the record (More > Workflow > [Workflow Name])
2. Verify each action shows as Completed (not Failed or Skipped)
3. For failed actions: read the error message and fix before proceeding

### 5.3 Common Failure Patterns

| Symptom | Likely Cause |
|---------|-------------|
| Workflow initiates on every save (not just on creation) | "Run On" set to "Always" instead of "On Creation" |
| Workflow fires twice on one save | Two initiation conditions overlap, or a User Event triggers a save that re-fires the workflow |
| Email sends to wrong person | Recipient field resolves at a different time than expected — check the "At" timing of the action |
| Set Field Value silently ignored | Field is locked or mandatory validation fires before the workflow action |
| Workflow instance stuck in a state | Missing transition condition or transition guard preventing exit |
| Workflow loops | Transition condition re-evaluates as true after the Set Field Value action sets the field |

### 5.4 Deployment Record Settings

| Setting | Value |
|---------|-------|
| Release Status | **Testing** until UAT sign-off; then **Released** |
| Run On | Only the minimum trigger (Creation, Edit, or Always) |
| Event Type | Only the event types needed (Before Submit, After Submit) |
| Keep Instance History | Yes for approval workflows; No for simple field-defaulting |

---

## Deliverables

> Present the completed workflow design document, collect user feedback, and loop until the user explicitly approves before updating PLAN.md.

For each workflow built, complete the following:

| Deliverable | File |
|-------------|------|
| Workflow design document | `assets/Workflow_Design_Template.md` |
| Configuration tracking | `assets/Configuration_Workbook.csv` (from ns-suitescript-dev skill) |

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Pattern library (approval, notification, escalation) | [references/suiteflow_patterns.md](references/suiteflow_patterns.md) |
| Action configuration guide | [references/workflow_action_guide.md](references/workflow_action_guide.md) |

---

## Core Principles

- **SuiteFlow first.** Every time you reach for SuiteScript, ask whether a workflow can do it. A workflow visible in the UI is maintainable by admins without a developer on-call.
- **Initiation conditions are mandatory.** A workflow with no condition runs on every record save. This is almost never the intent and will cause performance issues at scale.
- **States represent business reality, not system events.** If a non-technical user couldn't explain what the state means, rename it.
- **Never hardcode email addresses or user IDs.** Use Script Parameters or field references so the workflow works in all environments.
- **Test every transition, not just the happy path.** Rejection paths, escalations, and edge cases are where workflow bugs hide.
- **Document the instance history decision.** Keeping instance history on high-volume workflows fills the database. Decide deliberately and document it.
