# Solution Design Document — Procure-to-Pay (P2P)

---

## Document Header

| Field | Value |
|-------|-------|
| **Project** | O25003 — NetSuite Migration |
| **Functional Area** | Procure-to-Pay (P2P) |
| **Author** | NS Solution Architect (Claude Agent) |
| **Date** | 2026-04-29 |
| **Version** | 0.1 Draft |
| **BRD Reference** | BRD_P2P (Fit-Gap complete) |
| **Fit-Gap Reference** | FGA_P2P.md |
| **Reviewed By** | Pending |
| **Approved By** | Pending |

---

## Completion Checklist

- [x] All BRD Requirement IDs for this functional area are addressed in §1
- [x] Future-state process flow is documented in §2
- [x] Every configuration item has a clear setup instruction
- [x] All custom fields have: label, internal ID format, field type, record, and purpose
- [x] All custom records have: name, internal ID format, purpose, and key fields
- [x] Every automation item (workflow/script) references a Customization Spec (CUST-XX-NN)
- [x] Every integration references an Integration Spec (INT-XX-NN)
- [x] User roles with access changes are listed in §6
- [x] RTM has been updated with Solution IDs for all requirements covered here
- [x] No section left blank — N/A stated explicitly where not applicable

---

## 1. Requirements Reference

| Req ID | Requirement Summary | Priority | Fit | Addressed In |
|--------|---------------------|----------|-----|--------------|
| FR-P2P-01 | Standard PO approval — auto-approve under $5K, manager approval at or above $5K | High | C | §2.1, §3.2, §5.1 — CUST-P2P-01 |
| FR-P2P-02 | Vendor performance scorecard custom record tracking on-time delivery % per vendor, updated weekly | High | X | §2.2, §4.2, §4.3, §5.2 — CUST-P2P-02 |
| FR-P2P-03 | Nightly sync from legacy ERP (SAP) to update vendor master data in NetSuite | Medium | X | §2.3, §7 — INT-SAP-01 |

**Fit Classification Notes:**

- **FR-P2P-01 (C — Configuration/SuiteFlow):** NetSuite OneWorld includes native Purchase Order approval routing via SuiteFlow. The $5K threshold logic and auto-approval path can be implemented as a workflow without custom SuiteScript, consistent with the principle that workflows beat SuiteScript for simple state-based approval logic.
- **FR-P2P-02 (X — Customization):** No standard NetSuite feature tracks on-time delivery % against vendor purchase orders. A custom record and a weekly Scheduled Script are required to calculate and persist the metric.
- **FR-P2P-03 (X — Customization/Integration):** SAP is a third-party system. A nightly inbound integration using SuiteTalk REST (or a Scheduled RESTlet pattern) is required. Vendor master data updates touch the Vendor record, which is a standard NetSuite record, but the orchestration and field mapping require a custom integration layer.

---

## 2. Future-State Business Process Flow

### 2.1 Process: Purchase Order Creation and Approval (FR-P2P-01)

**Scope:** Begins when a Purchasing Agent initiates a Purchase Order in NetSuite; ends when the PO is approved (or rejected) and the vendor is notified.

**Actors:** Purchasing Agent, Purchasing Manager, Vendor (notification only)

**Steps:**

1. Purchasing Agent creates a **Purchase Order** in NetSuite (Transactions > Purchases > Enter Purchase Orders), selecting the Vendor and adding line items with quantities and unit costs.
2. On Save, the PO Approval Workflow (CUST-P2P-01) triggers immediately.
3. **If PO Amount (before tax) is less than $5,000:** The workflow sets the PO status to `Approved`, stamps the `custbody_po_approved_by` field with "AUTO", and sets `custbody_po_approval_date` to today's date. No human action is required.
4. **If PO Amount (before tax) is $5,000 or greater:** The workflow sets the PO status to `Pending Approval` and sends an email notification to the Purchasing Manager's queue. The PO is surfaced in the "PO Pending Approval" saved search on the Purchasing Manager dashboard.
5. Purchasing Manager reviews the PO. Two workflow action buttons are exposed on the PO form: **Approve** and **Reject**.
6. **On Approve:** Status transitions to `Approved`; `custbody_po_approved_by` is stamped with the approving manager's name; `custbody_po_approval_date` is set to today. A confirmation email is sent to the Purchasing Agent.
7. **On Reject:** Status transitions to `Rejected`; `custbody_po_rejection_reason` is a required text field the manager must populate before confirming rejection. The Purchasing Agent receives an email notification with the rejection reason.
8. Approved POs are available for receipt processing (Item Receipts) when goods arrive.

