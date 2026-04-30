# Smoke Test Checklist: Item Field & Workflow

## 1. Custom Field Verification
- [ ] Log in as Administrator.
- [ ] Navigate to an existing Inventory Item (or create a new one).
- [ ] Verify "Special Handling Instructions" field is visible on the Main tab.
- [ ] Enter a value and save. Verify the value persists.

## 2. Workflow Trigger Test (Positive)
- [ ] Identify an item with a value in "Special Handling Instructions".
- [ ] Change the value and click Save.
- [ ] Check the "Communication" tab -> "Messages" of the Item record.
- [ ] Verify an email was sent to the Warehouse Manager with the correct Old/New values.

## 3. Workflow Trigger Test (Negative)
- [ ] Open an item record.
- [ ] Change a DIFFERENT field (e.g., Description) but leave "Special Handling Instructions" unchanged.
- [ ] Click Save.
- [ ] Verify NO email was sent.

## 4. Permission Check
- [ ] Log in with a standard role (e.g., Inventory Manager).
- [ ] Verify they can see and edit the field (if applicable per security requirements).
