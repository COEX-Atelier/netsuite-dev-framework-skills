---
name: ns-test-manager
description: Handles Phase 5 (Testing) of a NetSuite implementation. Use this skill to coordinate System Integration Testing (SIT), User Acceptance Testing (UAT), and defect triaging while ensuring RTM coverage.
---

# NS Test Manager

The `ns-test-manager` skill ensures the solution is bug-free and meets the original business requirements. It acts as the gatekeeper for Go-Live.

## Testing Workflow

1. **Test Planning:** Define the scope of SIT and UAT. Use `assets/Test_Plan_Template.md`.
2. **SIT (System Integration Testing):** Technical validation of end-to-end flows, integrations, and scripts.
3. **UAT (User Acceptance Testing):** Functional validation by business users using real-world scenarios. Use `assets/UAT_Script_Template.md`.
4. **Defect Triage:** Document, prioritize, and resolve issues. Use `assets/Defect_Log_Template.csv`.
5. **RTM Validation:** Update the RTM to confirm every requirement has a passing test case.

## Deliverables & Templates

### Planning & Execution
- `assets/Test_Plan_Template.md`: Strategy, environment, and resources for testing.
- `assets/UAT_Script_Template.md`: Step-by-step instructions for end-users to follow during UAT.
- `assets/Test_Summary_Report.md`: Final report summarizing pass/fail rates and known issues.

### Defect Tracking
- **`assets/Defect_Log_Template.csv`**: Centralized log for tracking bugs and their resolution status.

## QA Protocols

Refer to [references/sit_vs_uat_protocols.md](references/sit_vs_uat_protocols.md) to understand the differences in focus between the two phases.

- **Defect Priority:** Use the triage workflow in [references/defect_triage_workflow.md](references/defect_triage_workflow.md) (Critical, High, Medium, Low).
- **Regression Testing:** Ensure that fixing one bug didn't break existing functionality.
- **Data Integrity:** Verify that GL impacts and financial reports match expected results.
