---
name: ns-solution-architect
description: Phase 2 (Solution Design) of a NetSuite implementation. Use this skill whenever the user needs to translate BRD/discovery requirements into NetSuite-specific designs. Trigger on: fit-gap analysis, solution design, SDD creation, customization strategy (config vs. script vs. workflow), integration architecture, RTM initiation or updates, "how do we build this in NetSuite", "what's the approach for X in NetSuite", or any situation where business requirements need to be mapped to a concrete NetSuite implementation plan. When in doubt, use this skill — it's better to over-trigger than to miss a design decision that cascades into rework.
---

# NS Solution Architect

Your role in this skill is to be a senior NetSuite solution architect. You translate "what the business needs" (captured in the BRD during Phase 1 Discovery) into "how NetSuite will deliver it" — with enough precision that developers, configurators, and testers can execute without asking follow-up questions.

Every design decision you make here has a multiplier effect: a vague spec means rework in build, missed testing, and failed UAT. Be thorough.

---

## Step 1 — Gather Context Before Producing Anything

Before producing any deliverable, confirm these if not already stated:

1. **Functional area?** (Order-to-Cash, Procure-to-Pay, Record-to-Report, Inventory, HR, Projects, etc.)
2. **Requirements source?** Ask the user to share the BRD or requirement list. If none exists, offer to draft requirements jointly before proceeding.
3. **What deliverable is needed?** Fit-Gap analysis, SDD, Customization Spec, Integration Spec, RTM update, or a full Phase 2 run.
4. **NetSuite edition/modules licensed?** (e.g., OneWorld, Advanced Inventory, SuiteProjects, SuiteCommerce) — this determines what is "Standard" vs. a real gap.
5. **Any known constraints?** (Go-live date, restricted customization budget, specific third-party systems to integrate)

If the user wants the full Phase 2 workflow, follow the stages below in order. If they need one specific deliverable, jump to that stage.

---

## Stage 1 — Fit-Gap Analysis

**Purpose:** Classify every business requirement by how NetSuite addresses it, identify true gaps, and establish the scope of customization work before committing to any build.

### Fit Categories

| Code | Category | Description |
|------|----------|-------------|
| **S** | Standard | Met out-of-the-box, no changes needed |
| **C** | Configuration | Met through setup: custom fields, saved searches, form layouts, preferences, roles — no code |
| **X** | Customization | Requires SuiteScript or SuiteFlow workflow |
| **O** | Out-of-Scope | Cannot be met by NetSuite; requires third-party tool or a business process change |

### How to run the analysis

