# Solution Design Document (SDD)
<!-- Copy this file and rename it: SDD_[FunctionalArea].md (e.g., SDD_O2C.md) -->
<!-- One SDD per functional area. Do not combine areas into a single document. -->

---

## Document Header

| Field | Value |
|-------|-------|
| **Project** | [Project Name] |
| **Functional Area** | [e.g., Order-to-Cash / Procure-to-Pay / Record-to-Report] |
| **Author** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Version** | 0.1 Draft |
| **BRD Reference** | [Link or document name] |
| **Fit-Gap Reference** | [FGA_[Area].md] |
| **Reviewed By** | [Name, Date] |
| **Approved By** | [Name, Date] |

---

## Completion Checklist
<!-- Work through this before marking the SDD as "Approved". -->

- [ ] All BRD Requirement IDs for this functional area are addressed in §1
- [ ] Future-state process flow is documented in §2 (at minimum, a step-by-step narrative)
- [ ] Every configuration item has a clear setup instruction (not just "configure custom field")
- [ ] All custom fields have: label, internal ID format, field type, record, and purpose
- [ ] All custom records have: name, internal ID format, purpose, and key fields
- [ ] Every automation item (workflow/script) references a Customization Spec (CUST-XX-NN)
- [ ] Every integration references an Integration Spec (INT-XX-NN)
- [ ] User roles with access changes are listed in §6
- [ ] RTM has been updated with Solution IDs for all requirements covered here
- [ ] No section left blank — mark N/A explicitly if not applicable

---

## 1. Requirements Reference

> *List every BRD Requirement ID this SDD addresses. This is the traceability anchor — every requirement must map forward to a specific section of this document.*

| Req ID | Requirement Summary | Priority | Fit | Addressed In |
|--------|---------------------|----------|-----|--------------|
| FR-01 | *(example)* Apply customer prepayments to Sales Orders | High | S | §3.1 — Standard Feature |
| FR-02 | *(example)* Subsidiary-branded invoice PDF | Medium | C | §4.2 — Custom PDF Template |
| FR-03 | *(example)* Auto-approve orders under $500 | Low | C | §5.1 — CUST-O2C-01 |
| FR-04 | *(example)* Nightly commission calculation | High | X | §5.2 — CUST-O2C-02 |
| FR-05 | *(example)* Salesforce CRM sync | High | X | §7 — INT-SFDC-01 |

---

## 2. Future-State Business Process Flow

> *Describe the end-to-end process as it will work after the NetSuite implementation. Focus on the business steps, not the technical mechanics. If you have a process diagram, embed or link it here. At minimum, provide a numbered narrative.*
>
> *Highlight where the process changes from the current state — these transition points are where training and change management effort concentrate.*

### 2.1 Process: [Name, e.g., "Customer Order Entry and Approval"]

**Scope:** [Where the process starts and ends]

**Actors:** [Roles involved, e.g., Sales Rep, Sales Manager, Customer Service]

**Steps:**

1. Sales Rep creates a **Sales Order** in NetSuite, selecting the Customer and adding line items.
2. System validates item availability against committed inventory.
3. If order amount < $500: Workflow auto-approves and sets status to "Approved" *(see CUST-O2C-01)*.
4. If order amount ≥ $500: Order routes to Sales Manager queue for manual approval.
5. Sales Manager reviews and approves or rejects from the Approval Dashboard (saved search).
6. On approval, system triggers fulfillment workflow — Item Fulfillment record is created.
7. Warehouse picks, packs, and ships; Item Fulfillment updated to "Shipped."
8. Invoice is auto-generated from the fulfilled Sales Order.
9. Customer receives invoice via email using the Advanced PDF template *(see §4.2)*.

**Exception Paths:**
- If an item is out of stock: Sales Rep is notified via alert; order stays in "Pending Fulfillment" until restocked.
- If Sales Manager rejects: Sales Rep is notified with rejection reason; order returns to "Pending Approval."

---

## 3. NetSuite Solution Overview

> *Summarize the implementation approach for this functional area — what is standard, what is configuration, and what is custom. This is the executive summary for the technical approach.*

### 3.1 Standard Features Being Used

> *List NetSuite features/modules that will be enabled as-is. Include the navigation path for where to enable each.*

| Feature | Purpose | Setup Location |
|---------|---------|----------------|
| Customer Deposits | Enable prepayment application to Sales Orders | Setup > Accounting > Accounting Preferences > Order Management |
| Advanced PDF/HTML Templates | Custom invoice PDF layout | Customization > Forms > Advanced PDF/HTML Templates |
| SuiteFlow Approval Routing | Manager approval for high-value orders | Customization > Workflow > Workflows |

### 3.2 Configuration Items

> *Describe every configuration change required. Be specific enough that a configurator can execute each item without asking follow-up questions.*