**Exception Paths:**
- **Purchasing Manager is unavailable (out of office):** A delegate approver can be designated in NetSuite's Employee record (Supervisor field). The workflow email notification is sent to both the primary manager and a configurable backup approver email (stored in a custom field on the Vendor Subsidiary preference or a global Configuration Record). This delegation pattern must be confirmed with the client before go-live (see §8, Open Item #1).
- **PO is edited after approval:** If a previously Approved PO is edited and the new total crosses the $5K threshold boundary (e.g., a line is added bringing an originally sub-$5K PO above $5K), the workflow re-evaluates on Save and routes back to Pending Approval. This re-approval trigger must be explicitly validated during UAT.
- **Vendor does not exist in NetSuite:** Purchasing Agent cannot save the PO without a valid Vendor record. Vendor master must be current (maintained via INT-SAP-01, see §7).

---

### 2.2 Process: Vendor Performance Scorecard Maintenance (FR-P2P-02)

**Scope:** Begins when a Purchase Order is fulfilled (Item Receipt is saved); ends with a weekly scorecard record reflecting on-time delivery % per vendor, available for reporting.

**Actors:** System (automated), Purchasing Manager (reporting consumer)

**Steps:**

1. When goods are received, the Purchasing team creates an **Item Receipt** in NetSuite against an approved PO.
2. The Item Receipt captures the actual receipt date. The expected delivery date is stored on the originating PO (`custbody_po_expected_delivery_date` — see §4.3).
3. Once weekly (Sunday at 02:00 UTC), the Vendor Scorecard Scheduled Script (CUST-P2P-02) runs.
4. The script queries all Item Receipts linked to POs that were received in the past rolling 52 weeks, grouped by Vendor.
5. For each Vendor, the script calculates: **On-Time Delivery % = (Count of receipts where actual receipt date ≤ expected delivery date) / (Total count of receipts) × 100**.
6. The script creates or updates a **Vendor Performance Scorecard** custom record (`customrecord_vendor_scorecard`) for that Vendor, stamping the calculated percentage, the as-of date, and the sample size (number of receipts evaluated).
7. Purchasing Managers can view scorecard records via a saved search or directly from the Vendor record (a sublist or related-record portlet).

**Exception Paths:**
- **Vendor has no receipts in the rolling period:** No scorecard record is created or updated. Existing records are not deleted.
- **Expected delivery date is blank on a PO:** That receipt is excluded from the on-time calculation and counted in a separate `custrecord_scorecard_excluded_count` field for transparency.
- **Script execution failure:** The Scheduled Script logs errors to the NetSuite Script Execution Log. A governance alert should be configured to notify the NetSuite Administrator if the script fails. See CUST-P2P-02 for full error-handling specification.

---

### 2.3 Process: SAP-to-NetSuite Vendor Master Nightly Sync (FR-P2P-03)

**Scope:** Begins nightly when SAP triggers or a scheduler initiates the sync; ends when NetSuite Vendor records are updated to match the SAP vendor master for all active vendors.

**Actors:** SAP Integration Middleware (or direct SAP job), NetSuite Integration User

**Steps:**

1. At a scheduled time (01:00 UTC nightly), the SAP-side process extracts all vendor master records that have changed since the last successful sync (delta extraction using SAP change pointers or a last-modified timestamp).
2. The extracted payload is sent to a NetSuite RESTlet endpoint (INT-SAP-01) as a JSON array of vendor objects.
3. The RESTlet receives the payload, iterates over each vendor record, and performs an upsert: match on `custentity_sap_vendor_id` (the SAP vendor number stored on the NetSuite Vendor record). If the Vendor exists, update; if not, create.
4. Field mappings are applied (see §7 and INT-SAP-01 for full mapping table).
5. The RESTlet returns a structured response with counts of created, updated, and failed records, plus per-record error details for any failures.
6. SAP logs the response. Failed records are queued for retry on the next cycle (retry logic is SAP-side).
7. A NetSuite-side staging custom record (`customrecord_sap_vendor_sync_log`) captures each run's summary for audit and troubleshooting.

