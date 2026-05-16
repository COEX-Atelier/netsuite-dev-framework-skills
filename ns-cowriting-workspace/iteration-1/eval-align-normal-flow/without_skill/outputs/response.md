# Phase A Co-Writing Alignment — NetSuite BRD
**Mid-Size Manufacturing Company Implementation**
**Date:** 2026-05-16

---

## What Phase A Alignment Does

Before drafting begins, Phase A alignment ensures we have shared clarity on the three decision-required sections you flagged. Rather than writing placeholder content that gets overwritten later, we surface the key decisions now so the BRD reflects accurate, agreed-upon information from the first draft.

The three sections requiring decisions are:
1. **Scope** — what is in-scope and out-of-scope
2. **Stakeholder Map** — names and roles
3. **Functional Requirements** — priorities

Below is an alignment questionnaire for each. I recommend working through these with the project sponsor and key stakeholders before drafting begins.

---

## Section 2: Scope — Alignment Questions

### In-Scope Candidates (confirm yes / no / partial)

| Area | Typical for Mid-Size Manufacturing | Your Decision |
|---|---|---|
| Financial Management (GL, AP, AR, Fixed Assets) | Almost always in-scope | ? |
| Inventory & Warehouse Management | Core for manufacturing | ? |
| Manufacturing / Work Orders / BOMs | Core for manufacturing | ? |
| Procurement / Purchase Orders | Usually in-scope | ? |
| Order Management / Sales Orders | Usually in-scope | ? |
| Customer Relationship Management (CRM) | Sometimes deferred | ? |
| Advanced Manufacturing (NetSuite MFG module) | Depends on complexity | ? |
| Multi-subsidiary / Multi-currency | Depends on structure | ? |
| Demand Planning / Forecasting | Often Phase 2 | ? |
| eCommerce / SuiteCommerce | Rarely Phase 1 | ? |
| Payroll | Often kept in existing HR system | ? |
| HR / Benefits Administration | Often out-of-scope Phase 1 | ? |
| Custom Portals / Vendor Portals | Often Phase 2 | ? |
| Advanced Revenue Recognition (ASC 606) | Required if revenue is complex | ? |

### Out-of-Scope Clarifications Needed

- **Data Migration:** Which legacy systems are being migrated from? What is the historical data cutover date? (Open balances only vs. full history)
- **Integrations:** What third-party systems must connect to NetSuite on Day 1? (EDI, 3PL, MES, PLM, e-commerce platforms, banking, shipping carriers)
- **Customization depth:** Is this a configure-and-go implementation, or are custom SuiteScript workflows expected?
- **Training:** Is end-user training delivery in-scope for this engagement, or handled separately?
- **Reporting:** Standard NetSuite reports only, or SuiteAnalytics / custom dashboards in scope?

### Key Scope Decision — Phase Boundaries

One of the most important scope decisions for a manufacturing BRD is the **phasing model**:

- **Option A:** Big-bang — Financials + Inventory + Manufacturing go live together
- **Option B:** Wave 1 Financials & Inventory → Wave 2 Manufacturing & Advanced Planning
- **Option C:** Pilot one facility/product line first, then roll out

*Recommend confirming which option is intended before the Scope section is drafted.*

---

## Section 4: Stakeholder Map — Alignment Questions

### Information Needed Per Stakeholder

For each stakeholder, the BRD needs:
- Full name and title
- Department / Business Unit
- Role in this project (Sponsor, Decision Maker, Subject Matter Expert, End User, IT Owner, etc.)
- Approval authority (can they sign off on requirements? on go-live?)
- Availability for workshops (full-time, part-time, on-call)

### Typical Roles for a Mid-Size Manufacturing NetSuite Implementation

| Role | Typical Title | Status |
|---|---|---|
| Executive Sponsor | CFO or COO | Name needed |
| Project Owner / Business Lead | VP Finance or IT Director | Name needed |
| Finance SME | Controller or Accounting Manager | Name needed |
| Supply Chain / Inventory SME | Supply Chain Manager or Warehouse Manager | Name needed |
| Manufacturing / Production SME | Plant Manager or Production Supervisor | Name needed |
| Procurement SME | Purchasing Manager | Name needed |
| Sales / Order Management SME | Sales Operations Manager | Name needed |
| IT / Technical Owner | IT Manager or Systems Admin | Name needed |
| NetSuite Implementation Partner Lead | Partner Project Manager | Name needed |
| NetSuite Implementation Partner Architect | Solution Architect | Name needed |
| Change Management Lead | Internal or Consultant | Name needed |

### Questions to Resolve

1. Who has final sign-off authority on the BRD itself?
2. Is there a Steering Committee? If so, who are its members?
3. Are any key SMEs shared resources with limited availability? (This becomes a constraint.)
4. Is there a dedicated internal project manager, or is that role filled by the implementation partner?
5. Are any business units or subsidiaries intentionally excluded from this implementation? (Affects stakeholder coverage.)

