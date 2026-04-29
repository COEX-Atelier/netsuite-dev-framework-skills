# Data Dependency Sequence

NetSuite requires records to be imported in a specific order to maintain referential integrity. Follow this sequence:

## Level 1: Foundation (No Dependencies)
1. **Subsidiaries**
2. **Classificiations** (Departments, Classes, Locations)
3. **Currencies**
4. **Chart of Accounts** (Accounts)

## Level 2: Entity & Item Master Data
5. **Employees**
6. **Vendors**
7. **Customers** (Relationships: Leads -> Prospects -> Customers)
8. **Items** (Non-Inventory, Service, Inventory)

## Level 3: Open Balances & Transactions
9. **Opening Balances** (Journal Entries)
10. **Open Purchase Orders**
11. **Open Sales Orders**
12. **Open Accounts Payable** (Vendor Bills)
13. **Open Accounts Receivable** (Invoices)

## Level 4: Historical Data (Optional)
14. **Historical Transactions** (imported as closed records for reporting)
