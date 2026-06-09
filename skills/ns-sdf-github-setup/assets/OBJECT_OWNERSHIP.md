# Object Ownership Registry

<!--
  RULES:
  ─────
  SDF-owned  → Only change via Git PR. Never edit in the NetSuite UI without syncing first.
               Next SDF deploy will OVERWRITE any UI changes to these objects.

  UI-owned   → Managed in the NetSuite UI. Deliberately excluded from deploy.xml.
               Do NOT add to deploy.xml or Objects/ folder.

  Shared     → SDF imports these for documentation/versioning purposes only.
               UI is authoritative. Do NOT deploy via SDF.

  When in doubt about a new object: default to SDF-owned, note it as "pending confirmation."

  Update this file whenever:
  - A new object is created (decide ownership immediately)
  - An object changes ownership (rare — requires team agreement)
  - An object is deleted (remove from SDF project AND update this table)
-->

---

## SDF-Owned Objects

> Changed via Git PR only. UI edits without a prior `git pull + object:import` cycle will be overwritten on the next deploy.

| Internal ID | Type | Description | Team Owner | Last Modified |
|---|---|---|---|---|
| `customscript_[proj]_` | Script | | SDF Team | |
| `scriptdeployment_[proj]_` | Script Deployment | | SDF Team | |
| `customrecord_[proj]_` | Custom Record | | SDF Team | |
| `custbody_[proj]_` | Transaction Body Field | | SDF Team | |
| `custcol_[proj]_` | Transaction Line Field | | SDF Team | |
| `custentity_[proj]_` | Entity Field | | SDF Team | |
| `custitem_[proj]_` | Item Field | | SDF Team | |
| `custrecord_[proj]_` | Custom Record Field | | SDF Team | |

---

## UI-Owned Objects

> Managed in the NetSuite UI. These are excluded from SDF and will never be in `deploy.xml`.

| Internal ID / Name | Type | Description | UI Owner | Reason for UI Ownership |
|---|---|---|---|---|
| | Saved Search | | | Account-specific saved data / filters |
| | Custom Form | | | Per-environment form assignments |
| | Workflow (SuiteFlow) | | | Managed by functional team; complex state |
| | Role | | | Permissions vary per environment |

---

## Shared Objects (SDF tracks, UI is authoritative)

> SDF imports these periodically for documentation. Do NOT deploy them back via SDF — the UI version is always the master.

| Internal ID | Type | Description | Last Imported | Notes |
|---|---|---|---|---|
| | | | | |

---

## Ownership Decision Guide

Use this when a new object is created:

| Object Type | Default Ownership | Override When |
|---|---|---|
| SuiteScript (any type) | **SDF** | Never |
| Script Deployment | **SDF** | Never |
| Custom Record type | **SDF** | Record has complex form logic managed by functional team |
| Custom Field (body/line/entity/item) | **SDF** | Field requires account-specific help URL or complex display logic |
| Custom List | **SDF** | List values change frequently via UI (then UI-owned) |
| Saved Search | **UI** | Search is fully generic with no account-specific values (then SDF) |
| Custom Form | **UI** | Form is identical across all environments (rare) |
| SuiteFlow Workflow | **UI** | Workflow is fully generic with no internal IDs (rare) |
| Custom Role | **UI** | Role permissions are identical across all environments (rare) |
| Custom Segment | **SDF** | Segment has account-specific values in production only |

---

## Process for UI Edits to SDF-Owned Objects

If a UI configurator needs to edit an SDF-owned object for testing or urgency:

1. **Communicate first** — notify the SDF team before editing in the UI.
2. **Make the UI edit** in the sandbox only.
3. **SDF developer runs:**
   ```bash
   suitecloud object:import --type <type> --scriptids <scriptid> --destinationfolder Objects
   git diff Objects/<scriptid>.xml
   ```
4. **Review the diff** — confirm the change is intentional.
5. **Commit and push** the updated XML before the next CI deploy.
6. If the change is not committed before the next CI run, **drift detection will fail the pipeline** with details on what drifted.
