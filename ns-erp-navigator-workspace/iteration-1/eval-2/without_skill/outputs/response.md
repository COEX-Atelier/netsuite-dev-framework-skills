# NetSuite Implementation Plan: Item Field & Warehouse Notification

This plan outlines the steps to add a custom field to the Item record and configure a workflow for automated notifications in a new NetSuite environment.

## 1. Custom Item Field Creation
**Objective:** Add a field to the Item record to track specific warehouse-related information.

1.  **Navigation:** Go to **Customization > Lists, Records, & Fields > Item Fields > New**.
2.  **Configuration:**
    *   **Label:** `Warehouse Notes`
    *   **ID:** `_custitem_warehouse_notes`
    *   **Type:** `Free-Form Text` (allows up to 300 characters).
    *   **Store Value:** `Yes` (checked).
3.  **Applies To:**
    *   Select the **Applies To** tab.
    *   Check **Inventory Item**, **Non-Inventory Item**, and **Service**.
4.  **Display:**
    *   Select the **Display** tab.
    *   **Subtab:** `Main`.
5.  **Save:** Click **Save**.

## 2. Notification Workflow Configuration
**Objective:** Automatically notify the Warehouse Manager via email when an item record is updated.

1.  **Navigation:** Go to **Customization > Workflow > Workflows > New**.
2.  **Workflow Setup:**
    *   **Name:** `Item Change Notification`
    *   **ID:** `customworkflow_item_change_notify`
    *   **Record Type:** `Item`
    *   **Subtypes:** `Inventory Item`
    *   **Release Status:** `Testing` (move to `Released` after verification).
    *   **Initiation:** `Event Based`.
    *   **Event Types:** `Edit`.
    *   **Trigger Type:** `After Record Submit`.
3.  **State 1: Send Email Action:**
    *   Double-click the default **State 1**.
    *   Click **New Action** and select **Send Email**.
    *   **Trigger On:** `After Record Submit`.
    *   **Parameters:**
        *   **Sender:** `Current User`.
        *   **Recipient:** Select the **Specific Employee** (Warehouse Manager) or use a Join to pull from a custom field.
        *   **Subject:** `Notification: Item {name} has been modified`.
        *   **Body:** `Hello, the item {name} has been updated by {user}. Please review the changes in NetSuite.`
4.  **Save:** Click **Save** on the action and then **Save** on the workflow.

## 3. Verification Steps
1.  Navigate to an existing Inventory Item.
2.  Edit the `Warehouse Notes` field.
3.  Click **Save**.
4.  Verify that the Warehouse Manager receives the email notification.
5.  Check the **Workflow History** tab on the Item record to ensure the workflow executed successfully.

---
**total_tokens:** 842
**duration_ms:** 1540
