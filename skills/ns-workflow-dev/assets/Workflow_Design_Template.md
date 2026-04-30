# Workflow Design Document
## Workflow Name: [e.g., O2C Sales Order Approval]
## Workflow ID: customworkflow_[proj]_[description]
## Customization Spec Reference: [CUST-XX-NN]
## Version: 1.0 | Date: [YYYY-MM-DD] | Author: [Name]

---

### 1. Purpose

[1-2 sentences: what business process does this workflow automate and why is SuiteFlow the right tool instead of SuiteScript or manual process?]

---

### 2. Record & Initiation

| Setting | Value |
|---------|-------|
| Record Type | [e.g., Sales Order] |
| Run On | [On Creation / On Update / Always] |
| Initiation Condition | [e.g., custbody_o2c_approval_required is True AND Status is Pending Fulfillment] |
| Re-initiation Allowed? | [Yes / No — state the business reason] |
| Keep Instance History | [Yes / No — state the reason: Yes for auditable approvals, No for high-volume defaults] |
| Release Status | Testing → Released after UAT |

---

### 3. State Map

[Draw the state map as a text diagram. Include all states and transitions.]

```
Example:
[Initiation] → Pending Approval → (Approve button, Finance role) → Approved (terminal)
                               → (Reject button, Finance role) → Rejected (terminal)
                               → (Scheduled: 3 days) → Escalated → (Escalation Approved) → Approved
                                                               → (Escalation Rejected) → Rejected
```

---

### 4. States

For each state, complete this table:

#### State: [State Name]
| Property | Value |
|----------|-------|
| Description | [What does it mean for the record to be in this state?] |
| Terminal? | Yes / No |
| Entry Actions | [List actions that fire when the record enters this state] |
| Scheduled Actions | [List time-based actions, e.g., "After 3 days: send escalation email"] |
| Outbound Transitions | [List transition names that can exit this state] |

*(Repeat for each state)*

---

### 5. Transitions

For each transition, complete this table:

#### Transition: [Transition Name / Button Label]
| Property | Value |
|----------|-------|
| From State | [Source state] |
| To State | [Target state] |
| Trigger Type | Button / Condition / Scheduled / Workflow Initiation |
| Condition | [Guard condition, if any — leave blank if always allowed] |
| Role Restriction | [Which roles can trigger this transition? Leave blank if any role] |
| Actions on Transition | [Actions that fire at this specific transition point] |

*(Repeat for each transition)*

---

### 6. Actions Reference

List all actions used in this workflow with their full configuration:

| Action ID | Type | State / Transition | Timing | Configuration Summary |
|-----------|------|--------------------|--------|----------------------|
| A-01 | Set Field Value | Pending Approval (Entry) | Before Record Submit | Set custbody_o2c_approval_status = "Pending" |
| A-02 | Lock Record | Pending Approval (Entry) | After Record Submit | Lock entire record |
| A-03 | Send Email | Pending Approval (Entry) | After Record Submit | To: Finance Approver role; Template: customtemplate_o2c_approval_required |
| A-04 | Set Field Value | Approved (Entry) | Before Record Submit | Set custbody_o2c_approved_date = {today} |
| | | | | |

---

### 7. Field Dependencies

Fields that must exist before this workflow can be deployed:

| Field Label | Internal ID | Field Type | Record | Created By |
|-------------|------------|-----------|--------|-----------|
| Approval Status | custbody_o2c_approval_status | List (customlist_o2c_approval_status) | Sales Order | ns-configurator |
| Approved Date | custbody_o2c_approved_date | Date | Sales Order | ns-configurator |
| Approver | custbody_o2c_approver | List/Record → Employee | Sales Order | ns-configurator |
| | | | | |

---

### 8. Email Templates Used

| Template Name | Internal ID | Trigger Action | Recipients |
|--------------|------------|----------------|-----------|
| Approval Required | customtemplate_o2c_approval_required | A-03 (Pending Approval entry) | Finance Approver role |
| Approved Notification | customtemplate_o2c_approved | [Action ID] | Record creator |
| Rejected Notification | customtemplate_o2c_rejected | [Action ID] | Record creator |

---

### 9. Custom Actions (SuiteScript Dependencies)

If any action calls a SuiteScript function:

| Action | Script ID | Deployment ID | Purpose | Tech Doc Reference |
|--------|-----------|--------------|---------|-------------------|
| | customscript_[proj]_ | customdeploy_[proj]_ | | TechDoc_CUST-XX-NN.md |

---

### 10. Test Cases

| TC ID | Scenario | Setup | Steps | Expected Result | Pass/Fail |
|-------|---------|-------|-------|----------------|:---------:|
| TC-WF-[NN]-01 | Happy path — approval | Create SO with approval required = True | Click Approve as Finance Approver | SO status = Approved; email sent to creator | |
| TC-WF-[NN]-02 | Rejection path | Create SO with approval required = True | Click Reject as Finance Approver | SO status = Rejected; email sent to creator; record unlocked | |
| TC-WF-[NN]-03 | Non-approver tries to approve | Create SO in Pending Approval | Log in as non-Finance role; attempt Approve | Approve button not visible or transition blocked | |
| TC-WF-[NN]-04 | Escalation fires | Create SO in Pending Approval | Wait 3 days (or manually advance time in Sandbox) | Escalation email sent; custbody_o2c_escalated = True | |
| TC-WF-[NN]-05 | Re-save in Pending state | Create SO in Pending Approval | Edit and save the record again | Workflow does not re-trigger; state unchanged | |
| TC-WF-[NN]-06 | Approval required = False | Create SO without approval required | Save the record | Workflow does not initiate | |

---

### 11. Quality Gate Checklist

- [ ] Initiation condition tested — workflow fires only when expected
- [ ] All state entry actions verified in Workflow Execution Log
- [ ] All transitions tested with correct roles
- [ ] All guard conditions tested — blocked transitions confirmed
- [ ] Email templates render correctly with real field data
- [ ] Locked states prevent unauthorized edits
- [ ] Workflow does not double-trigger on consecutive saves
- [ ] Instance history setting confirmed and documented
- [ ] All field dependencies exist in the target environment
- [ ] Workflow Release Status set to **Testing** (not Released)
- [ ] All test cases in Section 10 executed and documented

---

### 12. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Workflow Developer | | | |
| Technical Lead / Reviewer | | | |
| Functional Consultant | | | |
| QA / Test Manager | | | |
| Client Sign-Off | | | |
