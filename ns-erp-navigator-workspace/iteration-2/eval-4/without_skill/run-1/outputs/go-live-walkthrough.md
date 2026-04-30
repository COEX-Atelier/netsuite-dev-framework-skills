# NetSuite Go-Live Walk-Through: Friday to Monday Morning
## Context: Mid-Size Retail Company

This walk-through covers the "Cutover Weekend," the most critical 60-hour window where the business transitions from legacy systems to NetSuite Production.

---

### Phase 1: Friday Afternoon - The System Freeze
**Timeline: Friday 17:00 – 20:00**

1.  **Legacy System Freeze:** 
    *   **ERP/Accounting:** Disable user access to the legacy ERP to prevent new transactions.
    *   **Retail/POS:** For physical stores, ensure all registers are "Z-ed out" (end-of-day processed) and no new sales are entered into the old system.
    *   **E-Commerce:** Place your web store into "Maintenance Mode" or disable the sync to the legacy ERP.
2.  **Data Extraction:**
    *   Extract final "Point-in-Time" data: Trial Balance, AR/AP Aging, and most importantly for retail, an **Inventory Snapshot** by location.
3.  **Production Readiness:**
    *   Login to NetSuite Production. Verify "Company Information" and "Enable Features" match the Sandbox configuration.
    *   Confirm all custom scripts and workflows are "Released" and not in "Testing" mode.

---

### Phase 2: Friday Night - Master Data & Setup
**Timeline: Friday 20:00 – Saturday 02:00**

1.  **Master Data Import:**
    *   **Items (Matrix & Kits):** Load all retail items, including matrix records (Size/Color) and price levels.
    *   **Customers & Vendors:** Import final customer lists (including retail loyalty members) and vendor records.
2.  **Validation:**
    *   Run record counts (e.g., "1,500 Items expected, 1,500 Items imported").
    *   Spot-check 5 high-priority items to ensure pricing and tax schedules are correct.

---

### Phase 3: Saturday - Transactional Data & Opening Balances
**Timeline: Saturday 08:00 – 18:00**

1.  **Opening Balances:**
    *   Post the **Trial Balance** via Journal Entry.
    *   **Inventory Load:** Import the Inventory Worksheet using the snapshot from Friday night to establish quantity and value by location (Stores + Warehouse).
2.  **Open Transactions:**
    *   **Sales Orders:** Import open e-commerce and wholesale orders.
    *   **Purchase Orders:** Import open vendor orders.
    *   **Accounts Payable/Receivable:** Import open bills and invoices to populate aging reports.
3.  **Finance Reconcile:**
    *   Finance lead compares NetSuite Trial Balance and Aging reports against legacy extracts. **Sign-off is required to proceed.**

---

### Phase 4: Saturday Evening - The "Smoke Test"
**Timeline: Saturday 18:00 – 22:00**

1.  **End-to-End Process Validation:**
    *   Place a test web order (if integration is ready).
    *   Process a test POS transaction (if applicable).
    *   Fulfill an order and generate an invoice.
2.  **Integration Activation:**
    *   Enable production integrations (Shopify/Magento, Shipping carriers, 3PL/WMS).
    *   Verify connectivity and "Heartbeat" of all middleware (e.g., Celigo, FarApp, or Dell Boomi).

---

### Phase 5: Sunday - User Readiness & Communication
**Timeline: Sunday 09:00 – 16:00**

1.  **User Provisioning:**
    *   Activate NetSuite User access. Trigger "Welcome" emails or confirm SSO connectivity.
    *   Verify that store managers have the correct "Retail Store Manager" roles.
2.  **Communication:**
    *   Send the **"Go-Live Email"** to all staff with instructions on how to log in, where to find "How-To" guides, and how to contact the Support War Room.
3.  **Final Go/No-Go:**
    *   Project Manager and Sponsor meet for a final review. If all critical paths (Sales, Inventory, Shipping) are functional, the decision is **GO**.

---

### Phase 6: Monday Morning - Hypercare Kickoff
**Timeline: Monday 07:00 – 10:00**

1.  **War Room Active:** 
    *   The project team is on-site (or on a bridge) to triage issues.
2.  **Store Opening Support:**
    *   Monitor the first 100 transactions from stores and web.
    *   Watch for "Duplicate Order" or "Sync Error" logs in integrations.
3.  **Daily Stand-up (09:00):**
    *   Quick meeting to identify "Showstoppers." Use a P1-P4 severity scale to triage incoming requests.

**Welcome to NetSuite!**
