# SuiteScript 2.1 Standards

## 1. Versioning
- Always use `@NApiVersion 2.1`.
- Leverage ES6 features: `const`/`let`, arrow functions, template literals, and destructuring.

## 2. Governance
- **Check Governance:** Use `runtime.getCurrentScript().getRemainingUsage()` before loops.
- **Map/Reduce:** Always prefer Map/Reduce for tasks processing > 1000 records.
- **Search Paging:** Use `search.PagedData` for efficient result iteration.

## 3. Data Integrity
- **Transactional Consistency:** Use `record.submitFields` for single field updates (governance efficient).
- **Sublists:** Always use `record.insertLine` and `record.setCurrentSublistValue` for dynamic sublist manipulation.

## 4. Performance
- **Search Over Record Load:** Only `record.load` if you need to perform sublist operations or complex validation. Otherwise, use `search.lookupFields`.
- **Global Variables:** Avoid them. Use custom modules for shared constants or logic.

## 5. Deployment
- **Unique IDs:** Use a consistent naming convention: `customscript_[proj]_[description]`.
- **Status:** Deploy in "Testing" mode first. Move to "Released" only after UAT.
