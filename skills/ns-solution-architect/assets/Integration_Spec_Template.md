# Integration Specification
<!-- Copy this file and rename it using the ID below. One file per integration. -->

---

## Header

| Field | Value |
|-------|-------|
| **Spec ID** | INT-[SystemCode]-[NN] *(e.g., INT-SFDC-01 for Salesforce #1)* |
| **Integration Name** | [Short descriptive name, e.g., "Salesforce Opportunity → NetSuite Sales Order Sync"] |
| **NetSuite Side** | NetSuite [Edition, e.g., OneWorld] |
| **External System** | [System name and version/edition] |
| **Direction** | Inbound / Outbound / Bi-directional |
| **Pattern** | [See Pattern Reference below] |
| **Status** | Draft / In Review / Approved / Built / Tested |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Version** | 0.1 |
| **Linked SDD** | [SDD filename and section] |
| **Linked RTM Rows** | [e.g., FR-05, FR-12] |

---

## Pattern Reference

Choose one. Consult `references/integration_patterns.md` for the full decision matrix.

| Pattern | Use When |
|---------|----------|
| **RESTlet** | External system calls NetSuite on demand; need custom logic on receipt; mobile apps; complex inbound processing |
| **SuiteTalk REST (CRUD)** | Standard CRUD operations on NetSuite records (Customers, Items, Transactions) using NetSuite's native REST API |
| **SuiteTalk SOAP** | Legacy integrations, complex queries, or tools that only support SOAP |
| **CSV Import / SuiteScript Import** | Bulk one-time or scheduled flat-file data loads; low real-time requirement |
| **SuiteQL (Outbound only)** | High-speed read-only data extraction for reporting, BI tools, or data warehouses |
| **File Cabinet / SFTP** | Document exchange (PDFs, reports) or batch file drops from external systems |

> **Authentication rule:** Always use Token-Based Authentication (TBA) or OAuth 2.0. Never password-based. This is a security requirement, not a preference.

---

## 1. Business Context

> *Why does this integration exist? What business process does it support? What manual work does it replace?*

[Describe in 2–4 sentences. Reference the BRD requirement.]

---

## 2. Integration Overview

| Field | Value |
|-------|-------|
| **Trigger Type** | Event-driven / Scheduled / Manual / Real-time webhook |
| **Trigger Detail** | [e.g., "When Salesforce Opportunity moves to 'Closed Won'" / "Daily at 01:00 UTC" / "On-demand button click"] |
| **Frequency / Volume** | [e.g., "Up to 200 records per batch, twice daily"] |
| **Latency Requirement** | [e.g., "Near real-time (< 2 min)" / "Same-day batch is acceptable"] |
| **Direction Detail** | [e.g., "Salesforce → NetSuite for new customers; NetSuite → Salesforce for invoice status"] |

---

## 3. Authentication & Security

| Field | Value |
|-------|-------|
| **Auth Method** | Token-Based Authentication (TBA) / OAuth 2.0 |
| **NetSuite Integration Record ID** | [Assigned at setup] |
| **Consumer Key / Client ID** | [Reference to secrets vault — never store in this document] |
| **External System Auth** | [e.g., "Salesforce Connected App with OAuth 2.0 JWT flow"] |
| **IP Allowlisting Required?** | Yes / No — [IP ranges if Yes] |
| **Secrets Storage** | [e.g., "AWS Secrets Manager / Azure Key Vault / Environment Variables"] |

> Never store credentials, tokens, or keys in this document. Reference your organization's secrets management system.

---

## 4. Field Mapping

> *Map every field that crosses the integration boundary. Be explicit about transforms — don't leave them as "TBD".*

### 4.1 [Direction: e.g., Salesforce → NetSuite]

| # | Source Field (Salesforce) | Source Type | Transform / Logic | Target Field (NetSuite) | Target Internal ID | Target Type | Required? |
|---|---------------------------|-------------|-------------------|-------------------------|--------------------|-------------|-----------|
| 1 | `Opportunity.AccountId` | ID | Lookup: match to NetSuite Customer by `externalid` | Customer | `entity` | List/Record | Yes |
| 2 | `Opportunity.Amount` | Currency (USD) | Direct map | Amount | `amount` | Currency | Yes |
| 3 | `Opportunity.CloseDate` | Date (ISO 8601) | Convert to MM/DD/YYYY | Transaction Date | `trandate` | Date | Yes |
| 4 | `Opportunity.Id` | String | Store as external reference | External ID | `externalid` | Free-Form Text | Yes — used for idempotency |
| 5 | `Opportunity.LineItems[]` | Array | Iterate; map each to SO line | Item Sublist | `item` | Sublist | Yes |

### 4.2 [Direction: e.g., NetSuite → Salesforce] *(if bi-directional)*

| # | Source Field (NetSuite) | Source Internal ID | Transform / Logic | Target Field (Salesforce) | Target Type | Required? |
|---|-------------------------|--------------------|-------------------|---------------------------|-------------|-----------|
| 1 | Invoice Status | `status` | Map: "Open" → "Billed", "Paid in Full" → "Paid" | `Opportunity.NetSuite_Invoice_Status__c` | Picklist | Yes |
| 2 | Invoice Number | `tranid` | Direct map | `Opportunity.NetSuite_Invoice_Number__c` | Text | Yes |

---

## 5. Error Handling & Retry Logic

| Scenario | Handling Approach |
|----------|-------------------|
| NetSuite returns HTTP 429 (rate limit / `SSS_REQUEST_LIMIT_EXCEEDED`) | Implement exponential backoff: wait 2s, 4s, 8s. Log and alert after 3 retries. |
| Record not found in NetSuite (customer lookup fails) | Create the record if "upsert" mode; reject and log with payload detail if "strict" mode. |
| Field validation failure on NetSuite save | Log full payload and error response to integration error log (custom record). Do not silently drop. |
| External system unavailable | Queue the payload; retry on next scheduled run. Alert integration monitor after [N] consecutive failures. |
| Duplicate payload detected (same `externalid`) | Upsert behavior — update the existing record rather than creating a duplicate. |
| Partial batch failure | Complete successful records; log and quarantine failed records for manual review. |

---

## 6. Idempotency Design

> *What prevents a message from being processed twice and creating duplicate records?*

- **Key field used as idempotency key:** [e.g., `Opportunity.Id` stored in NetSuite's `externalid`]
- **Upsert behavior:** If a record with this external ID already exists → update. If not → create.
- **Deduplication check:** [Describe where the check happens — on the NetSuite side, external system side, or middleware]

---

## 7. Staging & Processing Pattern

> *For complex integrations, describe whether data is staged before being committed to financial records.*

- [ ] **Staging custom record used?** (Recommended for high-volume or error-prone integrations)
  - Stage record name: [e.g., `customrecord_int_sfdc_staging`]
  - Processing script: [Link to Customization Spec, e.g., CUST-INT-01]
  - Staging-to-final promotion: [Triggered by: scheduled script / manual approval / auto-promote on validation pass]

---

## 8. Monitoring & Alerting

| Field | Value |
|-------|-------|
| **Success Log** | [Where successful transactions are recorded] |
| **Error Log** | [Custom record, email alert, or monitoring dashboard] |
| **Alert Threshold** | [e.g., "Alert if > 5 consecutive failures or any financial record fails"] |
| **Alert Recipients** | [Names / distribution list] |
| **Runbook Location** | [Link to operational runbook for on-call support] |

---

## 9. Testing Notes

| Test Case ID | Scenario | Input | Expected Result |
|--------------|----------|-------|-----------------|
| TC-INT-SFDC-01-01 | Happy path: new Opportunity creates SO | Valid Salesforce Opportunity payload | NetSuite Sales Order created with correct fields |
| TC-INT-SFDC-01-02 | Duplicate prevention | Same Opportunity ID sent twice | Second call updates the SO, does not create a duplicate |
| TC-INT-SFDC-01-03 | Customer not found | Unknown AccountId | Error logged to integration log; no SO created; alert sent |
| TC-INT-SFDC-01-04 | Rate limit response | Simulate 429 from NetSuite | Retry with backoff; succeeds on retry |
| TC-INT-SFDC-01-05 | Bi-directional invoice status push | Invoice marked "Paid in Full" in NetSuite | Salesforce Opportunity updated to "Paid" |

---

## 10. Dependencies

| Dependency | Type | Details |
|------------|------|---------|
| TBA credentials configured | Configuration | NetSuite integration record + token pair must be provisioned |
| `externalid` field on Sales Order | Configuration | Must be enabled on the Sales Order record form |
| Salesforce Connected App | External | Salesforce admin must create and share credentials before build begins |
| CUST-INT-01 staging processor | Customization | If staging pattern is used — must be built before integration testing |

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Solution Architect | | |
| Lead Developer | | |
| External System Owner | | |
| Client Sign-Off | | |
