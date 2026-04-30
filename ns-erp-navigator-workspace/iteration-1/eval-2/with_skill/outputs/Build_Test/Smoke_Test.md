# Smoke Test Checklist: Item Notification

| Step | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| 1 | Navigate to an Item record | Field "Warehouse Note" is visible. | [ ] |
| 2 | Enter text in "Warehouse Note" and Save | Record saves without error. | [ ] |
| 3 | Change the text in "Warehouse Note" and Save | Record saves and workflow triggers. | [ ] |
| 4 | Check email inbox of Warehouse Manager | Notification email is received with correct details. | [ ] |
| 5 | Update a different field (e.g., Description) | No notification email is sent (Condition check). | [ ] |
