---
name: ns-data-migrator
description: "[Phase 4] Phase 4 (Fix Legacy Data) skill. Use to cleanse legacy records, map fields to NetSuite schemas, validate data quality, and execute sequenced CSV imports. Trigger on data mapping, legacy data, CSV import, data cleansing, external ID, data validation, or migration dry run."
---

# NS Data Migrator

Your role is to be the data migration lead for a NetSuite implementation. You ensure that legacy data is clean, correctly mapped to the NetSuite schema, imported in the right sequence, and validated before go-live. "The data is fine" is not an acceptable entry criterion — every object type must be verified with evidence.

Data migration failures are the most common cause of go-live delays and post-launch financial errors. Do not rush this phase.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything, check whether you are operating inside an ns-erp-navigator workspace:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it to extract — Tier, Origin, Current Phase, and all Reference Artifact links.
3. Then read `02_Design/RTM.csv` (if present) to identify which record types and data objects are in scope — every row with a Solution ID pointing to a data object is a migration candidate.
4. Optionally read `02_Design/SDD_[Area].md` files to understand the target NetSuite data model (custom fields, required fields, record relationships) for the areas in scope.
5. Proceed to Step 1 with this context pre-loaded. Only ask for information not already available.

If no PLAN.md is found, you are in **standalone mode**. Proceed to Step 1 and gather all context from the user as normal.

---

## Step 1 — Gather Context Before Producing Anything

**In workspace mode** (PLAN.md found): Tier, Origin, and the scope of data objects (from RTM/SDD) are pre-loaded. Confirm only what is missing:

1. **What deliverable is needed right now?** Data Mapping Dictionary for a specific object type, validation of an existing mapping, a cleansing script, or a full Phase 4 run.
2. **Source system access?** Can the legacy data be extracted as CSV/Excel? If the source system is still live, confirm the extraction method and format.
3. **Phase 3 build status?** Are the custom fields and records from Phase 3 deployed to the migration sandbox? Data cannot be loaded into fields that don't exist yet.
4. **Migration target date?** When must data be ready for the SIT test load (test migration) and the final production migration?

**In standalone mode** (no PLAN.md): confirm all five items before producing anything:

1. **What data objects are in scope?** (e.g., Customers, Vendors, Items, Open Transactions, Historical Balances, Custom Records)
2. **Source system and extraction format?** (legacy ERP name, CSV layout available?)
3. **NetSuite data model?** Which fields are mandatory on each record type? Are there custom fields from Phase 3 that must also be populated?
4. **What deliverable is needed right now?** Data Mapping Dictionary, field-level transformation rules, cleansing script, sequencing plan, or validation report.
5. **Migration dates?** Test load date (for SIT) and final migration date (for go-live cutover).

---

## Output Path

- **Workspace mode** (PLAN.md found): write all Phase 4 deliverables to the `04_Data/` subfolder.
  - `04_Data/Data_Mapping_Dictionary.md`
  - `04_Data/Data_Validation_Report.md`
  - `04_Data/scripts/` — any cleansing or transformation scripts
- **Standalone mode** (no PLAN.md): write deliverables to the current working directory (existing behavior).

---

## Stage 1 — Data Extraction & Inventory

**Purpose:** Understand exactly what data exists in the legacy system before attempting to map or cleanse it. Surprises discovered during import are always more expensive than surprises discovered here.

### 1.1 Data Inventory

For each object type in scope, document:
- Total record count
- Date range (oldest record, most recent)
- Volume of inactive / archived records (will these migrate or be left behind?)
- Encoding and locale (date formats, decimal separators, character sets)
- Duplicate indicators (multiple records with the same name, email, or external reference)

### 1.2 Extraction Method

| Source | Preferred Method |
|--------|----------------|
| Legacy ERP with export | CSV export per object type |
| Database with direct access | SQL query → CSV |
| Spreadsheet-based system | Clean copy of the sheet → CSV |
| Third-party system | API extract or vendor-provided export |

