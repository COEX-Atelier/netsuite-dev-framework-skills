# Functional Specification: Item Custom Field & Notification

## 1. Overview
This specification outlines the addition of a custom field to the Item record and a corresponding workflow to notify the Warehouse Manager when this field is modified.

## 2. Business Requirement
- **Goal:** Ensure the Warehouse Manager is informed of changes to a critical item attribute (e.g., "Special Handling Instructions") to maintain operational efficiency.
- **Scope:** Item records (Inventory Items, Non-Inventory Items).

## 3. Custom Field Configuration (Item)
- **Label:** Special Handling Instructions
- **ID:** `_special_handling_notes`
- **Type:** Free-Form Text (or Long Text)
- **Store Value:** Yes
- **Applies To:** Inventory Item, Non-Inventory Item
- **Display:** Main Tab

## 4. Workflow Configuration (SuiteFlow)
- **Name:** Item Modification Notification
- **Record Type:** Item
- **Release Status:** Released (once tested)
- **Initiation:** Event Based
- **On Create:** No
- **On View or Update:** Update
- **Trigger Type:** After Record Submit

### State 1: Send Notification
- **Action:** Send Email
- **Trigger On:** After Record Submit
- **Condition:** "Special Handling Instructions" (Old Record) != "Special Handling Instructions" (New Record)
- **Sender:** Current User
- **Recipient:** Warehouse Manager (or a specific Role/Employee)
- **Subject:** ALERT: Item [Name] - Special Handling Updated
- **Body:** The special handling instructions for item [Name] have been updated. 
  - Old Value: {old.custitem_special_handling_notes}
  - New Value: {new.custitem_special_handling_notes}

## 5. Success Criteria
- Field is visible on the Item record.
- Changing the field and saving the record triggers an email to the Warehouse Manager.
- Saving the record without changing the field does NOT trigger an email.