**Exception Paths:**
- **Duplicate vendor (same SAP ID on two NetSuite records):** RESTlet returns an error for that record; does not proceed with update. Requires manual resolution by the NetSuite Administrator.
- **NetSuite API rate limit hit:** RESTlet returns HTTP 429. SAP middleware must implement exponential back-off and retry. See INT-SAP-01.
- **SAP sends a vendor marked as inactive:** The RESTlet sets the Vendor's `isinactive` flag to `true` in NetSuite. Purchasing Agents will no longer be able to select that vendor on new POs. An alert email is sent to the Purchasing Manager.

---

## 3. NetSuite Solution Overview

### 3.1 Standard Features Being Used

| Feature | Purpose | Setup Location |
|---------|---------|----------------|
| Purchase Orders | Primary procurement transaction record | Transactions > Purchases > Enter Purchase Orders |
| Item Receipts | Goods receipt against POs | Transactions > Purchases > Receive Orders |
| OneWorld Subsidiaries | Multi-subsidiary PO processing and approval | Setup > Company > Subsidiaries |
| SuiteFlow Workflow Engine | PO approval routing workflow (CUST-P2P-01) | Customization > Workflow > Workflows |
| Vendor Records | Vendor master, updated by SAP integration | Lists > Relationships > Vendors |
| Saved Searches | Purchasing Manager approval queue and scorecard reporting | Reports > Saved Searches |
| Email Notifications | Approval request and status-change alerts to Purchasing team | Configured within SuiteFlow workflow actions |
| Script Execution Log | Runtime monitoring for scheduled scripts | Customization > Scripting > Script Execution Logs |

### 3.2 Configuration Items

| Config Item | Description | Record / Location | Notes |
|-------------|-------------|-------------------|-------|
| Custom Field: PO Approval Status | Tracks PO approval state | Body field on Purchase Order | Type: List/Record — values: Pending Approval (default on save), Approved, Rejected. Internal ID: `custbody_po_approval_status` |
| Custom Field: PO Approved By | Name of approver or "AUTO" for auto-approvals | Body field on Purchase Order | Type: Free-Form Text. Internal ID: `custbody_po_approved_by`. Set by workflow; read-only on form. |
| Custom Field: PO Approval Date | Date approval was granted | Body field on Purchase Order | Type: Date. Internal ID: `custbody_po_approval_date`. Set by workflow; read-only on form. |
| Custom Field: PO Rejection Reason | Free-text reason entered by manager on rejection | Body field on Purchase Order | Type: Free-Form Text. Internal ID: `custbody_po_rejection_reason`. Required when status = Rejected (workflow enforces). |
| Custom Field: PO Expected Delivery Date | Agreed delivery date at time of PO creation | Body field on Purchase Order | Type: Date. Internal ID: `custbody_po_expected_delivery_date`. Editable by Purchasing Agent. Used by CUST-P2P-02 for on-time calculation. |
| Custom Field: SAP Vendor ID | SAP vendor number for upsert matching | Body field on Vendor | Type: Free-Form Text. Internal ID: `custentity_sap_vendor_id`. Populated by INT-SAP-01; read-only on UI form for non-admins. |
| Saved Search: PO Pending Approval Queue | Manager dashboard for POs awaiting approval | Saved Search on Purchase Order | Filter: `custbody_po_approval_status` = Pending Approval. Columns: Vendor, Amount, Subsidiary, Purchasing Agent, Created Date. |
| Saved Search: Vendor Scorecard Summary | On-time delivery % per vendor, most recent period | Saved Search on Vendor Scorecard record | Filter: As-Of Date = most recent. Columns: Vendor, On-Time %, Sample Size, As-Of Date. |
| PO Entry Form Layout | Add approval fields and expected delivery date to PO form | Customization > Forms > Transaction Forms | Create a custom PO form (do not modify the standard form). Add `custbody_po_approval_status`, `custbody_po_approved_by`, `custbody_po_approval_date`, `custbody_po_rejection_reason`, `custbody_po_expected_delivery_date` to the form header. Mark `custbody_po_approved_by`, `custbody_po_approval_date`, `custbody_po_rejection_reason` as display-only for Purchasing Agent role. |
| Vendor Form Layout | Add SAP Vendor ID field | Customization > Forms > Entity Forms | Add `custentity_sap_vendor_id` to Vendor form; restrict to read-only for all roles except Administrator and Integration User. |

