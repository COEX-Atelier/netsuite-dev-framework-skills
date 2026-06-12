# Customization Decision Tree

When a requirement cannot be met by standard NetSuite features, use this logic to choose the implementation method:

## 1. Can it be done via UI Configuration?
- (e.g., Custom Fields, Custom Segments, Form layouts, Lists)
- **Action:** Use Configuration. This is the most upgrade-safe.

## 2. Is it simple logic involving UI behavior or basic record updates?
- (e.g., Defaulting a field, showing/hiding a field, simple approval button)
- **Action:** Use **SuiteFlow (Workflows)**. Easier to maintain by non-developers.

## 3. Does it require complex logic, multi-record loops, or heavy calculations?
- (e.g., Complex commission calculation, auto-creating child records, external API calls)
- **Action:** Use **SuiteScript (2.1)**.

## 4. When to use specific SuiteScript types?
- **User Event:** Logic triggered when a record is viewed, created, or edited in the UI.
- **Client Script:** Immediate UI feedback (e.g., field changed) while the user is typing.
- **Map/Reduce:** Processing thousands of records in bulk.
- **Scheduled Script:** Task that runs at a specific time (e.g., daily cleanup).
- **RESTlet:** Exposing a custom API endpoint for external systems.
