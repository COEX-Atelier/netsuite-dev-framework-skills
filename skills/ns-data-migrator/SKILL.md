---
name: ns-data-migrator
description: Handles Phase 4 (Fix Legacy Data) of a NetSuite implementation. Use this skill to cleanse legacy records, map fields to NetSuite schemas, and execute sequenced CSV imports.
---

# NS Data Migrator

The `ns-data-migrator` skill ensures that legacy data is "clean" and imported in the correct order to maintain record relationships (e.g., Customers must exist before their Invoices can be imported).

## Data Migration Workflow

1. **Extraction:** Pull data from legacy systems.
2. **Cleansing:** Remove duplicates, fix formatting (dates, phone numbers), and handle inactive records.
3. **Mapping:** Use the `Data Mapping Dictionary` to link legacy fields to NetSuite Internal IDs.
4. **Sequencing:** Follow the import order defined in [references/data_dependency_sequence.md](references/data_dependency_sequence.md).
5. **Validation:** Perform a "Test Load" of 10-20 records before the full migration.

## Deliverables & Templates

### Mapping & Planning
- `assets/Data_Mapping_Dictionary.md`: Document field-level mapping and transformation logic.
- `assets/Data_Validation_Report.md`: Record the results of test loads and final migrations.

### Automated Cleansing
- **`scripts/deduplicate_csv.py`**: A utility to identify and remove duplicate records based on a unique key (e.g., Email or External ID).

## Import Best Practices

Refer to [references/csv_import_limits.md](references/csv_import_limits.md) for NetSuite-specific constraints.

- **Use External IDs:** Always include a unique `External ID` from the legacy system for every record. This allows for easy updates and relationship linking.
- **Date Formats:** Ensure dates match the company preference in NetSuite (e.g., MM/DD/YYYY).
- **Mandatory Fields:** Check for missing required fields (e.g., Subsidiary, Currency) before uploading.
