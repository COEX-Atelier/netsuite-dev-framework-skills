---
name: ns-change-orchestrator
description: Handles Phase 6 (Training & Change Management) of a NetSuite implementation. Use this skill to develop training strategies, role-based guides, and coordinate communications while leveraging existing CM skills.
---

# NS Change Orchestrator

The `ns-change-orchestrator` skill bridges the technical implementation with organizational adoption. It ensures that users are prepared for the transition to NetSuite.

## Change Management Workflow

1. **Impact Analysis:** Identify which roles and processes are changing.
2. **Communication Planning:** Draft announcements and status updates. Use the `change-communication` skill.
3. **SOP Development:** Create step-by-step procedures for NetSuite tasks. Use the `sop-writer` skill.
4. **Training Execution:** Develop materials and deliver training sessions based on the `assets/Training_Matrix.csv`.
5. **Adoption Tracking:** Monitor system usage post-go-live to identify users needing extra support.

## Dispatcher Patterns

This skill acts as a coordinator for other specialized skills in your workspace:

- **For Communication:** Invoke `change-communication`.
- **For SOPs:** Invoke `sop-writer`.
- **For Stakeholder Mapping:** Invoke `stakeholder-mapping`.
- **For Impact Analysis:** Invoke `change-impact-analysis`.

## Deliverables & Templates

- `assets/Training_Matrix.csv`: Track who needs training on which functional areas.
- `assets/Role_Based_User_Guide.md`: Simplified, "day-in-the-life" guides for specific NetSuite roles.

## Training Best Practices

Refer to [references/training_strategy.md](references/training_strategy.md) for choosing between methods.

- **Use Sandbox/Release Preview:** Never train in the Production account.
- **Process Over Buttons:** Teach the *business process* within NetSuite, not just where to click.
- **Role-Specific:** Salespeople don't need to know how to reconcile bank statements. Keep training relevant.