### 3.3 Solution Summary Map

| Req ID | Solution Type | Solution ID | Description |
|--------|--------------|-------------|-------------|
| FR-P2P-01 | Configuration + SuiteFlow | CUST-P2P-01 | PO approval workflow with $5K threshold and auto-approval |
| FR-P2P-02 | Custom Record + SuiteScript | CUST-P2P-02 | Vendor scorecard custom record and weekly scheduled script |
| FR-P2P-03 | Integration | INT-SAP-01 | SAP nightly vendor master sync via RESTlet |

---

## 4. Records & Fields

### 4.1 Standard Records Used

| Record Type | Internal ID | Purpose in This Solution |
|-------------|-------------|--------------------------|
| Purchase Order | `purchaseorder` | Primary procurement transaction; subject to approval workflow |
| Item Receipt | `itemreceipt` | Records actual goods receipt date; source data for on-time delivery calculation |
| Vendor | `vendor` | Vendor master record; updated nightly by SAP integration |
| Employee | `employee` | Purchasing Agent and Purchasing Manager identity; used in workflow approval routing |

### 4.2 Custom Records

| Record Name | Internal ID | Purpose | Key Fields |
|-------------|-------------|---------|------------|
| Vendor Performance Scorecard | `customrecord_vendor_scorecard` | Stores weekly on-time delivery % per vendor; one record per vendor per calculation run | Vendor (entity link), As-Of Date (date), On-Time Delivery % (percent), Total Receipts Evaluated (integer), Excluded Receipts Count (integer — receipts with no expected delivery date) |
| SAP Vendor Sync Log | `customrecord_sap_vendor_sync_log` | Audit log of each SAP-to-NetSuite sync run; supports troubleshooting and compliance | Run Date/Time (datetime), Records Received (integer), Records Created (integer), Records Updated (integer), Records Failed (integer), Error Detail (long text), Status (list: Success / Partial Failure / Failed) |

### 4.3 Custom Fields

