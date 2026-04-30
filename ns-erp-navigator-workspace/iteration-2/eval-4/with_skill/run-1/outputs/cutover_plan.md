# NetSuite Cutover Plan: Go-Live Weekend

**Client:** Mid-Size Retail Company
**Go-Live Date:** Friday Launch / Monday Business Open
**Tier:** Tier 1 (Full Scale)
**Status:** UAT Complete, Training Signed Off

---

## 1. Timeline Overview

| Phase | Start Time | End Time | Goal |
| :--- | :--- | :--- | :--- |
| **Phase A: Pre-Freeze** | Wed/Thu | Friday 17:00 | Legacy data prep & final comms |
| **Phase B: System Freeze** | Friday 17:00 | Friday 18:00 | Stop legacy activity |
| **Phase C: Master Data** | Friday 18:00 | Friday 23:00 | Items, Customers, Vendors |
| **Phase D: Transactional** | Saturday 08:00 | Saturday 18:00 | Open POs, SOs, Inv, Bills |
| **Phase E: Balances** | Saturday 18:00 | Saturday 22:00 | Trial Balance & GL Opening |
| **Phase F: Validation** | Sunday 08:00 | Sunday 13:00 | Smoke tests & Sign-off |
| **Phase G: User Enablement** | Sunday 14:00 | Sunday 17:00 | Final communications & access |
| **Phase H: Monday Open** | Monday 08:00 | Ongoing | Hypercare Start |

---

## 2. Detailed Task List (Runbook)

### Phase A/B: The Freeze (Friday Afternoon)
- **17:00:** Formal shutdown of legacy ERP system. Users transition to "Read Only."
- **17:15:** Final legacy reports pulled:
    - AR & AP Aging (summarized and detailed)
    - Inventory Value & Quantity snapshot
    - Trial Balance (Pre-closing)
- **17:30:** Final data extracts for "Delta" changes since last dry run.

### Phase C: Master Data Load (Friday Night)
*Load Order is critical to maintain referential integrity.*
1. **Chart of Accounts:** Validate GL IDs match mapping.
2. **Items/SKUs:** Ensure Retail prices, Tax schedules, and UOMs are correct.
3. **Vendors:** Include default payment terms.
4. **Customers:** Include credit limits and retail segments.
5. **Employees:** Ensure roles and supervisors are mapped.
- **Checkpoint:** Record counts check (Extract vs. NetSuite).

### Phase D/E: Financials & Balances (Saturday)
1. **Load Open Transactions:**
    - **Open POs:** For receiving stock next week.
    - **Open SOs:** For fulfillment from the weekend/Monday.
    - **Open Vendor Bills:** For AP aging.
    - **Open Invoices:** For AR aging.
2. **Post Opening Balances:**
    - Journal Entry for Trial Balance reconciliation.
    - **Verification:** NetSuite Trial Balance must match Legacy Trial Balance to the penny.

### Phase F: Validation & Smoke Testing (Sunday Morning)
- **Finance Test:** Run AR/AP aging and compare to Friday's legacy exports.
- **Sales Test:** Create a SO, commit inventory, and fulfill.
- **Retail Test:** Test POS integration (if applicable) or retail store processing.
- **IT Test:** Confirm Print/PDF templates (Invoices, Packing Slips) work.
- **GO/NO-GO Meeting (13:00):** Project Sponsor makes final decision.

### Phase G: Final Prep (Sunday Afternoon)
- **14:00:** Reactivate Integrations (e-commerce, WMS, Bank feeds).
- **15:00:** Send "WELCOME TO NETSUITE" email to all users with login instructions.
- **16:00:** Handover to Hypercare War Room team.

---

## 3. Rollback Plan

**Point of No Return:** Saturday 20:00 (Post Opening Balances).

| Trigger | Action |
| :--- | :--- |
| Trial Balance fails to reconcile by Sat 18:00 | Re-attempt once, then Rollback. |
| Master data errors > 2% | Rollback and postpone for 2 weeks. |
| Critical Integration (POS/E-com) fails | Assess impact; potential "manual entry" or Rollback. |

---

## 4. Hypercare Strategy (Monday & Beyond)

- **War Room:** Active daily from 07:00 to 19:00 for Week 1.
- **Support Triage:** 
    - **P1:** Blocked process (e.g., cannot bill). 1-hour response.
    - **P2:** Workaround available. 4-hour response.
- **Daily Stand-up:** 16:00 daily with Stakeholders to review the Issue Log.
