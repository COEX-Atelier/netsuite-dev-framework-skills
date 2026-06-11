# NetSuite Configuration Naming Conventions

All configuration object names and internal IDs must follow these conventions. Internal IDs are permanent — they cannot be changed after data is entered against them. Consistent naming makes searching, scripting, and debugging faster for everyone on the project.

---

## The `[proj]` Code

Every internal ID includes a 2-4 letter project code. This is set at project kickoff and never changes.

| Project Area | Example Code |
|-------------|-------------|
| Order-to-Cash | `o2c` |
| Procure-to-Pay | `p2p` |
| Inventory Management | `inv` |
| Record-to-Report | `r2r` |
| Human Resources | `hr` |
| Projects / PSA | `psa` |
| Multi-project / shared | `glb` (global) |

---

## Internal ID Conventions by Object Type

### Custom Fields

| Field Location | Prefix | Example |
|---------------|--------|---------|
| Transaction body | `custbody_[proj]_` | `custbody_o2c_approval_status` |
| Transaction line | `custcol_[proj]_` | `custcol_o2c_lead_time_days` |
| Customer / Vendor / Contact (entity) | `custentity_[proj]_` | `custentity_o2c_territory_code` |
| Item | `custitem_[proj]_` | `custitem_o2c_reorder_threshold` |
| Custom record field | `custrecord_[proj]_` | `custrecord_o2c_log_approver` |
| Employee | `custemployee_[proj]_` | `custemployee_hr_job_level` |
| Event / Task / Call | `custevent_[proj]_` | `custevent_o2c_outcome` |

### Custom Records

```
customrecord_[proj]_[description]

Examples:
  customrecord_o2c_approval_log
  customrecord_p2p_vendor_scorecard
  customrecord_inv_reorder_rule
```

### Custom Lists

```
customlist_[proj]_[description]

Examples:
  customlist_o2c_approval_status     → values: Pending, Approved, Rejected, Escalated
  customlist_p2p_vendor_tier         → values: Preferred, Standard, Restricted
  customlist_inv_storage_zone        → values: Zone A, Zone B, Cold Storage
```

### Saved Searches

```
customsearch_[proj]_[description]

Examples:
  customsearch_o2c_pending_approvals
  customsearch_p2p_overdue_pos
  customsearch_inv_low_stock_alert
```

### Scripts & Deployments

```
Script ID:      customscript_[proj]_[description]_[type]
Deployment ID:  customdeploy_[proj]_[description]_[type]

Script type abbreviations:
  ue   = User Event Script
  cs   = Client Script
  mr   = Map/Reduce Script
  ss   = Scheduled Script
  rl   = RESTlet
  sl   = Suitelet
  mu   = Mass Update Script

Examples:
  customscript_o2c_approval_ue
  customdeploy_o2c_approval_ue
  customscript_p2p_po_sync_rl
  customdeploy_p2p_po_sync_rl
```

### Workflows

```
customworkflow_[proj]_[description]

Examples:
  customworkflow_o2c_so_approval
  customworkflow_p2p_invoice_approval
  customworkflow_inv_reorder_alert
```

### Custom Forms

```
[Proj Abbreviation] [Record Name] [Variant] Form

Examples:
  O2C Sales Order Approval Form
  P2P Purchase Order Standard Form
  INV Item Reorder Form
```

No internal ID constraint — NetSuite generates the ID for forms — but the name must follow the pattern.

### Script Parameters

```
custscript_[proj]_[description]

Examples:
  custscript_o2c_admin_email
  custscript_o2c_approval_threshold
  custscript_p2p_sync_enabled
  custscript_inv_reorder_lead_days
```

### Custom Modules (SuiteScript files)

```
File path: SuiteScripts/[Proj]/[scriptid].js

Examples:
  SuiteScripts/O2C/customscript_o2c_approval_ue.js
  SuiteScripts/O2C/lib_o2c_approval.js       ← shared module, no deployment record
  SuiteScripts/P2P/customscript_p2p_po_sync_rl.js
```

---

## Field Label Conventions

Labels are what users see. They must be:
- **Human-readable:** "Approval Status" not "custbody_o2c_approval_status"
- **Consistent with the SDD:** Match exactly what the Architect specified
- **Role-appropriate:** Finance users shouldn't see "GL Impact Flag"; call it "Ready to Post"
- **Free of jargon:** Avoid internal system terms in user-facing labels

| Bad Label | Better Label |
|-----------|-------------|
| custbody_status | Approval Status |
| IS_PROC_FLAG | Processing Complete |
| EXT_REF_1 | Customer PO Number |
| TEMP_CALC_AMT | Approved Amount |

---

## Naming Anti-Patterns to Avoid

| Anti-Pattern | Example | Problem |
|-------------|---------|---------|
| No project prefix | `custbody_status` | Ambiguous; clashes with fields from other implementations |
| Generic names | `customrecord_log` | Which log? What project? |
| Numbers instead of descriptions | `customscript_001` | Non-searchable, non-self-documenting |
| Abbreviations no one knows | `custbody_o2c_aprvl_st` | "aprvl_st" is not obvious — use `approval_status` |
| Mixing underscores and hyphens | `custbody_o2c-approval-status` | NetSuite auto-converts hyphens; use underscores only |
| Exceeding length limits | `customrecord_o2c_very_long_description_of_the_record_type` | NetSuite enforces a 40-character limit on internal IDs |

**40-character limit:** NetSuite internal IDs are capped at 40 characters. Plan accordingly.

```
customrecord_  = 13 chars
[proj]_        = 4 chars  (e.g., o2c_)
[description]  = 23 chars remaining

Budget your description to fit within 40 total characters.
```
