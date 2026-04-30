To start a NetSuite implementation from QuickBooks for 3 subsidiaries and 50 users, follow this structured roadmap:

### 1. Project Initiation & Multi-Subsidiary Setup
*   **Establish the Core Team:** Identify a Project Manager and Subject Matter Experts for Finance (Accounting), Sales (O2C), and Procurement (P2P).
*   **OneWorld Architecture:** Set up the subsidiary hierarchy, base currencies, and tax nexus for your 3 entities.
*   **Reimagine the Chart of Accounts:** Instead of copying QuickBooks, leverage NetSuite’s dimensions (**Departments, Classes, Locations**) to simplify the CoA while gaining deeper reporting insights.

### 2. Core Process Design (O2C & P2P)
*   **Order-to-Cash (O2C):** Map out the sales cycle from order entry to fulfillment, invoicing, and payment.
*   **Procure-to-Pay (P2P):** Define the purchasing workflow, including requisition approvals, purchase orders, receiving, and vendor bill payments.\n*   **Standardize:** Adhere to NetSuite leading practices (SuiteSuccess) to minimize customization and speed up deployment.

### 3. Data Migration Strategy (The Critical Path)
*   **Master Data:** Cleanse and import your Customers, Vendors, Items, and Employees.
*   **Historical Data:**
    *   **Monthly Summaries:** Import monthly Trial Balance summaries for the last 2-3 years for comparative reporting.\n    *   **Open Balances:** Import only *open* transactions (Invoices, Bills, POs, SOs) as of the go-live date.
    *   **Archive:** Keep QuickBooks as a read-only historical archive rather than attempting to migrate every historical transaction.

### 4. Testing and Training
*   **User Acceptance Testing (UAT):** Have your 50 users validate end-to-end workflows in a Sandbox environment.
*   **Role-Based Training:** Ensure each user understands their specific tasks within the new NetSuite environment.

### 5. Cutover and Go-Live
*   Establish a \"blackout period\" for data transition.
*   Perform the final data load and reconcile opening balances.
*   Provide intensive post-go-live support for the first two weeks.

**The very first step:** Document your current \"As-Is\" processes in QuickBooks and identify the specific pain points you need NetSuite to solve.

The final response has been saved to: `ns-erp-navigator-workspace/iteration-2/eval-1/without_skill/outputs/response.md`