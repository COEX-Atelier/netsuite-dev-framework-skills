---
name: ns-suitescript-dev
description: Technical skill for SuiteScript 2.1 development and NetSuite configuration. Use this skill to write robust, governance-aware scripts, automate workflows, and document technical implementations.
---

# NS SuiteScript Developer

The `ns-suitescript-dev` skill is used by developers to implement the designs provided by the Architect. It focuses on code quality, performance, and NetSuite best practices.

## Development Workflow

1. **Review Spec:** Understand the Customization Spec from the Architect.
2. **Environment Prep:** Ensure the script file is in the `SuiteScripts/` folder in the File Cabinet.
3. **Coding:** Use SuiteScript 2.1 (ES6 syntax).
4. **Governance Management:** Explicitly handle governance limits for large datasets.
5. **Documentation:** Write technical docs for every script created.

## Coding Standards

Refer to [references/suitescript_2_1_standards.md](references/suitescript_2_1_standards.md) for full details.

- **Modular Design:** Use Entry Point scripts and Custom Modules.
- **Error Handling:** Always use `try-catch` blocks for transactional logic.
- **Audit Logs:** Use `log.debug` and `log.error` strategically.
- **No Hardcoding:** Use Script Parameters for IDs or toggleable logic.

## Tools & Scripts

### JSDoc Header Validator
- **`scripts/validate_script_headers.js`**: Runs a check on a SuiteScript file to ensure it has the correct `@NApiVersion`, `@NScriptType`, and `@NModuleScope` tags.

## Deliverables

- **SuiteScripts (.js files)**
- `assets/Technical_Documentation_Template.md`: Documentation for the script's logic, parameters, and deployment.
- `assets/Configuration_Workbook.csv`: Track custom fields, records, and forms created in the UI.
