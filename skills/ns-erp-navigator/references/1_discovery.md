# Phase 1: Discovery / Business Assessment

## Goal

Understand the business deeply enough to scope the project accurately, write requirements that reflect real business needs (not IT wishes), and produce a delivery plan that the sponsor will stand behind.

The single biggest risk in a NetSuite implementation is starting Phase 2 (Solution Design) with a BRD that doesn't reflect what the business actually needs. Discovery done well saves weeks of rework in every subsequent phase.

---

## Activity 1 — Stakeholder Interviews

### Who to Interview

Cover all roles that will own, use, or be affected by NetSuite. A missing stakeholder in Discovery means a surprise requirement in UAT.

| Role | Key Focus Areas |
|------|-----------------|
| Executive Sponsor / CFO | Strategic goals, success criteria, budget authority, go-live date constraints |
| Finance Manager / Controller | GL structure, chart of accounts, period close process, reporting requirements, consolidation |
| AP / AR Manager | Invoice processing, payment runs, collections, customer credit management |
| Sales Manager / VP Sales | Order process, quoting, commission, customer pricing tiers, CRM integration |
| Operations / Fulfillment Manager | Inventory, warehousing, picking/packing/shipping, returns |
| Purchasing / Procurement Manager | PO process, vendor management, receiving, 3-way match |
| IT Manager / Systems Admin | Current system landscape, integrations, data ownership, security requirements |
| HR / Payroll | Headcount, employee records, payroll system (if in scope) |
| End Users (select) | Day-to-day pain points, workarounds, training needs |

### Interview Techniques

**Before the session:**
- Send the agenda 48 hours in advance. Stakeholders who know the questions come with better answers.
- Review any existing process documentation (SOPs, org charts, current system screenshots) before meeting.
- Use `assets/Interview_Questionnaire.md` for role-specific questions.

**During the session:**
- Start with open-ended questions: *"Walk me through a typical [order / invoice / purchase] from start to finish."*
- Listen for workarounds — manual steps, Excel spreadsheets, offline processes. These are almost always requirements in disguise.
- When you hear a pain point, ask: *"How often does this happen? What does it cost you?"* — this sets priority.
- When you hear a "nice to have", ask: *"What would you do without it?"* — this separates scope from gold-plating.
- Avoid leading questions. Don't describe how NetSuite works until you fully understand how they work.

**After the session:**
- Send a summary email within 24 hours: "Here's what we heard. Please confirm or correct."
- Log all open questions with an owner and due date.
- Tag every pain point and requirement with the stakeholder who raised it — traceability matters.

### Red Flags to Watch For

- Stakeholder says "the system will figure it out" — means they haven't thought through the process.
- No clear process owner for a function — means political risk and delayed decisions.
- "We'll keep that in the old system for now" — means an integration or parallel run requirement.
- "We just want NetSuite to work like [current system]" — means they want to replicate bad processes. Challenge it.

---

## Activity 2 — Current State ("As-Is") Process Review

### Purpose

You cannot design the future state without understanding the current state. Current-state documentation surfaces integration dependencies, data quality issues, and hidden requirements that stakeholders forget to mention.

### What to Capture for Each Process

| Element | Questions to Answer |
|---------|---------------------|
| Process name and scope | Where does it start? Where does it end? Who owns it? |
| Steps and actors | What happens at each step? Who does it? How long does it take? |
| Systems involved | What software/tools are used at each step? |
| Data flows | What data enters the process? What data exits? Where is it stored? |
| Pain points | What breaks, takes too long, or causes errors? |
| Workarounds | What manual steps exist because the current system can't do it? |
| Volume and frequency | How many transactions per day/month? Peak periods? |
| Exceptions | What are the common exceptions and how are they handled? |

### Documentation Format

Describe each process as a numbered narrative at minimum. A swimlane diagram is preferred for complex, multi-actor processes (O2C, P2P). Don't overcomplicate — a clear Word document beats an unreadable Visio diagram.

### Common Traps

- **Scope creep starts here.** Every "As-Is" process review will surface improvement ideas. Log them but don't commit to them. Everything beyond the base requirement goes through a change request.
- **"That's how we've always done it" ≠ a requirement.** Question legacy steps that exist only because of limitations in the old system.
- **Excel is almost always hiding a requirement.** When you see a spreadsheet in daily use, ask what it does and why the system doesn't do it.

---

## Activity 3 — System Landscape Analysis

### Purpose

Identify every system that interacts with the in-scope business processes. Every system connection is either a data migration source, an integration requirement, or a decommission candidate.

### Landscape Map Template

For each system in the current environment, capture:

