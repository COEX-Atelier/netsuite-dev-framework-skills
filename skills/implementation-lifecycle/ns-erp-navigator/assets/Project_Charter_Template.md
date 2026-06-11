# Project Charter
## Project Name: [NetSuite Implementation]
## Tier: [1 | 2 | 3]
## Origin: [Greenfield | Brownfield]

---

### 1. Project Purpose
[Why are we doing this? 2–3 sentences covering the business driver and the cost of inaction.]

> **Example:** Acme Manufacturing is replacing Sage 300 with NetSuite to eliminate manual re-keying between warehouse and finance, achieve real-time inventory visibility, and reduce month-end close from 10 days to 5. Without this change, the company cannot support planned geographic expansion to a second subsidiary in 2026.

---

### 2. Measurable Objectives
[State outcomes that can be verified 90 days post go-live. Avoid vague goals like "improve efficiency."]

> **Examples:**
> - Month-end close completed within 5 business days (baseline: 10 days)
> - Invoice generation automated — 0 manual invoicing steps post-shipment (baseline: 1–2 day delay)
> - Inventory discrepancy rate reduced to < 1% (baseline: ~4% monthly cycle count variance)
> - 100% of POs above $10K routed through 2-level approval workflow

---

### 3. High-Level Requirements
[Key capabilities the solution must deliver. These are summary-level — full detail is in the BRD.]

> **Examples:**
> - Order-to-Cash: automated order entry, fulfillment, invoicing
> - Procure-to-Pay: PO workflow, 3-way matching, automated AP
> - Inventory: real-time multi-location tracking
> - Data migration: open transactions, master data, GL opening balances
> - Integration: nightly 3PL shipment feed

---

### 4. High-Level Risks
[Top 3–5 risks. For each: what is the risk and what is the mitigation?]

> **Examples:**
> - **Data quality risk:** Sage 300 vendor and customer master data has known duplicates. Mitigation: dedupe sprint in Month 1 before migration templates are populated.
> - **Scope creep risk:** Stakeholders may request Shopify integration during build. Mitigation: scope boundary locked in BRD; changes require sponsor sign-off and roadmap update.
> - **Resource availability risk:** Finance team is constrained during Q1 tax season. Mitigation: UAT scheduled for February to avoid March crunch.
> - **Go-live timing risk:** Current go-live target is November — adjacent to year-end freeze. Mitigation: October go-live preferred; November only with explicit sponsor approval.

---

### 5. Summary Milestone Schedule
| Milestone | Target Date |
| :--- | :--- |
| Discovery Complete — BRD & Charter Signed Off | [Month 1 end] |
| Solution Design Approved — SDDs complete | [Month 2 end] |
| Build Complete — Configuration & scripts in sandbox | [Month 3 end] |
| UAT Signed Off | [Month 5 mid] |
| Go-Live | [Month 6] |

*Adjust based on Implementation_Roadmap.md tier template. Flag any dates falling in peak season blackout windows.*

---

### 6. Budget Estimate
[High-level cost summary. Sufficient for sponsor approval — detail goes in the SOW.]

| Category | Estimated Cost |
| :--- | :--- |
| NetSuite licensing (Year 1) | $[X] |
| Implementation services | $[X] |
| Data migration services | $[X] |
| Training | $[X] |
| Contingency (15%) | $[X] |
| **Total** | **$[X]** |

---

### 7. Stakeholder List
[Key individuals, their role on the project, and their decision authority.]

| Name | Title | Project Role | Authority |
| :--- | :--- | :--- | :--- |
| [Name] | CFO | Executive Sponsor | Budget approval, scope decisions, go-live sign-off |
| [Name] | Controller | Finance Lead | BRD sign-off, UAT approval, GL opening balance sign-off |
| [Name] | IT Director | Technical Lead | Integration design, security approval |
| [Name] | Warehouse Manager | Operations Lead | Inventory requirements, fulfillment UAT |
| [Name] | Project Manager (Consultant) | PM | Day-to-day delivery, PLAN.md owner |