| Field Label | Internal ID | Field Type | Record | Sublist? | Purpose | Validation / Default |
|-------------|-------------|------------|--------|----------|---------|----------------------|
| PO Approval Status | `custbody_po_approval_status` | List/Record | Purchase Order | No | Tracks approval state for routing and reporting | Custom list: Pending Approval (default), Approved, Rejected. Required. Set by workflow; editable only via workflow transitions. |
| PO Approved By | `custbody_po_approved_by` | Free-Form Text | Purchase Order | No | Records who approved the PO — person name or "AUTO" | Max 100 chars. Set by workflow only; display-only on form for all roles. |
| PO Approval Date | `custbody_po_approval_date` | Date | Purchase Order | No | Records when approval was granted | Set by workflow only; display-only on form. |
| PO Rejection Reason | `custbody_po_rejection_reason` | Free-Form Text | Purchase Order | No | Manager's stated reason for rejection | Max 500 chars. Required when `custbody_po_approval_status` = Rejected (enforced by workflow state entry action). |
| PO Expected Delivery Date | `custbody_po_expected_delivery_date` | Date | Purchase Order | No | Agreed-upon delivery date; baseline for on-time calculation | Editable by Purchasing Agent and above. No default (must be entered). |
| SAP Vendor ID | `custentity_sap_vendor_id` | Free-Form Text | Vendor | No | SAP's vendor number; used as the integration upsert key | Max 20 chars. Read-only on UI form for all roles except Administrator and Integration User. Unique constraint recommended (enforce via User Event Script if NetSuite's native unique-field feature is insufficient). |
| Vendor (link) | `custrecord_scorecard_vendor` | List/Record (Vendor) | Vendor Performance Scorecard | No | Links scorecard record to vendor | Required. Set by CUST-P2P-02 script. |
| As-Of Date | `custrecord_scorecard_asof_date` | Date | Vendor Performance Scorecard | No | Date the scorecard calculation was run | Required. Set by CUST-P2P-02 script. |
| On-Time Delivery % | `custrecord_scorecard_ontime_pct` | Percent | Vendor Performance Scorecard | No | Calculated on-time delivery percentage | Required. Range: 0–100. Set by CUST-P2P-02 script. |
| Total Receipts Evaluated | `custrecord_scorecard_total_count` | Integer | Vendor Performance Scorecard | No | Number of receipts included in the calculation | Required. Set by CUST-P2P-02 script. |
| Excluded Receipts Count | `custrecord_scorecard_excluded_count` | Integer | Vendor Performance Scorecard | No | Receipts excluded due to missing expected delivery date | Default: 0. Set by CUST-P2P-02 script. |
| Run Date/Time | `custrecord_synclog_run_datetime` | Date/Time | SAP Vendor Sync Log | No | Timestamp of the sync run | Required. Set by RESTlet on record creation. |
| Records Received | `custrecord_synclog_received` | Integer | SAP Vendor Sync Log | No | Total vendor records in the incoming payload | Required. |
| Records Created | `custrecord_synclog_created` | Integer | SAP Vendor Sync Log | No | New vendor records created in this run | Required. |
| Records Updated | `custrecord_synclog_updated` | Integer | SAP Vendor Sync Log | No | Existing vendor records updated in this run | Required. |
| Records Failed | `custrecord_synclog_failed` | Integer | SAP Vendor Sync Log | No | Records that could not be processed | Required. |
| Error Detail | `custrecord_synclog_error_detail` | Long Text | SAP Vendor Sync Log | No | Per-record error messages for failed records | Optional. Populated only when `custrecord_synclog_failed` > 0. |
| Sync Status | `custrecord_synclog_status` | List/Record | SAP Vendor Sync Log | No | Overall run outcome | Custom list: Success, Partial Failure, Failed. Required. |

---

## 5. Automation & Logic

### 5.1 SuiteFlow Workflows

| Workflow ID | Name | Record | Trigger | Purpose | Spec |
|-------------|------|--------|---------|---------|------|
| WF-P2P-01 | PO Approval Routing | Purchase Order | Before Record Submit (Create and Edit) | Evaluate PO amount; auto-approve if < $5,000; route to Purchasing Manager if ≥ $5,000; handle Approve and Reject actions; stamp approval metadata fields | CUST-P2P-01 |

**WF-P2P-01 State Summary (for workflow designer reference — full logic in CUST-P2P-01):**

| State | Entry Condition | Actions on Entry | Available Transitions |
|-------|-----------------|------------------|-----------------------|
| Evaluate Amount | On Save (any) | — | If Amount < $5,000 → Auto-Approved; if Amount ≥ $5,000 → Pending Approval |
| Auto-Approved | Amount < $5,000 | Set `custbody_po_approval_status` = Approved; set `custbody_po_approved_by` = "AUTO"; set `custbody_po_approval_date` = today | Terminal |
| Pending Approval | Amount ≥ $5,000 | Set `custbody_po_approval_status` = Pending Approval; send email to Purchasing Manager | Manager clicks Approve → Approved; Manager clicks Reject → Rejected |
| Approved | Manager approves | Set `custbody_po_approval_status` = Approved; set `custbody_po_approved_by` = current user display name; set `custbody_po_approval_date` = today; send confirmation email to Purchasing Agent | Terminal |
| Rejected | Manager rejects | Require `custbody_po_rejection_reason` entry; set `custbody_po_approval_status` = Rejected; send rejection email to Purchasing Agent with reason | Terminal |

**Re-approval on edit:** The workflow must include a condition on the "Edit" trigger: if `custbody_po_approval_status` is currently Approved or Rejected AND the PO amount has changed such that it now crosses the $5K boundary, reset `custbody_po_approval_status` to Pending Approval and re-route. If the amount has not changed the boundary crossing status, do not re-trigger routing. Full condition logic is specified in CUST-P2P-01.