---

## Section 5: Functional Requirements — Alignment Questions

### Priority Framework

Before listing requirements, agree on the priority scale to be used. Common options:

| Option | Scale | Description |
|---|---|---|
| MoSCoW | Must / Should / Could / Won't | Industry standard for BRDs |
| Numbered tiers | P1 / P2 / P3 | Simple and widely understood |
| Go-live criticality | Day 1 / Phase 2 / Future | Tied directly to go-live scope |
| Combined | Must-Have (Day 1) / Should-Have (Phase 2) / Nice-to-Have (Future) | Hybrid, most useful for manufacturing |

*Recommendation for manufacturing: Use the Combined hybrid approach. It ties priorities to the phasing decision made in Scope.*

### High-Stakes Functional Areas Requiring Early Priority Decisions

The following areas frequently generate scope conflict in manufacturing implementations. Confirm priority before drafting:

**Inventory & Warehouse**
- [ ] Lot/Serial number tracking required on Day 1?
- [ ] Multi-location bin management required?
- [ ] Landed cost tracking required?
- [ ] Cycle count workflows required?

**Manufacturing**
- [ ] Work Order management required on Day 1?
- [ ] Multi-level BOM support required?
- [ ] Shop floor data collection / labor tracking required?
- [ ] Outside processing / subcontracting required?
- [ ] Quality control / inspection workflows required?

**Procurement**
- [ ] Three-way match (PO / Receipt / Invoice) required on Day 1?
- [ ] Vendor approval workflows required?
- [ ] Contract / blanket PO management required?

**Finance**
- [ ] Project accounting required (if job-shop or project manufacturing)?
- [ ] Intercompany transactions required?
- [ ] Fixed asset depreciation automation required?

**Order Management / Sales**
- [ ] Customer-specific pricing / price levels required?
- [ ] Drop-ship order management required?
- [ ] RMA / return management required?

**Integrations (each integration is a functional requirement)**
- List all Day 1 integration touchpoints and assign them Must/Should/Could priority.

---

## Recommended Alignment Process

### Step 1: Distribute This Document (Day 0)
Share these questions with the project sponsor and key SMEs before the kickoff workshop.

### Step 2: Scope Workshop (Day 1–2)
Timebox: 2 hours. Output: agreed in-scope/out-of-scope list and phasing decision. Attendees: Executive Sponsor, Business Lead, IT Owner.

### Step 3: Stakeholder Identification (Day 1–2, parallel)
Project manager collects names/titles/roles for the stakeholder map. Can be done via email or shared spreadsheet.

### Step 4: Requirements Prioritization Workshop (Day 3–5)
Timebox: 4 hours across functional areas. Output: prioritized functional requirements list with Must/Should/Could designations. Attendees: All SMEs.

### Step 5: BRD Drafting Begins
With decisions resolved on the three flagged sections, the BRD can be drafted with real content rather than TBD placeholders.

---

## Decisions Log (to be completed)

| # | Decision | Owner | Target Date | Status |
|---|---|---|---|---|
| D-01 | Phasing model (big-bang vs. waves vs. pilot) | Executive Sponsor | | Open |
| D-02 | CRM in scope for Phase 1? | Executive Sponsor | | Open |
| D-03 | Payroll — stay in current system or migrate? | CFO | | Open |
| D-04 | Historical data migration depth (open balances vs. full history) | Controller | | Open |
| D-05 | Day 1 integration list confirmed | IT Owner + Business Lead | | Open |
| D-06 | Stakeholder map finalized (names and roles) | Project Manager | | Open |
| D-07 | Priority framework agreed (MoSCoW / P1-P3 / Combined) | Project Sponsor | | Open |
| D-08 | Lot/Serial tracking Day 1 requirement confirmed | Supply Chain SME | | Open |
| D-09 | Work Order management Day 1 requirement confirmed | Manufacturing SME | | Open |
| D-10 | BRD sign-off authority confirmed | Executive Sponsor | | Open |

---

## What Comes Next (Phase B)

Once the alignment questions above are answered, Phase B drafting can proceed section by section:

1. **Executive Summary** — Written last; summarizes what was decided in Phase A
2. **Business Drivers & Pain Points** — Typically sourced from discovery interviews; may already exist
3. **Scope** — Draft using confirmed in/out-of-scope list from D-01 through D-05
4. **Stakeholder Map** — Populate using D-06
5. **Functional Requirements** — Draft using priority framework from D-07 and workshop outputs
6. **Technical Requirements** — Covers NetSuite edition, integrations, data migration approach, security model
7. **Assumptions & Constraints** — Captures SME availability, budget, timeline, legacy system access
8. **Appendix** — Glossary, reference documents, decision log

---

*Phase A alignment complete. Pending responses to the Decisions Log before Phase B drafting begins.*
