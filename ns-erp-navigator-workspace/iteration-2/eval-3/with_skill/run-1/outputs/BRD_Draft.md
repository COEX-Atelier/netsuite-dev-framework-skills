# Business Requirements Document (BRD)
## Project: NetSuite ERP Implementation - Manufacturing Co.
## Tier: 2 (Mid-size)
## Origin: Brownfield (Migrating from Sage 300)
## Version: 1.0

### 1. Executive Summary
Manufacturing Co. is implementing NetSuite to replace Sage 300 to modernize its operations and finance functions. With approximately 80 users and a single subsidiary, the project focuses on streamlining Order-to-Cash (O2C) and Procure-to-Pay (P2P) processes. The primary goal is to eliminate manual workarounds currently required in Sage 300, improve inventory visibility, and establish a scalable foundation for future growth. Success is defined by the successful migration of core financial and operational data and the automation of manual approval and fulfillment workflows.

---

### 2. Stakeholders
| Name | Department | Role |
| :--- | :--- | :--- |
| TBD | Executive | Project Sponsor - Final sign-off authority |
| TBD | Finance | Controller - GL, month-end, and financial reporting owner |
| TBD | Operations | Operations Manager - O2C and P2P process owner |
| TBD | IT | IT Manager - Systems, integrations, and data migration owner |

---

### 3. Current State Analysis
**Order-to-Cash (O2C):** Currently managed in Sage 300 with significant manual intervention. Sales orders are entered manually, and inventory visibility is delayed, leading to potential stockouts or over-promising. Pick tickets are printed manually, and there is no automated link between fulfillment and invoicing, resulting in a 1-2 day delay in revenue recognition.

**Procure-to-Pay (P2P):** Purchase orders are created in Sage 300 but often lack a formal, automated approval workflow. Receiving is tracked through manual logs and then updated in the system. Three-way matching (PO, Receipt, Vendor Bill) is a labor-intensive manual process performed by the AP team, increasing the risk of payment errors and slowing down the month-end close.

---

### 4. Functional Requirements
| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| FR-01 | Order-to-Cash | System must support automated Sales Order creation and approval workflows. | H |
| FR-02 | Order-to-Cash | Real-time inventory availability checks must be performed during Sales Order entry. | H |
| FR-03 | Order-to-Cash | Automated generation of Pick, Pack, and Ship documentation upon order approval. | H |
| FR-04 | Order-to-Cash | System must automatically generate Invoices upon fulfillment (Shipment Confirmation). | H |
| FR-05 | Procure-to-Pay | Automated Purchase Order approval workflow based on defined spending limits. | H |
| FR-06 | Procure-to-Pay | System must support Three-Way Match (PO vs. Item Receipt vs. Vendor Bill) with automated variance flagging. | H |
| FR-07 | Procure-to-Pay | Vendor management including performance tracking and automated payment scheduling. | M |
| FR-08 | Inventory | Real-time tracking of inventory levels within the single subsidiary location. | H |
| FR-09 | Financials | Automated General Ledger posting for all O2C and P2P transactions. | H |
| FR-10 | Reporting | Standard financial reports (P&L, Balance Sheet, Cash Flow) must be available out-of-the-box. | H |
| FR-11 | Reporting | Operational reports for Sales (Order Backlog) and Procurement (Open POs). | M |

---

### 5. Technical Requirements
| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| TR-01 | Data Migration | Migration of Master Data (Customers, Vendors, Items, Chart of Accounts) from Sage 300. | H |
| TR-02 | Data Migration | Migration of Open Transactions (Open SOs, Open POs, Open Bills) as of cutover date. | H |
| TR-03 | Data Migration | Migration of GL Opening Balances for the current fiscal year. | H |
| TR-04 | Security | Role-based access control (RBAC) to restrict user access by department and function. | H |
| TR-05 | Security | Support for 80 concurrent internal users. | H |

---

### 6. Scope Boundaries

**In-Scope:**
- NetSuite Core Financials (GL, AR, AP)
- Order Management (Order-to-Cash)
- Procurement (Procure-to-Pay)
- Inventory Management (Single location)
- Data Migration from Sage 300 (Master data and open transactions)
- Training for ~80 users

**Out-of-Scope:**
- Multi-subsidiary consolidation (Future phase)
- Manufacturing-specific modules (WIP, Routing - to be reviewed for Phase 2)
- Advanced WMS (Phase 2 candidate)
- External integrations (CRM, EDI - Phase 2 candidate)

**Deferred to Phase 2:**
- Advanced Revenue Recognition
- Fixed Assets Management
- Manufacturing Planning and Scheduling