### 5.2 SuiteScript Customizations

| Script ID | Name | Type | Record | Trigger | Purpose | Spec |
|-----------|------|------|--------|---------|---------|------|
| SS-P2P-01 | Vendor Scorecard Weekly Calculator | Scheduled Script | Vendor Performance Scorecard (`customrecord_vendor_scorecard`) | Scheduled — weekly, Sunday 02:00 UTC | Query all Item Receipts in the rolling 52-week window; calculate on-time delivery % per vendor; create or update Vendor Scorecard records | CUST-P2P-02 |
| SS-P2P-02 | SAP Vendor Master Sync RESTlet | RESTlet | Vendor (`vendor`) | Inbound HTTP POST from SAP nightly job at 01:00 UTC | Receive JSON vendor payload from SAP; upsert Vendor records by `custentity_sap_vendor_id`; write sync log to `customrecord_sap_vendor_sync_log`; return structured response | INT-SAP-01 |

**SS-P2P-01 Logic Summary (full pseudocode in CUST-P2P-02):**
1. Query `itemreceipt` records joined to `purchaseorder` where receipt date is within the past 52 weeks. Pull fields: `vendor`, actual receipt date (from Item Receipt), `custbody_po_expected_delivery_date` (from parent PO).
2. Group results by `vendor`.
3. For each vendor: count total records; count records where actual receipt date ≤ expected delivery date; count records where expected delivery date is null (excluded).
4. Calculate on-time % = (on-time count / (total count - excluded count)) × 100. Handle division-by-zero (all records excluded → do not write scorecard).
5. Search for existing scorecard record for this vendor from the current week; if found, update; if not, create.
6. Log completion summary.

**SS-P2P-02 Logic Summary (full spec in INT-SAP-01):**
1. Receive POST payload: JSON array of vendor objects.
2. Validate payload structure; return HTTP 400 with error detail if malformed.
3. For each vendor object: search NetSuite Vendor records by `custentity_sap_vendor_id`.
4. If found: load and update mapped fields; save.
5. If not found: create new Vendor record with mapped fields; save.
6. If SAP sends `inactive = true`: set `isinactive = true` on the NetSuite Vendor.
7. Accumulate counts and errors; write `customrecord_sap_vendor_sync_log` record.
8. Return JSON response: `{ "received": N, "created": N, "updated": N, "failed": N, "errors": [...] }`.

---

## 6. User Roles & Permissions

| Role | Change Type | Detail |
|------|-------------|--------|
| Purchasing Agent | Permission Add + Form Update | Read/Write access to Purchase Order (existing). New custom fields (`custbody_po_expected_delivery_date`) must be editable. Approval fields (`custbody_po_approval_status`, `custbody_po_approved_by`, `custbody_po_approval_date`, `custbody_po_rejection_reason`) must be display-only (set on custom PO form for this role). No access to Vendor Scorecard records required (read-only via Vendor form portlet is acceptable). |
| Purchasing Manager | Permission Add + Dashboard | Full access to Purchase Order for approval/rejection actions. Workflow action buttons (Approve, Reject) must appear on the PO form for this role. Access to "PO Pending Approval Queue" saved search (pinned to home dashboard). Read access to Vendor Performance Scorecard records and the Vendor Scorecard Summary saved search. |
| Accounts Payable | No structural change | Existing AP role access to Purchase Orders and Item Receipts is sufficient. Approval status fields are visible (read-only) for reference. No scorecard access required unless AP Manager requests it. |
| NetSuite Administrator | Permission Review | Must own the Integration User credential used by INT-SAP-01. Integration User should be a separate, restricted role — not the Administrator role — with access limited to: Vendor record (Edit), Vendor Performance Scorecard (Create/Edit), SAP Vendor Sync Log (Create). TBA token must be generated and stored securely. |
| Integration User (new role) | New Role | Restricted role for the SAP RESTlet integration. Permissions: Vendor — Edit; `customrecord_vendor_scorecard` — N/A (used by script, not this role); `customrecord_sap_vendor_sync_log` — Create/Edit; RESTlet access enabled. Password login disabled; TBA only. |

