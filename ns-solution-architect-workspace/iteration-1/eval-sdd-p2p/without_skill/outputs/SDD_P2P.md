# Solution Design Document
## Procure-to-Pay (P2P) — NetSuite OneWorld

| Field | Value |
|---|---|
| Project | O25003 — NetSuite Migration |
| Functional Area | Procure-to-Pay (P2P) |
| Document Version | 1.0 |
| Status | Draft |
| Date | 2026-04-29 |
| Platform | NetSuite OneWorld |

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [Requirements Reference](#2-requirements-reference)
3. [Future-State Process Flow](#3-future-state-process-flow)
4. [NetSuite Solution Overview](#4-netsuite-solution-overview)
5. [Records and Fields](#5-records-and-fields)
6. [Automation and Logic](#6-automation-and-logic)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [Integration Points](#8-integration-points)
9. [Open Items and Decisions](#9-open-items-and-decisions)

---

## 1. Document Purpose and Scope

This Solution Design Document (SDD) describes the end-to-end NetSuite configuration and customization required to support the Procure-to-Pay business process following the fit-gap analysis. It covers the three in-scope functional requirements confirmed during fit-gap workshops, defines the target-state design for each, and provides enough technical detail to guide build, testing, and go-live activities.

**In scope:**
- Purchase Order creation, routing, and approval (FR-P2P-01)
- Vendor performance scorecard as a custom NetSuite record (FR-P2P-02)
- Nightly inbound integration from SAP to maintain vendor master data (FR-P2P-03)

**Out of scope for this version:** Accounts Payable invoice matching, payment runs, procurement catalogs, and procurement contracts unless otherwise noted.

---

## 2. Requirements Reference

| Req ID | Priority | Summary | Fit/Gap | Design Approach |
|---|---|---|---|---|
| FR-P2P-01 | High | PO Approval Workflow — auto-approve < $5K; manager approval >= $5K | Fit (with configuration) | Native NetSuite Approval Routing + SuiteFlow workflow |
| FR-P2P-02 | High | Vendor Performance Scorecard — custom record tracking on-time delivery % per vendor, updated weekly | Gap | Custom Record + Scheduled SuiteScript |
| FR-P2P-03 | Medium | Nightly SAP-to-NetSuite vendor master sync | Gap | RESTlet or Scheduled SuiteScript consuming SAP flat-file/API |

---

## 3. Future-State Process Flow

### 3.1 PO Approval (FR-P2P-01)

```
Requestor creates Purchase Order (status: Pending Supervisor Approval)
        |
        v
[Workflow evaluates PO Amount (excl. tax)]
        |
   < $5,000 ---------> Auto-Approved (status: Pending Receipt)
        |                       |
   >= $5,000                    v
        |             Vendor notified (optional) / PO available for receiving
        v
Manager receives approval task (in-app + email)
        |
   Approved ---------> Status: Pending Receipt
        |
   Rejected ---------> Status: Rejected; Requestor notified with comments
```

**Key decision points:**
- Threshold is evaluated against the **Total (gross amount excl. tax)** field on the Purchase Order header.
- "Manager" is resolved from the **Supervisor** field on the requestor's Employee record. In a OneWorld context, approval is subsidiaryaware — the supervisor must belong to the same or parent subsidiary.
- If the designated supervisor has no active NetSuite login, the workflow escalates to the supervisor's supervisor or to a configurable fallback approver role.

### 3.2 Vendor Performance Scorecard (FR-P2P-02)

```
Weekly Scheduled Script triggers (Sunday 02:00 AM subsidiary time)
        |
        v
Script queries Item Receipts created in the past 7 days
        |
        v
For each Vendor:
  - Count total line receipts due in the period
  - Count lines received on or before the Expected Receipt Date
  - Calculate On-Time Delivery % = (on-time / total) * 100
        |
        v
Upsert Vendor Performance Scorecard record (custom) for each Vendor
  - Create new weekly record if none exists for that Vendor + Week-Ending date
  - Update if record already exists (re-run safety)
        |
        v
(Optional) Flag vendors below threshold (configurable, default 80%)
```

### 3.3 SAP Vendor Master Sync (FR-P2P-03)

```
SAP (Legacy ERP) — Nightly export job (23:00)
        |   SFTP / API (TBD — see Section 8)
        v
NetSuite Scheduled SuiteScript (01:00 AM)
        |
        v
Read vendor records from staging (file or direct call)
        |
        v
For each vendor record:
  - Match on External ID (SAP Vendor Number)
  - If match found  --> Update Vendor record fields (name, address, payment terms, etc.)
  - If no match     --> Create new Vendor record (status: Inactive pending review)
        |
        v
Error log written to custom Integration Log record
  - Email alert to integration admin on any errors
```

---

## 4. NetSuite Solution Overview

### 4.1 Modules and Features Required

| Module / Feature | Required For | Notes |
|---|---|---|
| Purchasing (Purchase Orders) | FR-P2P-01 | Standard module — already available in OneWorld |
| Approval Routing (Advanced PO Approvals) | FR-P2P-01 | Enable via Setup > Accounting Preferences |
| SuiteFlow (Workflow) | FR-P2P-01 | Drives approval routing logic |
| SuiteScript 2.1 (Scheduled) | FR-P2P-02, FR-P2P-03 | Weekly scorecard calc; nightly vendor sync |
| Custom Records | FR-P2P-02 | Vendor Performance Scorecard |
| SuiteAnalytics / Saved Searches | FR-P2P-02 | Data source for scorecard calculation |
| RESTlet or File Cabinet (SFTP) | FR-P2P-03 | Integration channel with SAP |
| OneWorld Subsidiary filtering | FR-P2P-01, FR-P2P-03 | Vendor and approval contexts are subsidiary-scoped |

### 4.2 Configuration Decisions

- **Advanced Approval Routing** will be enabled at the account level. The native "Approval Limit" on Employee records will serve as a secondary guard but the primary routing logic lives in the SuiteFlow workflow for auditability.
- All custom records will use **OneWorld-compatible subsidiary fields** so records can be filtered per entity.
- The integration log for FR-P2P-03 will reuse the same custom record type as any other integration logs defined in the broader project to reduce record sprawl.

---

## 5. Records and Fields

### 5.1 Standard Records Used

| Record Type | Internal ID (NS) | Usage |
|---|---|---|
| Purchase Order | `purchaseorder` | Primary P2P transactional record |
| Vendor | `vendor` | Supplier master; updated by SAP sync |
| Employee | `employee` | Resolves approver hierarchy (Supervisor field) |
| Item Receipt | `itemreceipt` | Source data for on-time delivery calculation |
| Subsidiary | `subsidiary` | OneWorld entity scoping |

### 5.2 Standard Fields Leveraged

#### Purchase Order

| Field Label | Field ID | Type | Notes |
|---|---|---|---|
| Vendor | `entity` | List/Record | Required; links to Vendor record |
| Subsidiary | `subsidiary` | List/Record | OneWorld — required |
| Total | `total` | Currency | Approval threshold comparison |
| Approval Status | `approvalstatus` | List | Managed by workflow |
| Memo | `memo` | Free-form text | Used for rejection reason by approver |
| Expected Receipt Date | `duedate` | Date | Used in scorecard calculation |

#### Vendor

| Field Label | Field ID | Type | Notes |
|---|---|---|---|
| External ID | `externalid` | Text | Populated with SAP Vendor Number |
| Subsidiary | `subsidiary` | List/Record | OneWorld scoping |
| Payment Terms | `terms` | List | Updated by SAP sync |
| Is Inactive | `isinactive` | Checkbox | New vendors from sync created as inactive |
| Default Address | `defaultaddress` | Address | Updated by SAP sync |

### 5.3 Custom Record: Vendor Performance Scorecard

**Record Type Name:** Vendor Performance Scorecard
**Internal ID (suggested):** `customrecord_vend_perf_scorecard`
**Access:** Accessible to Purchasing roles (read); Procurement Admin (read/write); Integration/script (full)

| Field Label | Field ID | Type | Required | Notes |
|---|---|---|---|---|
| Vendor | `custrecord_vps_vendor` | List/Record (Vendor) | Yes | Links to Vendor master |
| Subsidiary | `custrecord_vps_subsidiary` | List/Record (Subsidiary) | Yes | OneWorld scoping |
| Week Ending Date | `custrecord_vps_week_ending` | Date | Yes | Last day of the week the data covers (Saturday) |
| Total Receipts (Period) | `custrecord_vps_total_receipts` | Integer | Yes | Count of item receipt lines due in the week |
| On-Time Receipts | `custrecord_vps_ontime_receipts` | Integer | Yes | Count of lines received on or before expected date |
| On-Time Delivery % | `custrecord_vps_otd_pct` | Decimal (2dp) | Yes | Calculated: (on-time / total) * 100 |
| Below Threshold Flag | `custrecord_vps_below_threshold` | Checkbox | No | Set by script if OTD% < threshold |
| Threshold Used (%) | `custrecord_vps_threshold_pct` | Decimal | No | Snapshot of threshold at time of calculation |
| Script Run Timestamp | `custrecord_vps_run_timestamp` | DateTime | No | Audit — when the script last wrote this record |
| Notes | `custrecord_vps_notes` | Long Text | No | Manual annotations |

**Unique key (de-duplication):** Vendor + Subsidiary + Week Ending Date. The scheduled script uses a saved search to find an existing record before creating a new one.

### 5.4 Custom Record: Integration Log

**Record Type Name:** Integration Log
**Internal ID (suggested):** `customrecord_integration_log`
**Shared across all integrations in the project.**

| Field Label | Field ID | Type | Notes |
|---|---|---|---|
| Integration Name | `custrecord_ilog_integration_name` | Text | e.g., "SAP Vendor Sync" |
| Run Timestamp | `custrecord_ilog_run_ts` | DateTime | |
| Records Processed | `custrecord_ilog_records_processed` | Integer | |
| Records Created | `custrecord_ilog_records_created` | Integer | |
| Records Updated | `custrecord_ilog_records_updated` | Integer | |
| Records Failed | `custrecord_ilog_records_failed` | Integer | |
| Status | `custrecord_ilog_status` | List (Success / Warning / Error) | |
| Error Detail | `custrecord_ilog_error_detail` | Long Text | JSON or plain-text error dump |

---

## 6. Automation and Logic

### 6.1 FR-P2P-01 — PO Approval Workflow

**Tool:** SuiteFlow (Workflow)
**Trigger:** After Submit on Purchase Order (status changes or record saves)
**Record type:** `purchaseorder`

#### Workflow Design

| Step | Action | Condition |
|---|---|---|
| 1 | Evaluate Amount | On creation or edit if Approval Status = Pending Supervisor Approval |
| 2a | Set Status = Pending Receipt; Set Approved By = "Auto-Approved" | `total` < 5000 |
| 2b | Send Approval Task to Supervisor (from Employee.Supervisor); Set Status = Pending Supervisor Approval | `total` >= 5000 |
| 3 | Wait for Supervisor action (Approve or Reject button on PO form) | — |
| 4a (Approve) | Set Status = Pending Receipt; log approver + timestamp | Supervisor clicks Approve |
| 4b (Reject) | Set Status = Rejected; send email to requestor with Memo content | Supervisor clicks Reject |
| 5 (Escalation) | If task unactioned for N business days (configurable, default 3), escalate to fallback approver role | Timer-based transition |

**Notes:**
- The workflow uses a **Workflow Action Script** hook if additional business logic is needed (e.g., multi-level approval for amounts above a secondary threshold), but that threshold is not in scope for the current requirements.
- The threshold value ($5,000) will be stored in a **Custom Preference / Script Parameter** rather than hardcoded in the workflow to facilitate future changes without deployment.

### 6.2 FR-P2P-02 — Vendor Performance Scorecard (Scheduled Script)

**Tool:** SuiteScript 2.1 — Scheduled Script
**Script ID (suggested):** `customscript_vend_perf_scorecard`
**Schedule:** Weekly — Sunday at 02:00 AM (server time, to be confirmed with client)
**Deployment ID:** `customdeploy_vend_perf_scorecard`

#### Script Logic (Pseudocode)

```
function execute(context) {

  const weekEndingDate = getLastSaturday();        // Compute date range
  const weekStartDate  = addDays(weekEndingDate, -6);

  // 1. Query all Item Receipt lines where Expected Receipt Date falls in [weekStart, weekEnd]
  const receiptSearch = buildItemReceiptSearch(weekStartDate, weekEndingDate);

  // 2. Aggregate by Vendor
  const vendorMap = {};
  receiptSearch.each(result => {
    const vendorId     = result.getValue('vendor');
    const subsidiaryId = result.getValue('subsidiary');
    const expectedDate = result.getValue('expectedreceiptdate');
    const actualDate   = result.getValue('trandate');          // date of receipt
    const key = vendorId + '|' + subsidiaryId;

    if (!vendorMap[key]) vendorMap[key] = { total: 0, onTime: 0, vendorId, subsidiaryId };
    vendorMap[key].total++;
    if (actualDate <= expectedDate) vendorMap[key].onTime++;
  });

  // 3. Upsert Scorecard records
  const threshold = runtime.getCurrentScript().getParameter('custscript_otd_threshold') || 80;

  for (const key in vendorMap) {
    const data = vendorMap[key];
    const otdPct = data.total > 0 ? (data.onTime / data.total) * 100 : null;

    // Find existing record for Vendor + Subsidiary + WeekEndingDate
    const existingId = findExistingScorecardRecord(data.vendorId, data.subsidiaryId, weekEndingDate);

    upsertScorecardRecord({
      id:              existingId,         // null = create
      vendor:          data.vendorId,
      subsidiary:      data.subsidiaryId,
      weekEnding:      weekEndingDate,
      totalReceipts:   data.total,
      onTimeReceipts:  data.onTime,
      otdPct:          otdPct,
      belowThreshold:  otdPct !== null && otdPct < threshold,
      thresholdUsed:   threshold,
      runTimestamp:    new Date()
    });
  }
}
```

**Script parameters (configurable without code change):**

| Parameter Label | Parameter ID | Default |
|---|---|---|
| OTD Threshold (%) | `custscript_otd_threshold` | 80 |
| Alert Email (below threshold) | `custscript_otd_alert_email` | (blank — disables alert) |

### 6.3 FR-P2P-03 — SAP Vendor Master Sync (Scheduled Script)

**Tool:** SuiteScript 2.1 — Scheduled Script
**Script ID (suggested):** `customscript_sap_vendor_sync`
**Schedule:** Nightly at 01:00 AM (server time)
**Deployment ID:** `customdeploy_sap_vendor_sync`

#### Integration Mechanism (to be confirmed — see Open Items)

Two options are identified; the preferred option will be selected after SAP team confirmation:

| Option | Description | Pros | Cons |
|---|---|---|---|
| A — SFTP Flat File | SAP exports a CSV/JSON to a shared SFTP. NetSuite script reads file via N/sftp module. | Simple; no SAP API needed | Requires SFTP server; file schema must be versioned |
| B — SAP REST API | NetSuite script calls a SAP REST/SOAP endpoint directly via N/https module. | Real-time data; no file management | Requires SAP API exposure; firewall/auth setup |

**Assumed approach for this design: Option A (SFTP Flat File)** pending confirmation.

#### Script Logic (Pseudocode)

```
function execute(context) {
  const log = initIntegrationLog('SAP Vendor Sync');

  // 1. Connect to SFTP and read latest vendor export file
  const fileContent = readSftpFile(SFTP_HOST, SFTP_PATH, SFTP_CREDENTIALS);
  const vendors = parseCSV(fileContent);       // or JSON.parse()

  for (const v of vendors) {
    try {
      // 2. Lookup by External ID = SAP Vendor Number
      const existingId = findVendorByExternalId(v.sapVendorNumber);

      if (existingId) {
        // 3a. Update
        updateVendorRecord(existingId, mapSapFieldsToNS(v));
        log.updated++;
      } else {
        // 3b. Create (inactive by default, pending procurement admin review)
        createVendorRecord({ ...mapSapFieldsToNS(v), isinactive: true });
        log.created++;
      }
      log.processed++;
    } catch (e) {
      log.failed++;
      log.errors.push({ sapId: v.sapVendorNumber, error: e.message });
    }
  }

  // 4. Write Integration Log record
  writeIntegrationLog(log);

  // 5. Alert on errors
  if (log.failed > 0) sendErrorAlert(log);
}
```

#### Field Mapping: SAP Vendor Export -> NetSuite Vendor

| SAP Field | SAP Column Name | NetSuite Field | NetSuite Field ID | Transform |
|---|---|---|---|---|
| Vendor Number | `LIFNR` | External ID | `externalid` | Direct map |
| Vendor Name | `NAME1` | Company Name | `companyname` | Direct map |
| Street | `STRAS` | Address — Street 1 | `addr1` | Part of address subrecord |
| City | `ORT01` | Address — City | `city` | Part of address subrecord |
| Country | `LAND1` | Address — Country | `country` | ISO-3166 code mapping |
| Postal Code | `PSTLZ` | Address — ZIP | `zip` | Direct map |
| Payment Terms | `ZTERM` | Payment Terms | `terms` | Lookup against NS Terms list |
| Currency | `WAERS` | Currency | `currency` | ISO-4217 code mapping |
| Reconciliation Account | `AKONT` | (mapped to custom field or ignored) | TBD | Confirm with Finance |

---

## 7. User Roles and Permissions

### 7.1 Roles Involved

| Role | NetSuite Base Role | Modifications Required |
|---|---|---|
| Purchasing Agent | Purchasing Agent (standard) | Can create POs; cannot approve |
| Purchasing Manager | Purchasing Manager (standard) | Can approve POs; receives approval tasks |
| Procurement Admin | Administrator or custom | Full access to Vendor Scorecard records; can override vendor inactive status |
| Integration Service Account | (dedicated restricted role) | Script execution permissions; access to Vendor, Item Receipt, custom records; no UI access required |

### 7.2 Permission Matrix — Custom Records

| Role | Vendor Performance Scorecard | Integration Log |
|---|---|---|
| Purchasing Agent | View | None |
| Purchasing Manager | View | None |
| Procurement Admin | Full (Create/Edit/View/Delete) | View |
| Integration Service Account | Full | Full |
| Finance Manager | View | View |

### 7.3 Permission Matrix — Purchase Order

| Role | Create | Edit | Approve | View All |
|---|---|---|---|---|
| Purchasing Agent | Yes | Own records | No | Own subsidiary |
| Purchasing Manager | Yes | Yes | Yes | Own subsidiary |
| Procurement Admin | Yes | Yes | Yes | All subsidiaries |

### 7.4 Workflow Approval Permissions

- The **Approve** and **Reject** buttons on the PO form are rendered by the SuiteFlow workflow and are only visible to users with the Purchasing Manager role or higher, AND who are the designated supervisor for the specific PO requestor.
- Subsidiary restrictions in OneWorld apply: a Purchasing Manager in Subsidiary A cannot approve POs belonging to Subsidiary B unless they hold an inter-subsidiary role.

---

## 8. Integration Points

### 8.1 Integration Summary

| Integration ID | Direction | System | Frequency | Method | Req ID |
|---|---|---|---|---|---|
| INT-P2P-01 | Inbound (SAP -> NS) | SAP ERP (Legacy) | Nightly (01:00 AM) | SFTP flat file + Scheduled SuiteScript | FR-P2P-03 |

### 8.2 INT-P2P-01 — SAP Vendor Master Inbound

| Attribute | Detail |
|---|---|
| Source system | SAP (legacy ERP) |
| Target system | NetSuite OneWorld |
| Trigger | Time-based; SAP exports at 23:00, NetSuite reads at 01:00 |
| Transport | SFTP (preferred) or SAP REST API (alternate) |
| File format | CSV with header row (UTF-8, pipe-delimited preferred to handle commas in names) |
| File naming convention | `vendor_export_YYYYMMDD.csv` |
| File retention | 30 days on SFTP; archived to File Cabinet on read |
| Authentication | SFTP key pair; credentials stored in NetSuite Script Parameters (encrypted) |
| Error handling | Failed records logged to Integration Log; email alert to Procurement Admin |
| Retry strategy | Manual re-trigger via script deployment; no automatic retry to avoid duplicate creates |
| Idempotency | Matching on External ID (SAP Vendor Number) ensures safe re-runs |
| Volume estimate | TBD — confirm total active vendor count from SAP (design supports up to ~50,000 vendors per run within SuiteScript governance limits using N/task for large volumes) |

### 8.3 Governance Limit Considerations (SuiteScript)

| Script | Estimated Records/Run | Governance Strategy |
|---|---|---|
| Vendor Scorecard (FR-P2P-02) | Proportional to weekly receipt volume; likely < 10,000 search results | Use Search.run().each() with yield; monitor unit usage |
| SAP Vendor Sync (FR-P2P-03) | Up to vendor master size (TBD) | If > 5,000 records, implement Map/Reduce script type for parallel processing |

---

## 9. Open Items and Decisions

| # | Item | Owner | Target Date | Status |
|---|---|---|---|---|
| OI-01 | Confirm SAP integration transport: SFTP flat file vs. SAP REST API (affects INT-P2P-01 design) | Integration Architect + SAP Team | TBD | Open |
| OI-02 | Confirm total SAP vendor record count to validate SuiteScript governance approach (Scheduled vs. Map/Reduce) | SAP Team | TBD | Open |
| OI-03 | Confirm escalation policy for unapproved POs: number of business days before escalation and fallback approver role | Business Owner (Procurement) | TBD | Open |
| OI-04 | Confirm the SAP `ZTERM` (Payment Terms) to NetSuite Terms list mapping table | Finance + Procurement | TBD | Open |
| OI-05 | Confirm SAP `AKONT` (Reconciliation Account) handling — map to a custom field on Vendor or discard | Finance | TBD | Open |
| OI-06 | Confirm weekly scorecard schedule time and day (currently assumed Sunday 02:00 AM) | Business Owner (Procurement) | TBD | Open |
| OI-07 | Define below-threshold OTD% alert distribution list for FR-P2P-02 | Procurement Admin | TBD | Open |
| OI-08 | Confirm whether new vendors created by sync (inactive) require a formal review/activation workflow | Procurement Admin | TBD | Open |

---

*Document prepared by: NetSuite Solution Architect*
*Review required from: Procurement Business Owner, Finance Lead, Integration Architect, NetSuite Technical Lead*
