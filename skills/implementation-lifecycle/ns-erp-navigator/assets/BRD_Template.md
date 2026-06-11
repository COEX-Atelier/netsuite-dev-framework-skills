# Business Requirements Document (BRD)
## Project: [Project Name]
## Tier: [1 | 2 | 3]
## Origin: [Greenfield | Brownfield]
## Version: 1.0

### 1. Executive Summary
[Brief overview of the project and its strategic goals. 2–4 sentences covering: what system is being implemented/replaced, why now, and the primary business outcome expected.]

> **Example:** Acme Manufacturing is implementing NetSuite to replace Sage 300 across its single Canadian subsidiary. The migration is driven by the need for real-time inventory visibility and automated Order-to-Cash processing. Success is defined as eliminating manual re-keying between the warehouse and finance teams and closing the books within 5 business days of month-end.

---

### 2. Stakeholders
| Name | Department | Role |
| :--- | :--- | :--- |
| [Full Name] | Finance | Executive Sponsor — final sign-off authority |
| [Full Name] | Finance | Controller — owns GL, month-end close requirements |
| [Full Name] | Operations | Warehouse Manager — owns fulfillment and inventory |
| [Full Name] | IT | IT Lead — owns integrations and security |

---

### 3. Current State Analysis
[Describe how processes work today and the key pain points discovered in stakeholder interviews. One paragraph per major process area.]

> **Example (Order-to-Cash):** Sales orders are entered manually in Sage 300 by the CSR team. Pick tickets are printed and handed to the warehouse. Shipping confirmation is re-entered into Sage by finance. Invoice generation is a manual step delayed 1–2 days after shipment. Pain points: no real-time inventory visibility, 2-day invoicing delay, no automated customer credit limit check.

> **Example (Procure-to-Pay):** Purchase orders are created in Sage 300. Goods receipt is tracked in a separate Excel sheet. Three-way matching (PO / Receipt / Invoice) is performed manually by AP. Pain points: duplicate payment risk, month-end AP reconciliation takes 2 days, no automated approval routing for POs above $10,000.

---

### 4. Functional Requirements
| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| FR-01 | Order-to-Cash | System must automatically check customer credit limit when a sales order is saved and block order creation if limit is exceeded. | H |
| FR-02 | Order-to-Cash | Fulfillment pick ticket must be automatically generated and emailed to warehouse upon sales order approval. | H |
| FR-03 | Order-to-Cash | Invoice must be auto-generated upon shipment confirmation with no manual intervention. | H |
| FR-04 | Procure-to-Pay | Purchase orders above $10,000 must route through a two-level approval workflow (Manager → VP Finance). | H |
| FR-05 | Procure-to-Pay | System must support three-way matching (PO / Item Receipt / Vendor Bill) and flag discrepancies > 2% for AP review. | H |
| FR-06 | Inventory | System must track inventory across 2 warehouse locations with real-time on-hand quantity. | H |
| FR-07 | Reporting | Management requires a daily inventory valuation report exportable to Excel. | M |
| FR-08 | Reporting | Finance requires a month-end Trial Balance and P&L by department. | H |
| FR-09 | Integration | NetSuite must receive confirmed shipment data from the 3PL warehouse system via nightly batch file. | M |
| FR-10 | Data Migration | All open Sales Orders, open Purchase Orders, and open Vendor Bills as of cutover date must be migrated. | H |

*Add rows as needed. ID format: FR-XX for functional, TR-XX for technical.*

---

### 5. Technical Requirements
[Integration, data migration, and security requirements. Use the table below or prose — whichever suits the complexity.]

| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| TR-01 | Integration | Inbound nightly CSV feed from 3PL system for shipment confirmations. Batch, file-based, automated. | M |
| TR-02 | Data Migration | Historical GL transactions for current fiscal year must be migrated as summarized journal entries by period. | H |
| TR-03 | Security | All finance users must be restricted to their subsidiary's data. Role-based access by department. | H |
| TR-04 | Security | System must support SSO via Azure AD for all internal users. | M |

---

### 6. Scope Boundaries

**In-Scope:**
- NetSuite OneWorld — single subsidiary (Canada)
- Modules: Order Management, Inventory, Purchasing, AP, AR, GL
- Integration: 3PL shipment confirmation feed (inbound, nightly batch)
- Data Migration: Open transactions (SO, PO, Bills), GL opening balances, Item master, Vendor master, Customer master
- Users: ~80 internal users

**Out-of-Scope:**
- Payroll (remains in ADP — no integration in Phase 1)
- Historical transaction reporting beyond current fiscal year
- EDI with customers or suppliers
- eCommerce / Shopify integration (deferred to Phase 2)

**Deferred to Phase 2:**
- Shopify integration
- Advanced revenue recognition (ASC 606)
- Fixed Assets module
