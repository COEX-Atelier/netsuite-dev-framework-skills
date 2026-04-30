# Final Response: NetSuite Go-Live Walkthrough

Based on your current status (UAT and training complete), we are entering the most critical 72-hour window of the project. For a mid-size retail company, the priority is ensuring that Monday morning "Business as Usual" occurs in NetSuite with accurate inventory, open sales orders, and reconciled financial balances.

### Key Milestones Between Now and Monday Morning

1.  **The System Freeze (Friday 17:00):** 
    Your legacy system must be locked for transactional entry. This is the "snapshot" point. Final reports (AR/AP Aging, Inventory Value, Trial Balance) are pulled now to serve as the absolute source of truth for verification later this weekend.

2.  **Data Migration (Friday Night - Saturday Afternoon):**
    We load data in a specific sequence to maintain links. Master data (Items, Vendors, Customers) goes in Friday night. Saturday is dedicated to "Open" transactions—the things that were in-flight when you froze the system on Friday. 

3.  **Financial Reconciliation (Saturday Evening):**
    We post the opening Trial Balance. The goal is simple: the numbers in NetSuite must match your legacy reports to the penny. If this fails, we troubleshoot immediately. This is our "Point of No Return."

4.  **Validation & Smoke Testing (Sunday Morning):**
    Before letting users in, the project team runs "smoke tests." We'll place a dummy retail order, fulfill it, and check the accounting impact. We verify that integrations (like your e-commerce or POS) are talking to NetSuite Production correctly.

5.  **User Enablement & Go-Live (Sunday Afternoon):**
    Once the Sponsor gives the "GO," we activate user accounts and send the welcome communication. Monday morning, your team logs into NetSuite to start their day.

### Strategy for Success
- **War Room:** Establish a dedicated communication channel (Teams/Slack) for the weekend.
- **Rollback Awareness:** We have clear triggers to abort if data integrity is compromised.
- **Hypercare:** Monday starts "Hypercare Mode," with daily stand-ups and prioritized triage for any issues that arise.

**Attached:** Detailed Cutover Plan (Runbook) with hour-by-hour task assignments.