---

## 7. Integrations

| Integration ID | Name | Direction | Pattern | Trigger | Spec |
|----------------|------|-----------|---------|---------|------|
| INT-SAP-01 | SAP Vendor Master → NetSuite Vendor Sync | Inbound | RESTlet (SuiteScript 2.1) | Nightly scheduled job from SAP at 01:00 UTC; HTTP POST to NetSuite RESTlet URL | INT-SAP-01.md |

**Pattern Justification for INT-SAP-01:** SuiteTalk REST was considered but RESTlet was selected because the upsert logic (match on custom SAP Vendor ID field, handle inactive flag, write audit log) requires custom server-side processing that standard SuiteTalk endpoints do not natively support. A RESTlet gives full control over the upsert logic and the sync log write within a single atomic transaction scope per vendor record. Volume is estimated at low-to-medium (typical vendor master change sets are hundreds of records per night, well within RESTlet governance limits).

**Authentication:** Token-Based Authentication (TBA). The SAP integration middleware must store the Consumer Key, Consumer Secret, Token ID, and Token Secret. Password-based authentication is not permitted per integration standards.

**Field Mapping (high-level — full mapping in INT-SAP-01):**

| SAP Field | NetSuite Field | Internal ID | Notes |
|-----------|---------------|-------------|-------|
| SAP Vendor Number | SAP Vendor ID (custom) | `custentity_sap_vendor_id` | Upsert key |
| Vendor Name | Company Name | `companyname` | |
| Vendor Address (Street, City, State, ZIP, Country) | Default Billing Address | Address subrecord | Map to address subrecord; country must use NetSuite country code |
| Payment Terms Code | Payment Terms | `terms` | Map SAP payment term codes to NetSuite Terms list; unmapped codes → error, do not default |
| Currency Code | Currency | `currency` | ISO 4217 code; must match NetSuite currency list |
| Inactive Flag | Inactive | `isinactive` | Boolean; SAP `LIFNR_INACTIVE = X` → `true` |
| VAT Registration Number | Tax Reg. Number | `vatregnumber` | Optional |

---

## 8. Open Items & Decisions

| # | Open Item | Owner | Due Date | Status |
|---|-----------|-------|----------|--------|
| 1 | Confirm delegation / backup approver behaviour for PO approval when primary Purchasing Manager is on leave. Determine if a single backup email address stored in a config record is sufficient or if NetSuite's native Employee Supervisor chain should be used. | Project Manager + Client Purchasing Lead | 2026-05-09 | Open |
| 2 | Confirm the exact SAP extraction mechanism for the nightly vendor delta (change pointers vs. last-modified timestamp vs. full extract with delta logic on NetSuite side). This affects the payload structure design in INT-SAP-01. | Integration Architect + SAP Team | 2026-05-09 | Open |
| 3 | Confirm the rolling window for the on-time delivery % calculation (currently designed as 52 weeks). Business may prefer a different period (e.g., 13 weeks, calendar year). | Purchasing Manager (Client) | 2026-05-09 | Open |
| 4 | Confirm whether the Vendor Performance Scorecard should be visible on the Vendor record form (as a related-records sublist) or only via the Saved Search report. This affects form configuration scope. | Purchasing Manager (Client) | 2026-05-09 | Open |
| 5 | Confirm NetSuite Payment Terms list is complete and covers all SAP payment term codes before INT-SAP-01 build begins. Unmapped codes will cause vendor records to fail the sync. | NetSuite Administrator + Client Finance | 2026-05-16 | Open |
| 6 | Validate that OneWorld subsidiary assignment for new vendors created via INT-SAP-01 is handled correctly. SAP payload must include subsidiary identifier, and the RESTlet must map it to the correct OneWorld subsidiary internal ID. This is a OneWorld-specific concern. | Integration Architect + NetSuite Administrator | 2026-05-09 | Open |

---

## Change Log

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 0.1 | 2026-04-29 | NS Solution Architect (Claude Agent) | Initial draft — all three P2P requirements addressed; pending client review and open item resolution |
