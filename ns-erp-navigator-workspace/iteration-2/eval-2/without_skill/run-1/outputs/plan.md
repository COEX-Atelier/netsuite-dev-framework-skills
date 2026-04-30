# NetSuite Implementation Plan: Custom Item Field & Workflow Notification

This plan outlines the steps to add a custom field to the Item record and configure a workflow to notify the Warehouse Manager when that field is updated in a new NetSuite account.

## 1. Custom Item Field Creation
To capture the specific information required, we will first create a custom field.

### Configuration Details:
- **Label**: Warehouse Priority / Status (or as desired)
- **ID**: `_custitem_wh_notification_trigger`
- **Type**: List/Record (Recommended for standardized values) or Free-Form Text.
- **Record Type**: Item
- **Store Value**: Yes

### Implementation Steps:
1. Navigate to **Customization > Lists, Records, & Fields > Item Fields > New**.
2. Enter the **Label** and **ID**.
3. Select the **Type** (e.g., List/Record if using a custom list of statuses).
4. On the **Applies To** tab, check the boxes for the relevant item types (e.g., Inventory Item, Non-inventory Item).
5. On the **Display** tab, select the subtab where the field should appear (e.g., Main or Inventory).
6. Click **Save**.

---

## 2. Notification Workflow
We will use the NetSuite SuiteFlow (Workflow) engine to handle the notification logic.

### Workflow Setup:
- **Name**: Item Field Change Notification
- **ID**: `_custom_wh_notification_wf`
- **Record Type**: Item
- **Release Status**: Testing (Move to 'Released' after verification)
- **Initiation**: Event Based
- **On Create**: No (Optional, depending on if you want alerts for new items)
- **On Update**: Yes
- **Trigger Type**: After Record Submit

### Workflow State & Action:
1. **State 1: Check for Change**
   - This state will execute the notification if the condition is met.
2. **Action: Send Email**
   - **Trigger On**: After Record Submit
   - **Condition**: Use the 'Compare Field' tool: `Custom Field (Old Value) != Custom Field (New Value)`.
   - **Recipient**: 
     - Select 'Specific Employee' and choose the Warehouse Manager, or
     - Select 'Role' -> 'Warehouse Manager' (if the manager is the only one in that role).
   - **Subject**: Item Change Notification: {itemid}
   - **Content**: "The warehouse status field for item {itemid} has been changed from {old_value} to {new_value}."

---

## 3. Testing & Validation
Since this is a brand new account:
1. **Create a Test Item**: Ensure you have at least one inventory item.
2. **Assign Warehouse Manager**: Ensure an employee record is created with the Warehouse Manager role or is designated as the recipient.
3. **Trigger Workflow**: Edit the item, change the custom field, and save.
4. **Audit Trail**: Check **Customization > Scripting > Workflow History** to verify the workflow executed successfully.
5. **Email Check**: Confirm the email was received by the designated recipient.