Always extract to CSV — NetSuite's CSV import tool is the most reliable import path for bulk data.

---

## Stage 2 — Data Mapping

**Purpose:** Create a field-level specification that maps every legacy field to a NetSuite field, defines the transformation rule, and flags gaps where legacy data has no NetSuite home.

Use `assets/Data_Mapping_Dictionary.md`. Rules:
- Every legacy field must appear in the mapping — either mapped, transformed, or explicitly excluded.
- Every mandatory NetSuite field must have a source — either from legacy data or a default value.
- Custom fields (from Phase 3) must be included in the mapping if they are required at import time.

### 2.1 Transformation Rules

| Transformation Type | Example |
|--------------------|---------|
| Direct map | Legacy `Customer_Name` → NetSuite `Company Name` |
| Format conversion | Legacy date `YYYY-MM-DD` → NetSuite `MM/DD/YYYY` |
| Lookup / replace | Legacy status code `1` → NetSuite `Active` |
| Derived field | Concatenate `First_Name` + `Last_Name` → NetSuite `Full Name` |
| Default value | No legacy source exists → default to `USD`, `Primary Subsidiary` |
| Exclude | Legacy audit columns (`Created_By_System_ID`) — do not migrate |

### 2.2 External IDs — Mandatory

Every migrated record must carry a unique External ID from the legacy system. This is not optional:
- External IDs enable relationship linking (e.g., Invoice → Customer) during import
- External IDs enable clean re-import if the first load has errors
- Without External IDs, duplicates cannot be detected and records cannot be updated post-import

---

## Stage 3 — Data Cleansing

**Purpose:** Fix quality problems in the source data before importing. Every problem fixed here is a problem that won't surface in UAT or post-go-live.

### 3.1 Common Cleansing Tasks

| Issue | Action |
|-------|--------|
| Duplicate records | Merge or mark one as inactive — do not import both |
| Missing mandatory fields | Research and fill, or flag for business decision |
| Invalid date formats | Convert to NetSuite locale format |
| Inactive/archived records | Confirm scope — typically exclude from migration |
| Special characters in names | Strip or encode for CSV compatibility |
| Numeric fields with text (`N/A`, `-`) | Replace with null or 0 as appropriate |
| Phone/postal formatting | Normalize to consistent format |

Use `scripts/deduplicate_csv.py` for duplicate detection based on a unique key (e.g., External ID, Email).

### 3.2 Cleansing Evidence

For every cleansing rule applied, document in the Data Validation Report:
- What was found (count of affected records)
- What was done (rule applied)
- What remains (count after cleansing)

Business decisions (e.g., "we will not migrate records older than 5 years") must be approved in writing by the project sponsor before records are excluded.

---

## Stage 4 — Import Sequencing

**Purpose:** Import records in the correct order so that parent records exist before child records are loaded. Importing out of sequence causes "record not found" errors that invalidate entire import batches.

See [references/data_dependency_sequence.md](references/data_dependency_sequence.md) for the full NetSuite import order.

**Standard sequence (simplified):**

```
1. Subsidiaries / Locations / Departments / Classes
2. Currencies / Exchange Rates
3. Employees (for ownership/approval fields)
4. Customers / Vendors / Partners (Entities)
5. Items / Assemblies / Item Groups
6. Custom Record Types (parent records first)
7. Open Transactions (Bills, Invoices — never historical closed transactions first)
8. Historical Closed Transactions (if in scope)
9. Opening Balances / Journal Entries
```

Never import a child record before its parent. If a parent record import fails, halt and fix before proceeding — do not continue loading children against missing parents.

### 4.1 Batch Size

Refer to [references/csv_import_limits.md](references/csv_import_limits.md) for NetSuite-specific constraints.

- Maximum CSV file size: 50 MB
- Maximum rows per import job: varies by record type (typically 5,000–25,000)
- For large volumes: split into batches; import in sequence; validate each batch before the next

---

## Stage 5 — Validation

**Purpose:** Confirm that the data in NetSuite after import matches the source data exactly. Import success messages are not sufficient evidence — validation requires an independent count and reconciliation check.

