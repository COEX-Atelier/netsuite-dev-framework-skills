# Deployment Checklist

## Pre-Deployment
- [ ] Review Functional Spec and Smoke Test results in Sandbox.
- [ ] Confirm the Warehouse Manager's email address/employee record exists in Production.

## Implementation Steps (Production)
- [ ] Create Custom Item Field: `custitem_special_handling_notes`.
- [ ] Create SuiteFlow Workflow: "Item Modification Notification".
- [ ] Set Workflow Release Status to "Released".

## Post-Deployment
- [ ] Run Smoke Tests 1, 2, and 3 in Production.
- [ ] Notify Warehouse Manager of the new notification process.
