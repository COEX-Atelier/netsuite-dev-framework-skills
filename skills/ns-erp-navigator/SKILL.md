---
name: ns-erp-navigator
description: Orchestrates the 7-phase NetSuite ERP Implementation Framework. Use this skill to guide the project from Discovery to Go-Live, manage high-level deliverables (BRD, Roadmap, Charter), and coordinate phase transitions.
---

# NS ERP Navigator

The `ns-erp-navigator` is the central hub for NetSuite implementation projects. It ensures that the project follows a structured methodology and that all critical deliverables are completed before advancing to the next phase.

## 7-Phase Implementation Framework

This skill manages the overarching project lifecycle. For technical or phase-specific heavy lifting, it coordinates with specialized spoke skills.

| Phase | Goal | Key Deliverables |
| :--- | :--- | :--- |
| **1. Discovery** | Business Assessment & Scoping | BRD, Roadmap, Charter |
| **2. Solution Design** | Functional & Technical Design | SDD, Fit-Gap, RTM |
| **3. Build** | Configuration & Customization | Configuration Workbook, Scripts |
| **4. Data Fix** | Legacy Data Cleansing | Cleansed CSVs, Data Maps |
| **5. Testing** | Validation & UAT | Test Plan, Defect Log |
| **6. Change Mgt** | Training & Adoption | Training Matrix, SOPs |
| **7. Go-Live** | Cutover & Support | Cutover Checklist, Hypercare |

## Progressive Disclosure

For detailed instructions on specific phases, refer to the following reference files:

- **Phase 1: Discovery** -> See [references/1_discovery.md](references/1_discovery.md)
- **Phase 7: Go-Live** -> See [references/7_golive.md](references/7_golive.md)

## Core Deliverables & Templates

Use these templates from the `assets/` folder to generate project documentation:

### Project Initiation
- `assets/Project_Charter_Template.md`: Defines project goals, stakeholders, and constraints.
- `assets/Implementation_Roadmap.md`: High-level timeline and milestones.

### Discovery & Requirements
- `assets/BRD_Template.md`: Detailed Business Requirements Document.
- `assets/Interview_Questionnaire.md`: Structured questions for discovery sessions.

### Cutover
- `assets/Cutover_Checklist.csv`: Step-by-step sequence for production launch.

## Phase Transition Rules

Before moving from one phase to another, verify that:
1. All "Key Deliverables" for the current phase are signed off.
2. The `ns-test-manager` (for Testing phase) or `ns-data-migrator` (for Data phase) has validated readiness.
3. Risks identified in the current phase are documented and mitigated.