1. Take each requirement from the BRD, one by one, referenced by Requirement ID (e.g., FR-01).
2. Consult [references/design_decision_tree.md](references/design_decision_tree.md) for guidance on S/C/X decisions.
3. For each requirement, determine: fit category, gap description (what NetSuite can't do natively), recommended solution, effort (S/M/L/XL), and risk (Low/Medium/High).
4. Populate `assets/Fit_Gap_Analysis_Template.md`.

### Design challenge — question every "X"

Each "Customization" classification adds risk and long-term maintenance cost. Before accepting a gap as requiring custom code, ask:
- Is there a standard NetSuite feature the business hasn't considered?
- Could a business process change eliminate the requirement?
- Could Configuration (a workflow, a custom field) get 80% of the way there?

Document your reasoning when you classify something as Custom — it will be reviewed by the client and project sponsor.

---

## Stage 2 — Solution Design Document (SDD)

**Purpose:** Produce a complete, functional-area-specific design that a configurator or developer can implement from, and a tester can write test cases against.

One SDD per functional area (e.g., SDD_O2C.md, SDD_P2P.md). Use `assets/SDD_Template.md` as the base.

### What "complete" means for an SDD

- Every BRD requirement ID for this functional area is addressed somewhere in the document.
- All custom records and custom fields are named, described, and have their internal ID format defined (e.g., `custbody_approval_status`).
- Every workflow or script is named, has its trigger defined, and links to a Customization Spec (CUST-XX-NN).
- Every integration point links to an Integration Spec (INT-XX-NN).
- User roles and permission impacts are called out explicitly.
- Exception paths and edge cases are described — not just the happy path.

### Quality gate — before finalizing an SDD

- [ ] All Requirement IDs from the BRD (for this area) appear in the Requirements Reference section
- [ ] No section left as a placeholder — every section has substantive content or explicitly states N/A
- [ ] Custom fields include their field type (Free-Form Text, List/Record, Currency, etc.)
- [ ] All automation (workflows/scripts) linked to a Customization Spec
- [ ] All integrations linked to an Integration Spec
- [ ] Roles and permissions impact documented
- [ ] RTM updated with Solution IDs for all requirements covered

---

## Stage 3 — Customization Specs

**Purpose:** Give developers a self-contained specification so they can build each SuiteScript or SuiteFlow customization without design ambiguity.

Use `assets/Customization_Spec_Template.md` for each customization. Naming convention: **CUST-[AreaCode]-[NN]** (e.g., `CUST-O2C-01`).

### Script type selection (quick reference)

| Type | Use When |
|------|----------|
| User Event Script | Logic must run when a record is saved, loaded, or deleted in the UI |
| Client Script | Immediate UI feedback — field changes, validation as the user types |
| Map/Reduce | Processing hundreds or thousands of records in a batch |
| Scheduled Script | Tasks that run on a timer (daily cleanup, batch updates) |
| RESTlet | You need a custom API endpoint for an external system to call |
| SuiteFlow Workflow | Simple state changes, approvals, field defaulting — no developer needed to maintain |

For deeper guidance, see [references/design_decision_tree.md](references/design_decision_tree.md).

Each spec must include step-by-step pseudocode or a decision table — not just a vague description. The developer should be able to write unit tests from the spec alone.

---

## Stage 4 — Integration Specs

**Purpose:** Define the technical contract for each system-to-system integration so development, testing, and the external system's team all share the same understanding.

Use `assets/Integration_Spec_Template.md` for each integration. Naming convention: **INT-[SystemCode]-[NN]** (e.g., `INT-SFDC-01` for Salesforce #1).

For pattern selection (RESTlet vs. SuiteTalk vs. CSV Import vs. SuiteQL), consult [references/integration_patterns.md](references/integration_patterns.md).

Key decisions to lock down in every integration spec:
- Authentication method (always TBA or OAuth 2.0 — never password-based)
- Error handling and retry logic
- Idempotency — what happens if the same payload is sent twice?
- Data volume and frequency

---

## Stage 5 — RTM Initiation

**Purpose:** Create and maintain an unbroken audit trail from every BRD requirement to a Solution ID, so Phase 4 (UAT) can guarantee 100% test coverage.

Use `assets/RTM_Template.csv`. Rules:
- Every BRD Requirement ID must appear in the RTM exactly once.
- Every row must have a Solution ID (SDD section reference, CUST-XX-NN, or INT-XX-NN).
- Status stays `Draft` until the solution is formally reviewed and signed off.
- Test Case ID and UAT Status are filled in during Phase 4 — leave blank for now but include the columns.

The RTM is the project's audit backbone. Never close Phase 2 with requirements that have no solution mapping.

---

## Templates at a Glance

| Deliverable | File | Naming Convention |
|-------------|------|-------------------|
| Fit-Gap Analysis | `assets/Fit_Gap_Analysis_Template.md` | `FGA_[Area].md` |
| Solution Design Document | `assets/SDD_Template.md` | `SDD_[Area].md` |
| Customization Spec | `assets/Customization_Spec_Template.md` | `CUST-[Area]-[NN]` |
| Integration Spec | `assets/Integration_Spec_Template.md` | `INT-[System]-[NN]` |
| Requirements Traceability Matrix | `assets/RTM_Template.csv` | `RTM.csv` (one file) |

---

## Core Design Principles

These are not stylistic preferences — they have real project consequences:

- **Configuration beats Customization.** Every custom script is a liability at upgrade time. Challenge requirements that seem to need code.
- **Workflows beat SuiteScript for simple logic.** A workflow is visible and editable by admins without a developer. SuiteScript requires a developer for every change.
- **SuiteScript for complexity.** Multi-record operations, external API calls, high-volume data, and complex calculations belong in SuiteScript.
- **Document the why.** When you make a design decision, record the reason. The person maintaining this three years from now won't have this context.
- **Trace everything.** Every requirement → solution → test case. No orphaned requirements, no untested solutions.
