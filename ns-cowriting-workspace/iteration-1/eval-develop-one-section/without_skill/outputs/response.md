# Business Requirements Document (BRD)

**Project:** NetSuite ERP Implementation
**Draft File:** 01_Discovery/BRD_Draft.md
**Version:** 1.0 (Draft)
**Status:** In Progress — Phase B (Content Development)

---

## 1. Executive Summary

This document defines the business requirements for the implementation of Oracle NetSuite as the primary Enterprise Resource Planning (ERP) system for the organization. The initiative is driven by a need to replace or augment existing legacy systems that no longer support the company's operational scale, reporting demands, or growth objectives.

The implementation will cover core financial management, order-to-cash processing, and supporting operational workflows within a single-subsidiary structure. The project targets approximately 80 internal users across Finance, Operations, Sales, and IT functions.

The primary goal of this project is to establish a unified, cloud-based ERP platform that eliminates manual workarounds, improves real-time data visibility, and creates a scalable foundation for future business growth. Success will be measured by the full cutover from legacy systems, user adoption across all in-scope departments, and the elimination of identified manual processes within 90 days of go-live.

---

## 2. Business Drivers

The decision to implement NetSuite is grounded in the following strategic and operational pain points:

**2.1 Inventory Accuracy and Visibility**
The current system lacks real-time inventory tracking, leading to frequent stockouts, over-promising to customers, and delayed fulfillment. Operations teams rely on manual counts and offline spreadsheets to reconcile stock levels, introducing error and lag into daily decisions.

**2.2 Manual Accounts Payable Processes**
The AP function currently performs three-way matching (Purchase Order, Item Receipt, Vendor Bill) manually. This process is time-consuming, error-prone, and a consistent bottleneck during month-end close. Automating this workflow is a high-priority driver for this implementation.

**2.3 Lack of Real-Time Financial Reporting**
Finance leadership cannot access current-period financial data without running manual consolidations and exports. This limits the ability to make timely business decisions and increases the burden on the accounting team during close cycles.

**2.4 Scalability Constraints**
The existing legacy platform cannot accommodate anticipated growth in transaction volume, user count, or potential multi-entity expansion. The business requires a platform capable of scaling with minimal re-implementation effort.

**2.5 Process Standardization**
Workflows across Order-to-Cash and Procure-to-Pay are inconsistent across teams, relying on individual knowledge rather than system-enforced procedures. NetSuite will serve as the system of record with defined, auditable workflows.

---

## 3. Scope

### 3.1 In-Scope

The following functional areas and processes are included in Phase 1 of this implementation:

- **Core Financials:** General Ledger (GL), Accounts Receivable (AR), Accounts Payable (AP), and financial close processes
- **Order-to-Cash (O2C):** Sales order entry, approval workflows, item fulfillment (pick, pack, ship), and automated invoicing upon shipment
- **Procure-to-Pay (P2P):** Purchase order creation and approval, item receipt, three-way match, and vendor bill processing
- **Inventory Management:** Real-time inventory tracking for a single warehouse/location
- **Reporting:** Standard financial reports (P&L, Balance Sheet, Cash Flow Statement) and operational reports (order backlog, open POs)
- **Data Migration:** Migration of master data (Customers, Vendors, Items, Chart of Accounts) and open transactions from the legacy system
- **User Enablement:** End-user training for approximately 80 users across in-scope departments

### 3.2 Out-of-Scope

The following items are explicitly excluded from Phase 1 and deferred to a future phase:

- Multi-subsidiary consolidation and intercompany transactions
- Manufacturing-specific modules (Work in Process, Routing, Production Scheduling)
- Advanced Warehouse Management System (WMS) capabilities
- External system integrations (CRM, EDI, third-party logistics)
- Advanced Revenue Recognition (ASC 606)
- Fixed Assets Management module
- Customer-facing portals or self-service capabilities

---

## 4. Functional Requirements

| ID | Category | Requirement Description | Priority |
|---|---|---|---|
| FR-01 | Order-to-Cash | The system must support automated Sales Order creation with configurable approval workflows based on order value and customer tier. | High |
| FR-02 | Order-to-Cash | Real-time inventory availability must be checked and displayed during Sales Order entry to prevent over-commitment. | High |
| FR-03 | Order-to-Cash | The system must automatically generate Pick, Pack, and Ship documentation upon Sales Order approval. | High |
| FR-04 | Order-to-Cash | Customer invoices must be automatically generated upon shipment confirmation without manual intervention. | High |
| FR-05 | Procure-to-Pay | The system must support Purchase Order creation with automated approval routing based on configurable spending thresholds. | High |
| FR-06 | Procure-to-Pay | The system must perform automated Three-Way Match (PO vs. Item Receipt vs. Vendor Bill) and flag variances exceeding defined tolerances. | High |
| FR-07 | Procure-to-Pay | The system must support vendor management including payment terms tracking and automated payment scheduling. | Medium |
| FR-08 | Inventory | The system must provide real-time inventory level tracking across all item classes within the single subsidiary location. | High |
| FR-09 | Financials | All O2C and P2P transactions must post automatically to the General Ledger without manual journal entry. | High |
| FR-10 | Financials | The system must support a standard month-end close process including period locking and audit trail. | High |
| FR-11 | Reporting | Standard out-of-the-box financial reports (P&L, Balance Sheet, Cash Flow) must be available to Finance users without customization. | High |
| FR-12 | Reporting | Operational reports for Sales Order backlog and Open Purchase Orders must be available to Operations users. | Medium |

---

## 5. Assumptions

The following assumptions underpin the requirements and scope defined in this document. If any assumption proves incorrect, the scope, timeline, or budget may require revision.

1. **Single Subsidiary:** The organization operates as a single legal entity with one subsidiary in NetSuite. No multi-entity or intercompany configuration is required in Phase 1.

2. **Single Warehouse Location:** All inventory is managed from one physical location. Multi-location or bin-level inventory tracking is not required in Phase 1.

3. **Approximately 80 Named Users:** The implementation will support up to 80 named user licenses. License counts are subject to confirmation during the discovery phase.

4. **Legacy System Data Quality:** Source data from the legacy system is assumed to be reasonably clean and exportable in standard formats (CSV or equivalent). A formal data quality assessment will be conducted prior to migration.

5. **Stakeholder Availability:** Key business stakeholders (Finance, Operations, IT) will be available for workshops, User Acceptance Testing (UAT), and sign-off activities throughout the project lifecycle.

6. **Out-of-the-Box Functionality:** Where NetSuite's standard functionality meets the business requirement, it will be adopted without customization. Customization requests will require change control approval.

7. **No Real-Time Third-Party Integrations in Phase 1:** All integrations with external systems (CRM, EDI, logistics providers) are deferred to Phase 2. Manual data processes or file-based imports may serve as interim solutions if required.

8. **Training Responsibility:** End-user training will be delivered by the implementation team. The business is responsible for ensuring user attendance and coordinating scheduling.

9. **Go-Live Readiness:** A formal go/no-go criteria checklist will be agreed upon prior to UAT. The project will not proceed to cutover unless all High-priority functional requirements have passed UAT.

10. **NetSuite Licensing:** The client is responsible for procuring the appropriate NetSuite licenses (modules and user count) in alignment with the confirmed scope before configuration begins.

---

*Document Status: Draft — Phase B Content Development in progress. Sections subject to stakeholder review and revision.*
*Draft saved to: 01_Discovery/BRD_Draft.md*
