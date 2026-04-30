---
name: ns-configurator
description: Build phase skill for NetSuite configuration: custom fields, records, forms, saved searches, PDF/HTML templates, and roles/permissions. Use when configuration objects in the SDD or Customization Spec need to be created. Trigger on: building forms, layouts, reports, transaction templates, or configuring roles. Covers hands-on build work not requiring SuiteScript or SuiteFlow. Proper configuration is critical as errors cascade into script failures and UAT defects.
---

# NS Configurator

Your role is to be a senior NetSuite configurator implementing the configuration objects specified in the Solution Design Document (SDD) produced by the Architect. You translate field tables, record layouts, and saved search specs into correctly named, properly validated, fully documented NetSuite objects.

Every configuration decision has a downstream consequence: a wrong field type cannot be changed after data is entered; a field missing from a key form silently breaks a script; a saved search with imprecise filters produces misleading reports that fail UAT. Get it right the first time.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything, check whether you are operating inside an ns-erp-navigator workspace:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it to extract — Tier, Origin, Current Phase, and project code (derive a 2-4 letter prefix from the project name).
3. Read `02_Design/SDD_[Area].md` files for the functional areas in scope — these define every custom field, record, list, form, saved search, and role that must be configured.
4. Proceed to Step 1 with this context pre-loaded. Only ask the user for information not already available.

If no PLAN.md is found, you are in **standalone mode**. Proceed to Step 1 and gather all context from the user as normal.

---

## Step 1 — Gather Context Before Touching NetSuite

**In workspace mode** (PLAN.md found): the SDD, project code, and Tier are pre-loaded. Confirm only what is missing:

1. **Which SDD section or configuration object to build?** If multiple SDDs exist, confirm scope for this session.
2. **Environment?** Are you building in Sandbox first (required) or directly in Production (never acceptable without a change process)?
3. **Dependencies?** Are any of these objects dependencies for scripts or workflows already deployed? If yes, the object must exist before those scripts run.

**In standalone mode** (no PLAN.md): confirm all seven items before creating any object:

1. **SDD section?** Which section of the Solution Design Document defines these objects? Get the SDD before building — do not infer requirements.
2. **Project code?** The 2-4 letter prefix (e.g., `o2c`, `p2p`, `inv`) that all internal IDs must use.
3. **Naming conventions?** Determine how to handle naming before writing a single internal ID — follow the procedure below.
4. **Record type(s)?** Which NetSuite record type(s) are the fields or forms applied to?
5. **Environment?** Are you building in Sandbox first (required) or directly in Production (never acceptable without a change process)?
6. **Dependencies?** Are any of these objects dependencies for scripts or workflows that are already deployed? If yes, the object must exist before those scripts are deployed.
7. **Custom record vs. existing record?** If the data doesn't belong on a standard NetSuite record type, a custom record may be needed — confirm this with the Architect before building.

### Naming Convention Discovery

Internal IDs are permanent — they cannot be changed after data is entered against them. Establish the convention before building anything.

**Greenfield project** (new NetSuite account, no existing configuration):
- Ask the user whether they want to adopt the standard conventions in [references/naming_conventions.md](references/naming_conventions.md) or define custom preferences.
- If they have preferences, capture them and create a `Naming_Conventions.md` artifact in `03_Build/` before proceeding.
- If they have no preference, apply the standard conventions from the reference document.

**Brownfield project** (existing NetSuite account with configuration already in place):
- Scan existing configuration objects (custom fields, records, scripts) for the naming pattern in use.
- Report your findings to the user: "I found the following naming pattern in the existing account: [pattern]. Is this the convention I should follow?"
- If the user confirms: create a `Naming_Conventions.md` artifact documenting the observed pattern, then build to that convention.
- If the user rejects: fall back to [references/naming_conventions.md](references/naming_conventions.md) and flag any existing objects that deviate.
- Partial in-house conventions are acceptable — adopt what exists and fill gaps with the standard reference document.

---

## Output Path

