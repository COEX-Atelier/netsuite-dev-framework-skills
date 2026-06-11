# Configuration Build Checklist
## Project: [Project Name] | Functional Area: [Area Code] | Date: [YYYY-MM-DD]

Use this checklist for every configuration object created in this build phase. Complete one row per object. File this with the Configuration_Workbook.csv.

---

## Custom Records

| Record Name | Internal ID | Fields Defined | Form Created | Permissions Set | Workbook Updated | QA Tested |
|------------|------------|:--------------:|:------------:|:---------------:|:----------------:|:---------:|
| | customrecord_[proj]_ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## Custom Fields

For each field, verify all items before marking complete.

| Field Label | Internal ID | Field Type | Record Applied To | Form(s) Applied | Default/Validation | Workbook Updated | QA Verified |
|------------|------------|-----------|------------------|----------------|-------------------|:---------------:|:-----------:|
| | custbody_[proj]_ | | | | | ☐ | ☐ |
| | custcol_[proj]_ | | | | | ☐ | ☐ |
| | custentity_[proj]_ | | | | | ☐ | ☐ |
| | custitem_[proj]_ | | | | | ☐ | ☐ |

---

## Custom Lists

| List Name | Internal ID | Values Defined | Field(s) Sourcing This List | Workbook Updated |
|-----------|------------|:--------------:|:---------------------------:|:---------------:|
| | customlist_[proj]_ | ☐ | | ☐ |

---

## Custom Forms

| Form Name | Record Type | Based On | Custom Fields Added | Layout Verified | Set as Preferred | Workbook Updated |
|-----------|------------|----------|:-------------------:|:---------------:|:----------------:|:---------------:|
| | | Standard Form | ☐ | ☐ | After UAT | ☐ |

---

## Saved Searches

| Search Name | Internal ID | Filters Verified | Results Validated | Formula Columns Tested | Public Setting | Script Dependency Noted | Workbook Updated |
|------------|------------|:----------------:|:-----------------:|:---------------------:|:--------------:|:-----------------------:|:---------------:|
| | customsearch_[proj]_ | ☐ | ☐ | ☐ | Yes / No | ☐ | ☐ |

---

## Templates

| Template Name | Type | Applied To | Custom Fields Referenced | Null-Safe Operators | Multi-Page Tested | Workbook Updated |
|--------------|------|-----------|:------------------------:|:-------------------:|:-----------------:|:---------------:|
| | PDF / Email | | ☐ | ☐ | ☐ | ☐ |

---

## Roles & Permissions

| Role Name | Based On | Custom Record Permissions Set | Form Restrictions | Test User Verified | Workbook Updated |
|-----------|----------|:-----------------------------:|:-----------------:|:------------------:|:---------------:|
| | | ☐ | ☐ | ☐ | ☐ |

---

## Pre-Handoff Sign-Off

Before handing off to QA and the scripting team:

- [ ] All internal IDs reviewed against [references/naming_conventions.md](../references/naming_conventions.md)
- [ ] All objects entered in `Configuration_Workbook.csv` (from ns-suitescript-dev skill)
- [ ] All custom fields visible on correct forms; hidden from irrelevant forms
- [ ] All saved searches return verified correct results with real Sandbox data
- [ ] All formula columns tested with NULL input
- [ ] All role permissions tested with a dedicated test user
- [ ] No "TBD" or placeholder values in any configured object
- [ ] Script team notified: all field internal IDs and search IDs confirmed and documented

**Signed off by:** _________________________ | **Date:** _____________
