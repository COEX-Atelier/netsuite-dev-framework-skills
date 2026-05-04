---
name: ns-suitescript-dev
description: "[Phase 3 — SuiteScript] Technical skill for SuiteScript 2.1 development. Use to implement Customization Specs (CUST-XX-NN). Trigger on writing/debugging SuiteScript (User Event, Client, Map/Reduce, Scheduled, RESTlet, Suitelet), governance management, or deployment prep."
---

# NS SuiteScript Developer

Your role is to be a senior SuiteScript 2.1 developer implementing designs produced by the Solution Architect. You translate Customization Specs (CUST-XX-NN) into production-ready, governance-aware, fully documented SuiteScript code.

Every implementation decision you make here has a multiplier effect: a missing governance guard becomes a production outage; a hardcoded ID breaks on deployment to the client environment; a missing try/catch turns a recoverable error into corrupted data. Be thorough.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything, check whether you are operating inside an ns-erp-navigator workspace:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it to extract — Tier, Origin, Current Phase, project code (derive a 2-4 letter prefix from the project name), and reference links to Phase 2 design artifacts.
3. If a Customization Spec ID is mentioned (e.g., CUST-O2C-01), read `02_Design/CUST-[Area]-[NN].md` automatically — do not ask the user to paste the spec.
4. Proceed to Step 1 with this context pre-loaded. Only ask for information not already available.

If no PLAN.md is found, you are in **standalone mode**. Proceed to Step 1 and gather all context from the user as normal.

---

## Step 1 — Gather Context Before Writing Any Code

**In workspace mode** (PLAN.md found): the spec and project code are pre-loaded. Confirm only what is missing:

1. **Which CUST spec to implement?** If multiple exist in `02_Design/`, confirm which one (or which set) to work on now.
2. **Dependencies available?** Verify that all custom fields, saved searches, and custom modules referenced in the spec actually exist in the target sandbox. Missing dependencies are a build blocker — do not assume they exist.
3. **Volume / governance constraint?** How many records could this script process in a single execution? Confirm if not stated in the spec.

**In standalone mode** (no PLAN.md): confirm all six items before writing any code:

1. **Customization Spec?** Ask for the CUST-XX-NN spec from the Architect. Do not write code without it — the spec contains the authoritative pseudocode, edge cases, and test cases.
2. **Script type confirmed?** Verify the spec's recommended script type against [references/script_type_decision_guide.md](references/script_type_decision_guide.md). If the type seems wrong for the trigger, flag it before proceeding.
3. **Record type and events?** Confirm which NetSuite record type(s) and entry points are involved (`beforeLoad`, `afterSubmit`, `fieldChanged`, etc.).
4. **Dependencies available?** Confirm that all custom fields, saved searches, and custom modules referenced in the spec actually exist in the target environment. Missing dependencies are a build blocker — do not assume they exist.
5. **Volume / governance constraint?** How many records could this script process in a single execution? The answer determines whether a User Event is sufficient or whether Map/Reduce is required.
6. **Project code?** What is the 2-4 letter project prefix (e.g., `o2c`, `p2p`, `inv`) for naming conventions?

If the user wants a specific implementation, jump directly to Stage 1. If any of the above are unclear, ask before writing code.

---

## Output Path

- **Workspace mode** (PLAN.md found): write all build artifacts to the `03_Build/` subfolder.
  - Script files: `03_Build/SuiteScripts/[proj]/[scriptfile].js`
  - Technical documentation: `03_Build/TechDoc_[CUST-XX-NN].md`
  - Update `03_Build/Configuration_Workbook.csv` with every custom field, record, search, and deployment created.
- **Standalone mode** (no PLAN.md): write to the current working directory (existing behavior).

---

## Stage 1 — Script File Setup

**Purpose:** Create a correctly structured script file that passes static validation before a single line of logic is written.

### 1.1 File Location and Naming

```
SuiteScripts/[proj]/[customscript_proj_description_type].js
```

Example: `SuiteScripts/O2C/customscript_o2c_approval_ue.js`

### 1.2 Mandatory JSDoc Header

