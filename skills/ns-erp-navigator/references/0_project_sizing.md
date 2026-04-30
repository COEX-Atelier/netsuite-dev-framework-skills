# NetSuite Project Sizing & Typology Framework

Before initiating any project phase or deliverable, you MUST classify the project based on its **Origin** and **Scale**. This classification determines the governance level, required documentation, and workspace organization.

---

## Step 0 — Classification

Gather context from the user to answer these two questions:

### 1. What is the Project Origin?
- **Greenfield:** No legacy ERP or historical data. Starting fresh in NetSuite.
  - *Impact:* Skip legacy system mapping, decommissioning plans, and historical data migration strategy.
- **Brownfield:** Replacing an existing system (e.g., SAP, QuickBooks, Xero) or refactoring an existing NetSuite environment.
  - *Impact:* Requires "As-Is" process mapping, system landscape analysis, and data migration/cleansing strategy.

### 2. What is the Project Scale (Tier)?

| Tier | Description | Key Deliverables Required |
| :--- | :--- | :--- |
| **Tier 1: Full Implementation** | Full system migration OR a complex, end-to-end business workflow overhaul (e.g., Project-to-Cash, Multi-subsidiary rollout). | Full BRD, Project Charter, Detailed Roadmap, Cutover Runbook, War Room. |
| **Tier 2: Module / Refactoring** | Adding a new module (e.g., ARM, Fixed Assets) or refactoring a significant but isolated workflow. | Focused BRD (subset of template), Updated Roadmap, Standard Deployment Checklist. |
| **Tier 3: Tiny Enhancement** | Isolated feature, script update, or small process tweak (e.g., adding a custom field + workflow). | Simplified Functional Spec (1-page), Smoke Test Checklist. Merges Discovery/Design. |

---

## Step 1 — User Confirmation

Once you have gathered enough context, formulate a recommendation and present it to the user.

**Example Prompt:**
> "Based on our discussion, I recommend classifying this as a **Tier 2 Brownfield** project because we are refactoring the Accounts Payable process while replacing the legacy Bill.com integration. This means we will use a focused BRD and a standard deployment checklist. Do you agree with this classification, or should we adjust the governance level?"

**YOU MUST obtain explicit user confirmation before proceeding to Step 2.**

---

## Step 2 — Workspace Initialization

After confirmation, scaffold the project folder structure at the root of the workspace:

### Folder Structure (Tier 1 & 2)
```text
01_Discovery/       # BRD, Interview Notes, System Landscape
02_Design/          # SDD, Customization Specs, Fit-Gap
03_Build/           # Scripts, Workflows, Configuration Logs
04_Data/            # Mapping docs, Cleansing rules
05_Testing/         # Test Plans, UAT scripts, Defect Log
06_Training/        # User guides, Training schedule
07_GoLive/          # Cutover Runbook, Hypercare log
```

### Folder Structure (Tier 3)
```text
Discovery_Design/   # Simplified Spec
Build_Test/         # Implementation & Smoke Test
Deployment/         # Deployment Checklist
```

---

## Step 3 — Agent Coordination Artifact (PLAN.md)

Create a `PLAN.md` file at the root of the project. This is a **live document** for agents to coordinate.

### PLAN.md Schema
```markdown
# Project Plan: [Project Name]

## 1. Governance
- **Tier:** [1 | 2 | 3]
- **Origin:** [Greenfield | Brownfield]
- **Current Phase:** [e.g., Phase 1 - Discovery]

## 2. Strategic Decisions
- [Decision Date]: [Description of architectural or scoping choice]

## 3. Reference Artifacts (Official Deliverables)
- [BRD]: [Relative Link to 01_Discovery/BRD.md]
- [Charter]: [Relative Link to 01_Discovery/Charter.md]
- [Roadmap]: [Relative Link to 01_Discovery/Roadmap.md]

## 4. Next Steps
- [ ] [Next Activity]
```

**Rule:** Every time a phase gate is passed or a major decision is made, update `PLAN.md`.