| System | Function | Data It Holds | Integration Direction | Fate (Replace / Integrate / Decommission) |
|--------|----------|---------------|----------------------|------------------------------------------|
| SAP B1 | ERP — Finance, Inventory | GL, Vendors, Items, Transactions | Source for migration | Replace |
| Salesforce | CRM | Customers, Opportunities, Contacts | Bi-directional with NetSuite | Integrate |
| ADP | Payroll | Employee records, payroll | Outbound from NetSuite | Stay — integrate |
| Legacy EDI tool | Vendor invoices | Vendor bills | Inbound to NetSuite | Replace |

### Integration Candidates

For every system marked "Integrate", capture:
- **Direction:** Inbound to NetSuite / Outbound from NetSuite / Bi-directional
- **Trigger:** Real-time event / Scheduled batch / Manual
- **Data entity:** What records cross the boundary (Customers, Orders, Invoices, etc.)
- **Complexity estimate:** Low (standard connector exists) / Medium / High (custom build required)

This feeds directly into the Phase 2 Integration Architecture design.

---

## Activity 4 — Scope Definition

### In-Scope / Out-of-Scope Framework

Scope definition is a negotiation, not a technical exercise. The goal is to protect the go-live date while delivering the highest-value functionality first.

**Framework for scope decisions:**
1. Is this required for the business to operate on Day 1 after go-live? → **In-Scope**
2. Is this important but the business can survive without it for 3–6 months? → **Phase 2 (future release)**
3. Is this a "nice to have" with no business impact if deferred? → **Backlog**
4. Is this something no one can agree on? → **Open Item — escalate to sponsor**

### Scope Statement Structure

```
IN-SCOPE (Phase 1 Go-Live):
  Modules: [e.g., Financials, O2C, P2P, Inventory]
  Subsidiaries: [e.g., US entity only; Canada in Phase 2]
  Integrations: [e.g., Salesforce CRM sync, ADP payroll export]
  Data Migration: [e.g., Open transactions, master data from SAP B1]
  Users: [e.g., 45 named users across Finance, Sales, Operations]

OUT-OF-SCOPE (Phase 1):
  [e.g., Manufacturing module, Canada subsidiary, HR self-service portal]

DEFERRED TO PHASE 2:
  [e.g., Advanced forecasting, multi-currency intercompany eliminations]
```

---

## Activity 5 — High-Level Solution Architecture

### Purpose

Produce a conceptual model of the NetSuite environment before Phase 2 solution design begins. This is not a detailed technical spec — it's a shared mental model that aligns the project team and the client on what they're building.

### What to Define

| Element | Questions to Answer |
|---------|---------------------|
| NetSuite edition | OneWorld (multi-entity)? Single account? |
| Modules to activate | Which NetSuite modules are in scope? |
| Subsidiary / legal entity structure | How many entities? Which currencies? |
| Chart of Accounts | High-level segment structure (Account, Department, Class, Location) |
| Integration architecture | Which systems connect? What pattern (RESTlet, SuiteTalk, CSV)? |
| User access model | How many users? Key roles? Subsidiary restrictions? |
| Data migration scope | What migrates? From where? Master data only or open transactions too? |

### Deliverable

A one-page "Solution Architecture Overview" diagram or table. This is the reference that Phase 2 designers use to ensure their individual SDD designs are coherent with each other.

---

## Phase 1 Deliverables

| Deliverable | Template | Owner | Quality Criterion |
|-------------|----------|-------|-------------------|
| Business Requirements Document | `assets/BRD_Template.md` | Business Analyst / Lead Consultant | All requirements have IDs, priorities, and are written as business needs (not technical specs) |
| Project Charter | `assets/Project_Charter_Template.md` | Project Manager | Go-live date, budget, and success criteria are sponsor-approved |
| Implementation Roadmap | `assets/Implementation_Roadmap.md` | Project Manager | Phase dates account for peak-season blackouts and resource availability |
| Stakeholder Interview Notes | (per session) | Business Analyst | All stakeholders covered; open questions have owners and due dates |
| Current-State Process Maps | (per process) | Business Analyst | All in-scope processes documented; volume/frequency captured |
| System Landscape Map | (inline in BRD §5) | IT Lead | All systems mapped; integration requirements identified |
| Scope Statement | (in BRD §6 and Charter) | Project Manager + Sponsor | Formally signed off by sponsor |

---

## Scoping Heuristics

Use these rules of thumb when making scope and priority decisions:

- **If it touches the General Ledger, it's High priority.** Financial integrity is non-negotiable.
- **If it affects a customer or vendor interaction, it's High or Medium.** Operational disruption is costly.
- **If it's a reporting requirement and a saved search can approximate it, it's Medium or Low.**
- **If it requires a custom script, question whether it's really needed for Day 1.**
- **If two stakeholders disagree on a requirement, it's an open item for the sponsor — not a design decision.**
- **If the go-live date is fixed, scope must flex.** Never compress testing to hit a date.
- **Avoid go-live in December (year-end close), Q1 tax season, or immediately after a major product launch.**