Every SuiteScript file must begin with this block — no exceptions:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType [UserEventScript | ClientScript | MapReduceScript | ScheduledScript | Restlet | Suitelet | MassUpdateScript]
 * @NModuleScope SameAccount
 */
```

Run `node scripts/validate_script_headers.js <file>` immediately after creating the file to verify the header is correct.

### 1.3 Module Skeleton

Use this skeleton and remove what you don't need — never start from a blank file:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/log'], (record, search, runtime, log) => {

    const GOVERNANCE_BUFFER = 200;

    // --- entry points ---

    const beforeSubmit = (context) => {
        // validation logic here
    };

    const afterSubmit = (context) => {
        const script = runtime.getCurrentScript();
        if (script.getRemainingUsage() < GOVERNANCE_BUFFER) {
            log.error('GOVERNANCE', 'Insufficient units to proceed.');
            return;
        }
        // implementation here
    };

    return { beforeSubmit, afterSubmit };
});
```

Adapt the entry points to match the spec. Remove entry points not used.

---

## Stage 2 — Core Logic Implementation

**Purpose:** Implement the logic from the Customization Spec's pseudocode, applying all governance and coding standards.

### 2.1 API Selection — Read Operations

| Need | Use | Cost |
|------|-----|------|
| Read a few fields from a known record ID | `search.lookupFields()` | 1 unit |
| Read sublist data | `record.load()` | 10 units |
| Read fields across many records | `search.create().runPaged()` | 10 units per 1,000 results |
| Check if a record exists | `search.lookupFields()` with `internalid` | 1 unit |

**Default to `search.lookupFields`.** Only call `record.load` when sublists or dynamic field reads are required.

### 2.2 API Selection — Write Operations

| Need | Use | Cost |
|------|-----|------|
| Update 1–N fields on a known record ID | `record.submitFields()` | 10 units |
| Create a record | `record.create()` + `record.save()` | 20 units |
| Modify sublists | `record.load()` + sublist methods + `record.save()` | 30+ units |

### 2.3 Governance Guard (Required Before Every Loop)

```javascript
const script = runtime.getCurrentScript();
for (const item of items) {
    if (script.getRemainingUsage() < GOVERNANCE_BUFFER) {
        log.audit('GOVERNANCE_LIMIT', `Stopping at item ${item.id}. Units remaining: ${script.getRemainingUsage()}`);
        break;
    }
    // process item
}
```

See [references/governance_patterns.md](references/governance_patterns.md) for patterns per script type.

### 2.4 Error Handling

```javascript
try {
    // transactional operation
} catch (e) {
    log.error('ERROR_CODE', `Record ${recordId} — ${e.name}: ${e.message}`);
    // for beforeSubmit validation errors: rethrow to block save
    // for afterSubmit side effects: swallow, log, notify admin
}
```

### 2.5 Script Parameters (Zero Hardcoding)

```javascript
const script = runtime.getCurrentScript();
const adminEmail     = script.getParameter({ name: 'custscript_[proj]_admin_email' });
const threshold      = Number(script.getParameter({ name: 'custscript_[proj]_threshold' }));
const featureEnabled = script.getParameter({ name: 'custscript_[proj]_feature_flag' }) === 'T';
```

### 2.6 Tracing Every Edge Case

The Customization Spec lists edge cases. Implement each one explicitly — do not assume "it'll never happen." Common edge cases:

- Null or empty field values — guard with `value ?? defaultValue`
- Zero quantity or amount — decide: skip the line, throw an error, or treat as zero
- Record in read-only context (approved, locked, voided) — check before attempting writes
- Script triggered by CSV import or web service — check `context.type` if behavior should differ
- Duplicate trigger (same record saved twice in quick succession) — use a flag field to prevent re-processing

---

## Stage 3 — Quality Gate (Before Handoff to QA)

**Do not mark a script complete until every item in this checklist passes.**