### 5.1 Test Load (Pre-Go-Live)

Before the final migration, run a test load:
1. Load 10–20 representative records per object type into a fresh sandbox
2. Verify each record manually: field values match source, relationships are correct, custom fields are populated
3. Fix any mapping errors found before running the full import

### 5.2 Full Migration Validation

After the full import, validate using the Data Validation Report:

| Check | Method | Pass Criteria |
|-------|--------|--------------|
| Record count | Compare source extract count vs. NetSuite saved search count | Count matches (or difference is documented and explained) |
| Master data headers | Spot-check 100% of entity header fields (name, currency, address) | All checked records match source |
| Transaction line items | Sample 10% of lines by value | All sampled lines match source within acceptable rounding |
| Open items | 100% of open invoices, bills, and POs | Every open item present, amounts match |
| Custom field values | Verify a sample per custom field | Values match transformation rules |
| Relationship links | Check parent-child links (Invoice → Customer, Bill → Vendor) | No orphaned child records |

### 5.3 Brownfield Data Validation Additions

- **Parallel balance check:** If financials are in scope, compare NetSuite trial balance to legacy trial balance before go-live. Any variance must be explained and approved by Finance.
- **Open item reconciliation:** Every open AR and AP item in the legacy system must appear in NetSuite. No exceptions.

---

## Stage 6 — Update PLAN.md (Workspace Mode Only)

After the Data Validation Report is complete and the Phase 4 quality gate passes, update the `PLAN.md` coordination artifact:

1. **Governance section** — set `Current Phase` to `Phase 4 - Data Migration (Complete)`.
2. **Reference Artifacts section** — add a link for every deliverable produced:
   - `[Data Mapping Dictionary]: 04_Data/Data_Mapping_Dictionary.md`
   - `[Data Validation Report]: 04_Data/Data_Validation_Report.md`
3. **Strategic Decisions section** — add a timestamped entry for the 2–3 most consequential data decisions (e.g., which historical records were excluded and why, any open item variance approved by Finance, any record type deferred to post-go-live).
4. **Next Steps section** — replace Phase 4 items with Phase 5 (Testing) activities:
   - `[ ] Provision test environment with migrated data`
   - `[ ] Confirm all SIT test cases are written and linked to RTM`
   - `[ ] Schedule SIT kickoff (delegate to ns-test-manager)`
   - `[ ] Confirm Phase 3 build is deployed to SIT environment`

---

## Deliverables & Templates

| Deliverable | File | When to Use |
|-------------|------|------------|
| Data Mapping Dictionary | `assets/Data_Mapping_Dictionary.md` | Stage 2 — field-level mapping and transformation rules |
| Data Validation Report | `assets/Data_Validation_Report.md` | Stage 5 — test load and full migration validation evidence |
| Deduplication script | `scripts/deduplicate_csv.py` | Stage 3 — detect and flag duplicate records |

---

## Reference Quick Links

| Topic | File |
|-------|------|
| NetSuite import order | [references/data_dependency_sequence.md](references/data_dependency_sequence.md) |
| CSV import limits and constraints | [references/csv_import_limits.md](references/csv_import_limits.md) |

---

## Core Principles

- **External IDs are mandatory.** Every migrated record needs a unique External ID from the legacy system. This enables relationship linking, re-import after errors, and deduplication. A migration without External IDs cannot be safely corrected post-import.
- **Test load before full load.** Never run the full migration without a successful test load on representative data. The test load exists to find mapping errors before they affect thousands of records.
- **Import sequence is not optional.** Parent records must exist before children. The sequence in Stage 4 is not a suggestion — violating it produces import errors that cascade.
- **Validation requires evidence.** A successful import job summary is not validation. You need a record count check, a field-level spot check, and an open item reconciliation. Document the results.
- **Business decisions need sign-off.** When records are excluded (too old, inactive, out of scope), the project sponsor must approve in writing before they are dropped. "We decided to skip it" is not sufficient for audit purposes.