| Config Item | Description | Record / Location | Notes |
|-------------|-------------|-------------------|-------|
| Custom Field: Approval Status | Tracks approval state on Sales Order | Body field on Sales Order | Type: List — values: Pending (default), Approved, Rejected. Internal ID: `custbody_approval_status` |
| Custom Field: Approved By | Records who approved (or "AUTO") | Body field on Sales Order | Type: Free-Form Text. Internal ID: `custbody_approved_by` |
| Saved Search: Approval Dashboard | Manager queue for pending approvals | Saved Search on Sales Order | Filter: Approval Status = Pending AND Amount >= 500 |

### 3.3 Solution Summary Map

| Req ID | Solution Type | Solution ID | Description |
|--------|--------------|-------------|-------------|
| FR-01 | Standard | SDD §3.1 | Customer Deposits feature enabled |
| FR-02 | Configuration | SDD §4.2 | Advanced PDF template with logo logic |
| FR-03 | Customization | CUST-O2C-01 | Auto-approval workflow |
| FR-04 | Customization | CUST-O2C-02 | Commission calculation script |
| FR-05 | Integration | INT-SFDC-01 | Salesforce CRM sync |

---

## 4. Records & Fields

> *Document every record and field involved in this solution — standard, configured, and custom.*

### 4.1 Standard Records Used

| Record Type | Internal ID | Purpose in This Solution |
|-------------|-------------|--------------------------|
| Sales Order | `salesorder` | Primary transaction for order capture |
| Item Fulfillment | `itemfulfillment` | Tracks pick/pack/ship |
| Invoice | `invoice` | Billing document generated post-fulfillment |
| Customer | `customer` | Counterparty on all transactions |

### 4.2 Custom Records

> *Only fill if custom records are required. Write "None required" if not applicable.*

| Record Name | Internal ID | Purpose | Key Fields |
|-------------|-------------|---------|------------|
| Commission Calculation | `customrecord_commission_calc` | Stores nightly commission results per Sales Rep | Sales Rep (entity), Period, Total Sales Amount, Commission Amount, Rate Applied |

### 4.3 Custom Fields

> *List every custom field. Include all details a developer and configurator need. Leaving "TBD" here causes build rework.*

| Field Label | Internal ID | Field Type | Record | Sublist? | Purpose | Validation / Default |
|-------------|-------------|------------|--------|----------|---------|----------------------|
| Approval Status | `custbody_approval_status` | List/Record | Sales Order | No | Tracks approval state | List: Pending (default), Approved, Rejected |
| Approved By | `custbody_approved_by` | Free-Form Text | Sales Order | No | Identifies approver or "AUTO" | Set programmatically; no UI default |
| Commission Rate % | `custitem_commission_rate` | Percent | Item | No | Per-item commission rate for nightly calculation | Required field; validate > 0 |

---

## 5. Automation & Logic

> *Directory of every automated process for this functional area. Each item must link to a Customization Spec — this section is a pointer, not the full spec.*

### 5.1 SuiteFlow Workflows

| Workflow ID | Name | Record | Trigger | Purpose | Spec |
|-------------|------|--------|---------|---------|------|
| WF-O2C-01 | Sales Order Approval Routing | Sales Order | On Save (Create, Edit) | Route orders ≥ $500 to manager; auto-approve < $500 | CUST-O2C-01 |

### 5.2 SuiteScript Customizations

| Script ID | Name | Type | Record | Trigger | Purpose | Spec |
|-----------|------|------|--------|---------|---------|------|
| SS-O2C-01 | Nightly Commission Calculator | Map/Reduce | Commission Calc | Scheduled — daily 02:00 UTC | Calculate and write commission amounts per Sales Rep | CUST-O2C-02 |

---

## 6. User Roles & Permissions

> *List every role that needs to be created, modified, or has access implications due to this design. "No changes required" is a valid and explicit entry.*

| Role | Change Type | Detail |
|------|-------------|--------|
| Sales Rep | Permission Add | View `custbody_approval_status` on Sales Order |
| Sales Manager | New Dashboard | Access to "Pending Approvals" saved search + approve/reject buttons |
| Accounting | No change | Existing invoice access is sufficient |
| Administrator | Permission Review | TBA credentials for INT-SFDC-01 must use a restricted integration role, not Administrator |

---

## 7. Integrations

> *List every integration point for this functional area. Each must link to an Integration Spec.*

| Integration ID | Name | Direction | Pattern | Trigger | Spec |
|----------------|------|-----------|---------|---------|------|
| INT-SFDC-01 | Salesforce Opportunity → NetSuite SO | Inbound | RESTlet | Salesforce webhook on Close Won | INT_SFDC_01.md |

---

## 8. Open Items & Decisions

> *Track unresolved design questions. Do not mark the SDD as "Approved" with open items — escalate blockers to the PM.*

| # | Open Item | Owner | Due Date | Status |
|---|-----------|-------|----------|--------|
| 1 | Confirm $500 auto-approval threshold with VP Sales | [Name] | [Date] | Open |
| 2 | Obtain subsidiary logo files from Marketing | Client | [Date] | Open |

---

## Change Log

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 0.1 | [Date] | [Author] | Initial draft |