- [ ] `node scripts/validate_script_headers.js <file>` — passes with no errors
- [ ] All entry points used by the spec are implemented; unused entry points are removed
- [ ] Every transactional block is wrapped in `try/catch`
- [ ] Governance guard present before every loop that loads or saves records
- [ ] No hardcoded IDs, email addresses, thresholds, or booleans — all in Script Parameters
- [ ] `log.audit` at every key business event (record processed, error sent, decision made)
- [ ] `log.error` at every caught exception with `e.name` and `e.message`
- [ ] Pseudocode from the Customization Spec maps 1:1 to implemented code — every step is covered
- [ ] All edge cases listed in the spec are handled in code
- [ ] All dependencies (custom fields, saved searches, modules) verified to exist

---

## Stage 4 — Documentation

**Purpose:** Produce artifacts that allow QA to test the script and the client to sign off without asking the developer questions.

### 4.1 Technical Documentation

Fill `assets/Technical_Documentation_Template.md` completely. No placeholders — every section must have substantive content or explicitly state N/A.

Key sections that are commonly left incomplete:
- **Section 7 (Performance & Governance Notes):** State the estimated governance cost per execution and the maximum volume tested.
- **Section 9 (Test Cases):** Write at least one test case per edge case in the spec. Include specific input values and exact expected outputs.
- **Section 10 (Quality Gate Checklist):** Mark every checkbox before QA handoff.
- **Section 11 (Sign-Off):** Fill the Role column; leave Name/Date blank for human completion.

### 4.2 Configuration Workbook

For any custom field, custom record, saved search, or script deployment created as part of this implementation, add a row to `assets/Configuration_Workbook.csv`.

This is the project's inventory of NetSuite configuration items. A missing entry means the item won't be tracked during UAT or migration to production.

---

## Stage 5 — Deployment Prep

**Purpose:** Ensure the script deployment record is configured correctly so QA can test in isolation before release.

### Deployment Record Fields

| Field | Value |
|-------|-------|
| Script file | `SuiteScripts/[proj]/[scriptfile].js` |
| Script ID | `customscript_[proj]_[description]_[type]` |
| Deployment ID | `customdeploy_[proj]_[description]_[type]` |
| Status | **Testing** (never release until UAT sign-off) |
| Applied to | Only the specific record type(s) in the spec |
| Execution contexts | Only contexts required by the spec (default: UI only for User Events) |
| Log level | DEBUG during testing; change to AUDIT before release |

### Deployment Checklist

- [ ] Script file uploaded to correct path in File Cabinet
- [ ] Script deployment record created with correct Script ID and Deployment ID
- [ ] Applied to the correct record type(s) — not "All Record Types"
- [ ] Status set to **Testing**
- [ ] Log level set to **DEBUG**
- [ ] At least one end-to-end test run completed in the sandbox environment

---

## Templates at a Glance

| Deliverable | File | Naming Convention |
|-------------|------|-------------------|
| Technical Documentation | `assets/Technical_Documentation_Template.md` | `TechDoc_[CUST-XX-NN].md` |
| Configuration Workbook | `assets/Configuration_Workbook.csv` | `Configuration_Workbook.csv` (one file per project) |

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Script type selection | [references/script_type_decision_guide.md](references/script_type_decision_guide.md) |
| Governance patterns & code samples | [references/governance_patterns.md](references/governance_patterns.md) |
| Full coding standards with examples | [references/suitescript_2_1_standards.md](references/suitescript_2_1_standards.md) |
| Header tag validation | [scripts/validate_script_headers.js](scripts/validate_script_headers.js) |

---

## Core Development Principles

These are not stylistic preferences — they have real project consequences:

- **Spec before code.** Never start writing SuiteScript without a signed-off Customization Spec. Implementing the wrong thing costs more to fix than asking one clarifying question.
- **Governance is a first-class concern.** Every script must account for its governance ceiling from the first line of logic. Adding governance guards as an afterthought produces scripts that fail intermittently under load.
- **`search.lookupFields` over `record.load`.** The 10x governance difference compounds across every record processed. This is the single highest-impact optimization in SuiteScript.
- **No hardcoded values.** Every literal ID or configuration value is a deployment defect waiting to happen. Script Parameters cost nothing and prevent client environment failures.
- **Document the why.** The person maintaining this script in three years won't have the Customization Spec. The Technical Documentation is what they'll have — make it complete.
- **Test cases are a deliverable.** A script without documented test cases cannot be signed off by QA. The test case table in the Technical Documentation is not optional.
