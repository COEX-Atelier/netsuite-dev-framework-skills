# SDF XML Conflict Resolution Rules

Decision table for resolving merge conflicts in SDF project files. Each entry gives the conflict shape, the correct resolution, and the reason. When a rule says **ask** or **stop**, do not auto-resolve — the cost of a wrong guess is silent data-model damage or a broken deploy.

---

## manifest.xml

`manifest.xml` declares the project's identity, the features the account must have, and the objects/files the project depends on. A conflict here is the most consequential of all SDF conflicts because picking one side can silently drop a dependency.

### Feature dependencies (`<features>`)

```xml
<features>
<<<<<<< ours
  <feature required="true">SERVERSIDESCRIPTING</feature>
  <feature required="true">CUSTOMRECORDS</feature>
=======
  <feature required="true">SERVERSIDESCRIPTING</feature>
  <feature required="true">WORKFLOW</feature>
>>>>>>> theirs
</features>
```

**Resolution: merge — take the union.** Keep every distinct `<feature>` from both sides. Result:

```xml
<features>
  <feature required="true">SERVERSIDESCRIPTING</feature>
  <feature required="true">CUSTOMRECORDS</feature>
  <feature required="true">WORKFLOW</feature>
</features>
```

**Reason:** each feature was declared because some object in that branch needs it. Dropping one means the next deploy fails validation against an account that lacks the feature. The union is always safe — an unused feature declaration is harmless; a missing one is not.

If the same feature appears on both sides with a different `required` value, prefer `required="true"` (stricter), and flag it: a feature that one branch made optional may have been deliberate.

### Object / file dependencies (`<objects>`, `<files>`)

**Resolution: merge — take the union**, same logic as features. Deduplicate by `scriptid` / path.

### Project name / type (`<projectname>`, `<projecttype>`)

**Resolution: take ours** (current branch). These rarely change. If they genuinely differ between branches, **stop and ask** — divergent project identity usually means the branches were cut from different projects and the merge itself is suspect.

### Version / framework version

**Resolution: take the higher version, but flag for review.** A version bump is intentional; do not silently downgrade. Confirm with the user which framework version the target account expects.

---

## Custom Fields (`customfield_*.xml` — custbody, custcol, custentity, custitem, custrecord)

Distinguish **cosmetic** from **structural** changes — the resolution differs sharply.

### Cosmetic: `label`, `help`, `description`, `displaytype`

**Resolution: ask the user, show both.** These do not break anything, but the correct text is a business decision. Present both values and let the user pick. Never merge text by concatenation.

### Structural: `fieldtype`, `recordtype`, `selectrecordtype`, `isformula`, `storevalue`

**Resolution: STOP. Require explicit confirmation.** Do not auto-resolve under any circumstance.

**Reason:** changing a field's `fieldtype` (e.g. `FREEFORMTEXT` → `INTEGER`) or its `selectrecordtype` alters the data model. Picking the wrong side can:
- Orphan stored values that no longer match the type.
- Break SuiteScript and saved searches that reference the field.
- Cause an irreversible data conversion on deploy.

Present both sides, name the exact attribute that differs, and ask the user which change was intended. If they are unsure, advise inspecting the field in both the sandbox and the originating branch before deciding.

### Mandatory / default value (`mandatory`, `defaultvalue`)

**Resolution: ask.** Making a field mandatory can fail validation on existing records that lack a value. Surface the implication, then take the user's choice.

---

## Scripts & Deployments (`customscript_*.xml`, `scriptdeployment_*.xml`)

### Script record (`customscript_*.xml`)

| Attribute | Rule |
|---|---|
| `scriptfile` path | Take the side whose `.js` file actually exists in `FileCabinet/`. If both exist, ask. |
| `scripttype` | **Stop** — a script's type does not normally change; divergence signals a mistake. |
| script parameters (custom `scriptcustomfield`) | Merge the union of parameters; for a parameter present on both with different config, ask. |

### Script deployment (`scriptdeployment_*.xml`)

| Attribute | Rule |
|---|---|
| `status` (`TESTING` / `RELEASED`) | Recommend the value matching the current sandbox deployment; show the diff first. |
| `isdeployed` | Prefer `T` (deployed) unless the user intentionally disabled it. |
| `loglevel` | Cosmetic-ish; take ours, mention the difference. |
| `audience` / `roles` / `allroles` | **Merge** — take the union of roles so no audience is silently removed. |
| `recordtype` / `eventtype` | **Stop** — structural; changing what the deployment binds to needs confirmation. |

**Reason:** deployment params control where and how a script runs. Audience narrowing is the common silent break — a merge that drops a role disables the script for those users without any error.

---

## Custom Records (`customrecord_*.xml`)

| Conflict | Rule |
|---|---|
| New child field on one side | Merge — keep both branches' fields. |
| Same field, cosmetic diff | Ask (see custom field cosmetic rule). |
| Same field, structural diff | Stop (see custom field structural rule). |
| `includename`, `showid`, access type | Take ours; mention the difference. |
| Permissions block | Merge the union of permission lines. |

---

## Other Objects (`savedsearch_*`, `customworkflow_*`, `customlist_*`, `customsegment_*`, …)

No universal rule — these range from cosmetic to deeply structural. Default behaviour:

1. Present both versions side by side.
2. Identify whether the diff is cosmetic (labels, descriptions) or structural (criteria, filters, transitions, list values).
3. Cosmetic → ask, lean toward the most recent intentional change.
4. Structural → stop, require confirmation.

For `customworkflow_*.xml` specifically: workflow state/transition conflicts are structural — never auto-resolve. A merged-but-wrong workflow can route records incorrectly with no error.

---

## SuiteScript (`FileCabinet/SuiteScripts/**/*.js`)

Not SDF-specific — use a standard 3-way merge. One SDF-flavoured caution:

- **Governance / guard duplication:** if both branches independently added a governance check, usage guard, or `try/catch` wrapper around the same block, a naive merge keeps both. Deduplicate.
- **Module dependency arrays:** when both sides added `define([...])` dependencies, merge the union and keep argument order aligned with the array.

---

## deploy.xml

**Never resolve as a content conflict.** `deploy.xml` is environment-specific and SDF-generated; it should be gitignored (`ns-github-setup`, Strategy B). Resolution:

```bash
git checkout --ours -- deploy.xml
git rm --cached deploy.xml
echo "deploy.xml" >> .gitignore
git add .gitignore
```

A committed `deploy.xml` is the root cause of recurring conflicts — removing it from tracking prevents the conflict from ever recurring.

---

## Resolution Posture Summary

| Verb | When | Action |
|---|---|---|
| **Merge** | Additive declarations (features, dependencies, fields, roles, parameters) | Take the union, deduplicate |
| **Take ours** | Low-risk metadata (project name, log level) | Use current branch; mention the difference |
| **Ask** | Cosmetic but business-meaningful (labels, help, status, mandatory) | Show both, let the user choose |
| **Stop** | Structural (field type, record type, script type, workflow logic) | Require explicit confirmation; never auto-resolve |
| **Untrack** | `deploy.xml` | Discard + gitignore |

After any resolution, run `suitecloud project:validate` before staging. A resolution that produces invalid XML is not a resolution.
