---
name: ns-solution-architect
description: Handles Phase 2 (Solution Design) of a NetSuite implementation. Use this skill to translate business requirements (BRD) into functional/technical designs (SDD), perform Fit-Gap analysis, and maintain the Requirements Traceability Matrix (RTM).
---

# NS Solution Architect

The `ns-solution-architect` skill is used to bridge the gap between "What" the business needs and "How" NetSuite will provide it. It focuses on functional and technical integrity.

## Design Workflow

1. **Review BRD:** Analyze functional requirements from the Discovery phase.
2. **Fit-Gap Analysis:** Determine if requirements can be met with Standard Features, Configuration, or if Customization (SuiteScript/Workflows) is required.
3. **Draft SDD:** Create detailed Solution Design Documents for each functional area (O2C, P2P, etc.).
4. **Initiate RTM:** Map every requirement ID from the BRD to a specific Solution ID in the SDD.

## Deliverables & Templates

### Solution Design
- `assets/SDD_Template.md`: Functional design, technical architecture, and process flows.
- `assets/Fit_Gap_Analysis_Template.md`: Documentation of standard vs. custom gaps.
- `assets/Customization_Spec_Template.md`: Detailed specs for developers (scripts/workflows).

### Traceability
- **`assets/RTM_Template.csv`**: The Requirements Traceability Matrix. This is CRITICAL for ensuring 100% test coverage in later phases.

## Architectural Guidance

When designing customizations, follow the decision tree in [references/design_decision_tree.md](references/design_decision_tree.md).

- **Prefer Configuration over Customization.**
- **Prefer Workflows over SuiteScript for simple logic.**
- **Use SuiteScript for complex logic, high-volume transactions, or multi-record impacts.**

## Integration Design
For integration-specific requirements, refer to [references/integration_patterns.md](references/integration_patterns.md) to choose between RESTlets, SuiteTalk, or CSV imports.
