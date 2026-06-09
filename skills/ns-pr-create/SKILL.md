---
name: ns-pr-create
description: "[PR Lifecycle — Create] Creates a well-formed GitHub pull request for an SDF feature branch. Use when a branch is ready to merge and needs a PR: inspects the diff, auto-generates a description with changed SuiteScript files, modified NetSuite objects, deployment impact, and the relevant OBJECT_OWNERSHIP.md checklist."
---

# NS PR Create

## Step 0 — Detect GitHub Tooling

Before doing anything else, determine which GitHub integration is available. Test in this order and use the **first** that works:

1. **`gh` CLI** — run `gh --version`. If it succeeds, use `gh pr create` for all GitHub operations. This is the preferred path in any terminal session.
2. **GitHub MCP tools** — check whether `mcp__github__create_pull_request` is available (it will appear in the tool list in Claude Code web sessions). If available, use it.
3. **Manual fallback** — if neither is available, collect all the information below, then present the user with:
   - The exact `git push -u origin <branch>` command if the branch isn't pushed yet
   - The GitHub URL to open a PR manually (e.g. `https://github.com/<org>/<repo>/compare/<base>...<branch>`)
   - The fully rendered PR title and body to paste into the GitHub UI

Document which path was selected at the top of every user-facing output so the user knows what is happening.

---

## Step 1 — Read Context

Gather the following before inspecting any files:

1. **Current branch** — `git rev-parse --abbrev-ref HEAD`
2. **Target base branch** — default to `develop` unless the user specifies otherwise or the branch name suggests a hotfix (prefix `hotfix/`) → default to `main`
3. **Workspace mode check** — look for `PLAN.md` at the repository root. If found, read it for: project name, Tier, current Phase, and environment mapping (which branch deploys to which environment). Pre-populate the PR body's deployment-impact section from this.
4. **SDF deploy strategy** — check for `ci/setup-complete.json`. If present, read the `deployStrategy` field and note it in the PR body.

---

## Step 2 — Inspect the Diff

Run `git diff --name-only <base>...HEAD` and split the changed files into four categories:

| Category | Pattern | Notes |
|---|---|---|
| SuiteScript files | `*.js` under `SuiteScripts/` | List with relative path |
| Object XMLs | `*.xml` under `Objects/` | List by object type (CustomRecord, CustomField, WorkflowAction, etc.) |
| CI / config files | `ci/**`, `*.json`, `manifest.xml`, `.github/**` | Note `manifest.xml` separately — it carries feature dependencies |
| Other | Everything else | Surface in PR body under "Other changes" |

Build a summary table for each non-empty category.

---

## Step 3 — Flag SDF Anti-Patterns

Scan the diff for known SDF problems **before** generating the PR. For each one found, emit a ⚠️ warning and stop — do not proceed to Step 4 until the user acknowledges or resolves each flag:

| Check | What to look for | Why it matters |
|---|---|---|
| `deploy.xml` in diff | `deploy.xml` anywhere in `git diff --name-only` | Should be gitignored; committing it breaks other devs' deployments |
| `client.properties` in diff | `client.properties` in diff | Contains credentials — must never be committed |
| `*.pem` in diff | Any `.pem` file in diff | Private key committed to source control |
| `manifest.xml` changed | `manifest.xml` in diff | Feature dependency changes can break deployments to other accounts |

If no flags are found, continue automatically.

---

## Step 4 — Generate PR Body

Fill `assets/pr-body-template.md` with the discovered content:

- **What changed** — bullet list of SuiteScript files and object XMLs with a one-line description of each change (infer from file name and diff context where possible)
- **NetSuite deployment impact** — based on `ci/setup-complete.json` and/or `PLAN.md`: which environment receives this deploy, whether a sandbox validation runs first, and whether any SDF-owned objects were modified
- **Checklist** — copy the full checklist from the template; mark any items that are already confirmed from the diff analysis

Propose a PR title in the format: `[Area] Short imperative description (CUST-XX-NN if applicable)`

Examples:
- `[O2C] Add approval validation to Sales Order UE`
- `[P2P] Migrate vendor record custom fields to SDF`

---

## Step 5 — Confirm With User

Present the generated title and body side-by-side and ask:

> "Here is the generated PR title and body based on the diff. Would you like to adjust anything before I create the PR?"

List any items in the checklist that are **unchecked** and note which ones the user should resolve before or after merge. Wait for confirmation or adjustments.

---

## Step 6 — Create the PR

Using the tool detected in Step 0:

**`gh` CLI:**
```bash
gh pr create \
  --title "<title>" \
  --body "$(cat assets/pr-body-template.md)" \
  --base <base-branch>
```

**GitHub MCP (`mcp__github__create_pull_request`):**
Pass `title`, `body`, `head` (current branch), and `base` fields directly.

**Manual fallback:**
Print the rendered title and body and instruct the user to:
1. Run `git push -u origin <branch>` if not already pushed
2. Open the compare URL GitHub prints after the push
3. Paste the title and body into the GitHub PR form

---

## Workspace vs Standalone Mode

| | Workspace mode (`PLAN.md` found) | Standalone mode |
|---|---|---|
| Project code | From `PLAN.md` | Infer from branch name or ask |
| Environment mapping | From `PLAN.md` or `ci/setup-complete.json` | Ask or note as unknown |
| Checklist items | Pre-fill from `PLAN.md` phase context | Use template defaults |
| PR title prefix | From `PLAN.md` project code | Infer from branch prefix |

---

## Reference Quick Links

| Topic | File |
|-------|------|
| PR body template | [assets/pr-body-template.md](assets/pr-body-template.md) |
| Object ownership and naming conventions | `OBJECT_OWNERSHIP.md` (project root, if present) |
