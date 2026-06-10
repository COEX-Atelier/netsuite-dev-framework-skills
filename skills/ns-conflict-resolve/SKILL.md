---
name: ns-conflict-resolve
description: "[SDF Git — Resolve Conflicts] Resolves merge conflicts in SDF project files (Objects/*.xml, manifest.xml, FileCabinet) using SDF-aware rules instead of treating them as plain text. Operates through git alone — no GitHub tooling required."
---

# NS Conflict Resolve

Standard merge tools treat SDF XML as plain text and let you pick a side. That is wrong for `manifest.xml` (both feature blocks must survive) and dangerous for structural field changes (silent data-model breakage). This skill classifies each conflicted file and applies the correct rule.

> Tool-agnostic by design: every step uses `git` and direct file reads. The only external call is `suitecloud project:validate` (local CLI) for post-resolution verification.

---

## Step 1 — Classify Conflicted Files

```bash
git diff --name-only --diff-filter=U
```

| Pattern | Class | Sensitivity |
|---|---|---|
| `manifest.xml` | Dependency / project metadata | **Highest** — never drop a feature |
| `Objects/customscript_*.xml`, `Objects/scriptdeployment_*.xml` | Script / deployment config | High |
| `Objects/customfield_*.xml`, `Objects/customrecord_*.xml` | Object definition | High if structural |
| `Objects/*.xml` (other) | Generic object | Medium |
| `FileCabinet/SuiteScripts/**/*.js` | Code | Standard — not SDF-specific |
| `deploy.xml` | Environment-specific | **Do not resolve** — see Step 3 |

---

## Step 2 — Resolve Each File by Rule

Read the conflict markers, then apply the matching rule. Full decision table: [references/xml-resolution-rules.md](references/xml-resolution-rules.md).

| File / conflict | Rule |
|---|---|
| `manifest.xml` — feature dependencies | **Merge both** `<dependencies>` / `<features>` blocks. Take the union; never drop a dependency. |
| `manifest.xml` — project name/version | Take **ours** (current branch). If versions differ, flag for review — do not silently pick. |
| `customfield_*.xml` — label / help text | Cosmetic. Show both; **ask the user** which is correct. |
| `customfield_*.xml` — structural (`type`, `recordtype`, `selectrecordtype`) | **Stop.** Structural changes alter the data model — require explicit user confirmation, never auto-resolve. |
| `customscript_*.xml` / `scriptdeployment_*.xml` — deploy params | Show the diff. Recommend the version matching the current sandbox deployment config. |
| `Objects/*.xml` — anything else | Present both versions side by side; let the user choose. |
| `SuiteScripts/**/*.js` | Standard 3-way merge. Watch for duplicated governance/guard blocks when both sides added one. |

Default posture: when a rule says "ask," do not proceed without an answer. When in doubt, present both sides rather than guess.

---

## Step 3 — Handle `deploy.xml`

`deploy.xml` is environment-specific and should be gitignored (per `ns-github-setup`). If it appears conflicted:

```bash
git checkout --ours -- deploy.xml   # or --theirs; content is regenerated per environment
git rm --cached deploy.xml
echo "deploy.xml" >> .gitignore
```

Tell the user it must stay untracked — a committed `deploy.xml` breaks every other developer's deploy.

---

## Step 4 — Validate Before Staging

After each resolved SDF file, confirm the XML is still structurally valid:

```bash
suitecloud project:validate
```

Do not stage a file that fails validation — fix the reported `[ERROR]` first.

---

## Step 5 — Stage and Complete the Merge

```bash
git add <resolved-files>
```

Confirm no markers remain: `git diff --check`. Then complete the merge:

- Mid-merge: `git commit` (use the prepared merge message, summarising which side won per file and why).
- Mid-rebase: `git rebase --continue`.

Report a one-line resolution summary per file so the decision trail is visible in the PR.

---

## Reference

| Topic | File |
|---|---|
| Full per-object-type resolution rules | [references/xml-resolution-rules.md](references/xml-resolution-rules.md) |
| Object ownership (who may change what) | `OBJECT_OWNERSHIP.md` (project root, if present) |
| Why `deploy.xml` is gitignored | `ns-github-setup` → `references/deploy_xml_strategies.md` |
