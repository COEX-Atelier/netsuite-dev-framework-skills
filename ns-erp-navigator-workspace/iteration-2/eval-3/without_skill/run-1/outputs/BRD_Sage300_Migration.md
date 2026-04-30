# Business Requirements Document (BRD)
## Project: Sage 300 to NetSuite ERP Migration
## Tier: 2 (Mid-Size)
## Origin: Brownfield (Replacing Sage 300)
## Version: 1.0

### 1. Executive Summary
The client, a mid-size manufacturing company, is migrating from Sage 300 to NetSuite to modernize its financial and operational foundation. Currently supporting approximately 80 users within a single subsidiary, the organization seeks to eliminate process silos between manufacturing, warehouse, and finance. The primary strategic goals are to achieve real-time inventory visibility, automate the Order-to-Cash and Procure-to-Pay cycles, and establish a scalable platform for future growth. Success will be measured by a 30% reduction in manual data entry and a month-end close cycle reduced to 5 business days.

---

### 2. Stakeholders
| Name | Department | Role |
| :--- | :--- | :--- |
| TBD | Finance | Executive Sponsor — CFO |
| TBD | Finance | Controller — Project Lead, GL and AP/AR requirements |
| TBD | Operations | Operations Manager — Manufacturing and Production lead |
| TBD | Warehouse | Warehouse Manager — Inventory and Fulfillment owner |
| TBD | IT | IT Manager — Infrastructure and Migration support |

---

### 3. Current State Analysis
**Order-to-Cash (O2C):**
Currently, sales orders are captured in a legacy front-end system and manually re-entered into Sage 300. Inventory levels in Sage are often inaccurate as they are only updated after daily batch processing, leading to frequent backorders. Fulfillment is tracked via paper-based pick tickets, and shipping data is manually typed into Sage to trigger invoicing.
*Pain Points:* Manual re-entry errors, lack of real-time inventory for sales, 48-hour lag in invoicing post-shipment.

**Procure-to-Pay (P2P):**
Purchasing is handled via email and verbal requests. POs are created in Sage 300, but receipt of goods is recorded on paper logs. Accounts Payable performs manual three-way matching by physically comparing the PO, the warehouse log, and the vendor's PDF invoice. 
*Pain Points:* No formal approval workflow, high risk of duplicate payments, difficult to track vendor performance or lead times.

**Manufacturing & Inventory:**
Raw materials and finished goods are tracked in Sage, but work-in-progress (WIP) is managed in offline spreadsheets. The cost of goods sold (COGS) is calculated monthly via manual journal entries rather than real-time production posting.
*Pain Points:* Inaccurate product costing, no visibility into production bottlenecks.

---

### 4. Functional Requirements
| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| FR-01 | Order-to-Cash | System must allow sales order creation with real-time "available to promise" inventory checks. | H |
| FR-02 | Order-to-Cash | Automated customer credit check must hold orders if the customer is over their limit or has overdue invoices > 60 days. | H |
| FR-03 | Order-to-Cash | Support for partial fulfillments and automatic backorder management. | H |
| FR-04 | Procure-to-Pay | Purchase orders must route for approval based on total value ($0-5k: Supervisor, $5k+: Director). | H |
| FR-05 | Procure-to-Pay | Automated 3-way match (PO vs. Item Receipt vs. Vendor Bill) with a 2% price variance tolerance. | H |
| FR-06 | Inventory | Real-time tracking of Raw Materials, WIP, and Finished Goods across the main facility and secondary warehouse. | H |
| FR-07 | Manufacturing | Ability to define multi-level Bills of Materials (BOM) for core product lines. | H |
| FR-08 | Manufacturing | Work Order creation and completion to track labor and material consumption. | M |
| FR-09 | Reporting | Real-time Dashboard for Finance showing AR Aging and Daily Sales Outstandings (DSO). | H |
| FR-10 | Reporting | Production report showing planned vs. actual material usage (Variance Analysis). | M |

---

### 5. Technical Requirements
| ID | Category | Requirement Description | Priority (H/M/L) |
| :--- | :--- | :--- | :--- |
| TR-01 | Data Migration | Migration of Item Master (1,500 SKUs), Customer Master (3,000 records), and Vendor Master (500 records). | H |
| TR-02 | Data Migration | Migration of 2 years of monthly summarized GL balances from Sage 300. | H |
| TR-03 | Data Migration | Loading of all Open Sales Orders and Open Purchase Orders at the time of cutover. | H |
| TR-04 | Security | Role-based access control (RBAC) to restrict warehouse staff from financial data and vice-versa. | H |
| TR-05 | Configuration | Single subsidiary setup with CAD as the functional currency. | H |

---

### 6. Scope Boundaries

**In-Scope:**
- NetSuite Core Financials (GL, AP, AR, Banking)
- Inventory Management & Advanced Warehouse
- Order Management (O2C)
- Purchasing (P2P)
- Work Orders & Assemblies (Manufacturing)
- Data Migration: Masters and Open Transactions
- Users: ~80 internal users

**Out-of-Scope:**
- Multi-subsidiary/OneWorld (Deferred - only 1 subsidiary currently)
- Advanced Revenue Management (Deferred)
- Fixed Assets Management (Manual tracking for Phase 1)
- CRM/Sales Force Automation (Focus is on ERP/Finance)
- Integrated Shipping (UPS/FedEx) - using manual entry for Phase 1

**Deferred to Phase 2:**
- Demand Planning & Predictive Analytics
- Quality Management System (QMS)
- EDI Integration with major suppliers
- Customer Portal for order tracking