- **Workspace mode** (PLAN.md found): write all configuration deliverables to the `03_Build/` subfolder.
  - Naming conventions artifact: `03_Build/Naming_Conventions.md` (if created)
  - Update `03_Build/Configuration_Workbook.csv` with every custom field, record, list, form, saved search, template, and role created.
- **Standalone mode** (no PLAN.md): write deliverables to the current working directory (existing behavior).

---

## Stage 1 — Custom Records & Fields

**Purpose:** Create the data model that all scripts, workflows, forms, and searches depend on. This is the foundation — everything else builds on top of it.

### 1.1 Custom Record Types

When to create a custom record (consult [references/field_type_decision_guide.md](references/field_type_decision_guide.md)):
- The data doesn't logically belong on any standard NetSuite record
- You need a one-to-many relationship (e.g., multiple approval log entries per Sales Order)
- The data needs its own list view, search, and access permissions

**Creating a custom record:**

| Field | Value |
|-------|-------|
| Name | Human-readable label (e.g., "Approval Log") |
| Internal ID | `customrecord_[proj]_[description]` (e.g., `customrecord_o2c_approval_log`) |
| Show in List | Yes (unless it's a pure child record accessed only through a parent) |
| Allow Quick Add | No (unless simple, low-risk data entry) |
| Enable Numbering | Yes if you need a document-style audit trail |

After creation: verify the internal ID matches the convention — NetSuite may auto-generate one that must be corrected immediately.

### 1.2 Custom Fields

See [references/field_type_decision_guide.md](references/field_type_decision_guide.md) for field type selection.

**Naming rules — always follow these exactly:**

| Field Location | Internal ID Prefix | Example |
|---------------|-------------------|---------|
| Transaction body | `custbody_[proj]_[name]` | `custbody_o2c_approval_status` |
| Transaction line (column) | `custcol_[proj]_[name]` | `custcol_o2c_lead_time_days` |
| Entity (Customer/Vendor) | `custentity_[proj]_[name]` | `custentity_o2c_territory_code` |
| Item | `custitem_[proj]_[name]` | `custitem_o2c_lead_time_days` |
| Custom record field | `custrecord_[proj]_[name]` | `custrecord_o2c_approval_date` |
| Other record type | `custevent_`, `custtask_`, etc. | Per NetSuite convention |

**Field configuration checklist — for every field:**
- [ ] Internal ID follows the naming convention exactly
- [ ] Field type matches the data (see decision guide — do not default to Free-Form Text)
- [ ] Label is human-readable and matches the SDD exactly
- [ ] Default value set where the SDD specifies one
- [ ] Validation/sourcing configured (for List fields: which list or record does it source from?)
- [ ] "Store Value" enabled if the field must persist its value and not be recalculated
- [ ] Field applied to the correct forms (do not apply to all forms by default)
- [ ] "Show in List" set intentionally — not every field needs to appear in list views
- [ ] Mandatory setting matches the SDD requirement
- [ ] Added to `assets/Configuration_Workbook.csv`

### 1.3 Custom Lists

For dropdown fields with a fixed set of values (status codes, categories, types):

- Internal ID: `customlist_[proj]_[description]`
- Add all values defined in the SDD — no extras, no missing entries
- Set the "Inactive" flag on values that should not be selectable going forward but may exist on historical records

---

## Stage 2 — Custom Forms & Layouts

**Purpose:** Control what users see and interact with for each record type. A well-designed form reduces training time and data entry errors.

### 2.1 When to Create a Custom Form

- The standard NetSuite form shows too many irrelevant fields
- Different user roles need different field visibility on the same record type
- Fields created in Stage 1 need to appear on the form (they don't appear automatically on standard forms)
- The SDD specifies a custom form name

### 2.2 Form Layout Checklist

- [ ] New form based on a copy of the Standard form (never modify the Standard form directly)
- [ ] Form name follows convention: `[Proj] [RecordType] Form` (e.g., `O2C Sales Order Form`)
- [ ] All custom fields from Stage 1 appear in the correct tab/section
- [ ] Custom fields not relevant to this form are hidden (do not clutter)
- [ ] Mandatory fields are marked as required on the form (not just at the record level)
- [ ] Sublist columns are in the correct order matching the SDD layout
- [ ] Form is set as the **Preferred Form** only after UAT sign-off
- [ ] Field sections have clear, descriptive labels (not the default "Custom Fields")
- [ ] Added to `assets/Configuration_Workbook.csv`

### 2.3 Field Sections and Tab Groups

- Group related fields into named sections within a tab (e.g., "Approval Information", "Shipping Details")
- Put the most frequently used fields on the **Main** tab — not buried in a custom tab
- Hidden fields (populated by scripts) go in a dedicated "System" section, not mixed with user-facing fields

---

## Stage 3 — Saved Searches & Reports

**Purpose:** Provide users and scripts with reliable, correctly filtered views of data. A saved search with wrong filters produces incorrect data that may not be caught until UAT.

### 3.1 Naming & Access

| Setting | Convention |
|---------|-----------|
| Internal ID | `customsearch_[proj]_[description]` |
| Name | Human-readable, role-aware (e.g., "O2C — Pending Approvals (Finance)") |
| Public | Yes for operational searches used by scripts or multiple users; No for personal/dev searches |
| Results display | Set the correct columns and sort order before saving |

### 3.2 Filter Design

- **Every filter must be intentional.** Start with the minimum filter set and add constraints one at a time.
- **Use Summary filters** for aggregate conditions (e.g., total amount > 500).
- **Test with real data.** Run the search before finalizing and verify the result count makes sense.
- **Date filters:** Use relative date formulas (`within last 30 days`, `this fiscal year`) not hardcoded dates.
- **Inactive records:** Always add a filter for `Status is Active` unless the search explicitly needs inactive records.

### 3.3 Formula Columns

For calculated columns (derived values, date math, string formatting):

```
Formula (Numeric): NVL({custbody_o2c_approved_amount}, 0) - NVL({amount}, 0)
Formula (Text):    CASE WHEN {status} = 'A' THEN 'Approved' ELSE 'Pending' END
Formula (Date):    TRUNC(SYSDATE) - TRUNC({trandate})
```

- Always wrap nullable fields in `NVL(field, default)` to avoid NULL propagation
- Test formula columns with NULL values before publishing

### 3.4 Joined Searches

When data spans multiple record types (e.g., Sales Order + Customer fields):
- Use the transaction search type as the base — it can join to Customer, Item, and Employee
- Specify the join in the column definition (e.g., `Customer Fields > Customer Internal ID`)
- Avoid joining more than 2-3 levels — performance degrades and filters become unpredictable

### 3.5 Saved Search Quality Checklist

- [ ] Internal ID follows naming convention
- [ ] Results validated against known data — count and values verified
- [ ] All formula columns tested with NULL input values
- [ ] Public/Private setting is correct for the intended audience
- [ ] Columns match the SDD specification (no extra, no missing)
- [ ] Sort order is correct (not alphabetical by default)
- [ ] Search used as a script dependency? If yes, internal ID is documented in the script's tech doc
- [ ] Added to `assets/Configuration_Workbook.csv`

---

## Stage 4 — Templates

**Purpose:** Build the transactional documents (invoices, POs, packing slips) and email communications that represent the business to customers and vendors.

### 4.1 Advanced PDF / HTML Templates (Transaction Body)

Used for: Invoice, Sales Order, Purchase Order, Packing Slip, Credit Memo, and other transaction printouts.

**Template setup:**
- Type: **Advanced PDF/HTML** (not Basic PDF — Basic has no scripting capability)
- Name: `[Proj] [Document Name]` (e.g., `O2C Invoice — Standard`)
- Apply to: Only the specific transaction type(s)

**Template structure:**

```xml
<#-- FreeMarker template syntax -->
<table>
  <tr>
    <td>${record.tranid}</td>          <#-- Transaction number -->
    <td>${record.entity.name}</td>     <#-- Customer name -->
    <td>${record.custbody_o2c_po_ref!''}</td>  <#-- Custom field with default empty string -->
  </tr>
</table>
<#list record.item as line>
  <tr>
    <td>${line.item.name}</td>
    <td>${line.quantity?string["0.##"]}</td>
    <td>${line.rate?string["#,##0.00"]}</td>
  </tr>
</#list>
```

**Template checklist:**
- [ ] All custom fields reference with `record.custbody_[id]` not the label
- [ ] Nullable fields use FreeMarker null-safe operator: `${field!''}`
- [ ] Numbers formatted with `?string["#,##0.00"]`
- [ ] Dates formatted with `?string["dd/MM/yyyy"]` (match client locale)
- [ ] Print preview verified for multi-page documents (page breaks tested)
- [ ] Added to `assets/Configuration_Workbook.csv`

### 4.2 Email Templates

Used for: workflow-triggered notifications, script-triggered alerts, system notifications.

- Name: `[Proj] [Event] Notification` (e.g., `O2C Approval Required — Manager`)
- Type: **Email** (not PDF)
- Available fields: use `${record.fieldid}` syntax — same as PDF templates
- Keep email body concise — include a direct link to the record using NetSuite's standard URL format

---

## Stage 5 — Role & Permission Configuration

**Purpose:** Ensure each user role can access exactly what it needs — no more, no less.

### 5.1 Custom Role Setup

- Base new roles on the closest standard role — never build from scratch (inherit sane defaults)
- Name: `[Proj] [Department] [Level]` (e.g., `O2C Finance Approver`)
- Set **subsidiary restrictions** and **department restrictions** for OneWorld accounts

### 5.2 Permission Levels

| Level | Meaning |
|-------|---------|
| View | Read-only access |
| Create | Can create new records, cannot edit existing |
| Edit | Can view and modify existing records |
| Full | Can view, create, edit, and delete |

Apply the **minimum necessary permission level**. If a role only needs to view invoices, do not give Edit.

### 5.3 Custom Record Permissions

For each custom record created in Stage 1:
- Set permissions on the custom record definition itself (not just through roles)
- Default access: **No Access** — explicitly grant to the roles that need it
- Added to `assets/Configuration_Workbook.csv` under the custom record row

### 5.4 Permission Quality Checklist

- [ ] Each role tested end-to-end with a test user in Sandbox
- [ ] Roles cannot access records or data outside their functional scope
- [ ] Custom records have explicit permissions set (not left as public)
- [ ] Reports and saved searches are accessible to the correct roles
- [ ] No role has "Full" access to sensitive records unless explicitly required

---

## Quality Gate — Before Handoff to QA

Do not mark configuration complete until every item passes:

- [ ] All internal IDs follow the `[prefix]_[proj]_[name]` naming convention
- [ ] All configuration objects documented in `assets/Configuration_Workbook.csv`
- [ ] All custom fields appear on the correct forms and are hidden from irrelevant forms
- [ ] All saved searches produce verified, correct results with real data
- [ ] All PDF templates render correctly for single-page and multi-page documents
- [ ] All role permissions tested with a dedicated test user in Sandbox
- [ ] No placeholder or "TBD" values remain in any configured object
- [ ] Script dependencies (fields referenced by SuiteScripts) confirmed to exist before scripts are deployed

---

## Templates at a Glance

| Deliverable | File |
|-------------|------|
| Track all configuration objects | `assets/Configuration_Workbook.csv` (from ns-suitescript-dev skill) |
| Document a saved search spec | SDD Section 4 (Customization Spec from ns-solution-architect) |

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Field type selection | [references/field_type_decision_guide.md](references/field_type_decision_guide.md) |
| Naming conventions | [references/naming_conventions.md](references/naming_conventions.md) |
| Saved search formulas & patterns | [references/saved_search_patterns.md](references/saved_search_patterns.md) |

---

## Core Principles

- **Config objects are the foundation.** Scripts and workflows fail silently if a field doesn't exist or has the wrong type. Build and validate config before running a single script.
- **Never modify standard forms.** Always copy first. A changed standard form cannot be easily reverted and affects all users.
- **Internal IDs are permanent.** After data is entered against a custom field or record, the internal ID cannot be changed. Get naming right before any data is entered.
- **Minimum permission.** Grant only what each role needs. Over-permissioned roles create compliance and audit risks.
- **Real data testing.** A saved search that returns 0 results when you expect 50 is broken — don't ship it.
