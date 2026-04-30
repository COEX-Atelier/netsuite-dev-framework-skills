# Functional Specification: Item Notification

## 1. Requirement Overview
Add a custom field to the Item record and notify the Warehouse Manager whenever this field is updated.

## 2. Custom Field Definition
- **Label:** Warehouse Note
- **ID:** `_custitem_warehouse_note`
- **Type:** Free-Form Text (or Long Text)
- **Applies To:** Inventory Items, Non-Inventory Items
- **Display:** Main Tab

## 3. Workflow Logic (SuiteFlow)
- **Name:** Item Change Notification (Warehouse)
- **Record Type:** Item
- **Release Status:** Testing (then Released)
- **Trigger:** On View or Update (After Record Submit)
- **Condition:** `Warehouse Note` is changed
- **Action:** Send Email
    - **Sender:** Current User
    - **Recipient:** Warehouse Manager (Static email or Role-based)
    - **Subject:** Item Updated: {itemid}
    - **Body:** The warehouse note for item {itemid} has been updated to: {custitem_warehouse_note}

## 4. Success Criteria
- Field is visible and editable on Item records.
- Email is received by the Warehouse Manager within minutes of the field being changed.
