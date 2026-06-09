---
name: ns-pr-merge
description: "[PR Lifecycle — Merge] Safely merges a pull request and confirms the downstream NetSuite deployment completed successfully. Use when a PR is approved and CI is green: validates all merge conditions, recommends the correct merge strategy, executes the merge, and monitors the triggered deploy pipeline."
---

# NS PR Merge

## Step 0 — Detect GitHub Tooling

Before reading any PR state, determine which GitHub integration is available. Test in this order and use the **first** that works:

1. **`gh` CLI** — run `gh --version`. If it succeeds, use `gh pr view`, `gh pr merge`, and `gh run watch` for all GitHub operations.
2. **GitHub MCP tools** — check whether `mcp__github__pull_request_read` and `mcp__github__merge_pull_request` are available (they appear in the tool list in Claude Code web sessions). If available, use them.
3. **Manual fallback** — if neither is available, collect all the information below and instruct the user to:
   - Navigate to the PR in the GitHub UI
   - Select the correct merge strategy (see Step 4)
   - Click the merge button
   - Then return to confirm the result

Document which path was selected at the top of every user-facing output.

---

## Step 1 — Identify the PR

1. If the user is on a feature branch, look up the open PR for that branch automatically:
   - `gh pr view --json number,title,baseRefName,headRefName,state,mergeable,statusCheckRollup,reviewDecision`
   - or GitHub MCP `pull_request_read` with method `get`
2. If the branch has no open PR, stop and redirect: *"No open PR found for this branch. Use ns-pr-create to create one first."*
3. If a PR number was specified by the user, use that directly.

---

## Step 2 — Pre-Merge Gate

**This gate is mandatory. Do not proceed to Step 3 if any condition is unmet.**

Check each condition and report the result:

| Condition | How to check | If failed |
|---|---|---|
| CI is green | All required status checks pass | Redirect to `ns-pr-diagnose` |
| No merge conflicts | `mergeable` field is not `CONFLICTING` | Redirect to `ns-conflict-resolve` |
| Required reviewers have approved | `reviewDecision` is `APPROVED` | List who still needs to approve |
| PR targets the correct base branch | Confirm `baseRefName` matches intent | Ask user to confirm or change |

If CI is not green: *"CI is not passing. Stopping here — use ns-pr-diagnose to resolve the failures before merging."*

If there are conflicts: *"This PR has merge conflicts. Stopping here — use ns-conflict-resolve for XML conflicts or resolve SuiteScript conflicts manually, then re-run ns-pr-merge."*

If reviewers are missing: *"The following required reviewers have not yet approved: [list]. The PR cannot merge until their approval is recorded."*

---

## Step 3 — Confirm Deployment Target

Read `ci/setup-complete.json` if present to determine the environment mapping. If not present, fall back to the default branch model.

State the deployment consequence **explicitly** before asking for confirmation. This statement is required — do not skip it:

| Base branch | Default environment | Approval gate |
|---|---|---|
| `develop` | Sandbox | None — CI runs automatically |
| `main` | Production | Requires approval gate in workflow (or manual confirmation) |
| `release/*` | Staging / UAT | Check `ci/setup-complete.json` for override |

Example output:
> "Merging PR #42 (`feature/o2c-approval-ue`) into `develop` will trigger a **Sandbox** deployment via the SDF CI pipeline. No manual approval gate is required."

> "Merging PR #15 (`develop`) into `main` will trigger a **Production** deployment. A workflow approval gate will pause the run and wait for a human to approve the deploy step."

---

## Step 4 — Choose Merge Strategy

Recommend the correct strategy based on branch type. State the recommendation and the reason:

| Branch pattern | Strategy | Reason |
|---|---|---|
| `feature/*` → `develop` | **Squash and merge** | One commit per feature keeps `develop` history linear and readable |
| `fix/*` or `bugfix/*` → `develop` | **Squash and merge** | Same as feature — single clean commit |
| `develop` → `main` | **Merge commit** | Preserves the full develop history in `main`; production should reflect what shipped |
| `hotfix/*` → `main` | **Squash and merge** | Clean single commit on `main`; then backmerge to `develop` (Step 8) |
| `release/*` → `main` | **Merge commit** | Same reasoning as develop → main |

State the recommended strategy explicitly: *"I recommend **Squash and merge** for this PR because it is a feature branch targeting develop."*

---

## Step 5 — Confirm With User

Present a single confirmation prompt with all three pieces of information:

> "Ready to merge. Here is the summary:
> - **PR:** #42 — [O2C] Add approval validation to Sales Order UE
> - **Strategy:** Squash and merge
> - **Deployment consequence:** Sandbox deploy will trigger automatically after merge
>
> Shall I proceed?"

Wait for an explicit go-ahead before executing the merge.

---

## Step 6 — Execute the Merge

Using the tool detected in Step 0:

**`gh` CLI:**
```bash
# Squash and merge
gh pr merge <number> --squash --delete-branch

# Merge commit
gh pr merge <number> --merge --delete-branch
```

**GitHub MCP (`mcp__github__merge_pull_request`):**
Pass `merge_method` as `"squash"` or `"merge"` accordingly.

**Manual fallback:**
Instruct the user to:
1. Open the PR in the GitHub UI
2. Click the dropdown arrow next to the merge button
3. Select the recommended strategy
4. Click the merge button
5. Confirm branch deletion when prompted

---

## Step 7 — Monitor Deployment

After the merge, watch the triggered CI run:

1. Get the workflow run triggered by the merge:
   - `gh run list --branch <base-branch> --limit 3`
   - or GitHub MCP `actions_list` with `list_workflow_runs`
2. Monitor until completion:
   - `gh run watch <run-id>`
   - or poll GitHub MCP `actions_get` with `get_workflow_run` until `status` is `completed`
3. Report the outcome:
   - **Success:** *"Deployment to Sandbox completed successfully (run #XXXXXX). The merge is done."*
   - **Failure:** *"The deployment pipeline failed after merge. Invoking ns-ci-diagnose to identify the failure."* → redirect to `ns-ci-diagnose` (or `ns-pr-diagnose` if that skill covers post-merge CI failures)

If the deployment run does not appear within 2 minutes of the merge, note it and ask the user to verify that the CI workflow trigger is correctly configured for the base branch.

---

## Step 8 — Post-Merge Actions

Check if any post-merge housekeeping is required:

| Scenario | Action |
|---|---|
| Hotfix merged to `main` | Remind user to backmerge to `develop`: `git checkout develop && git merge main && git push` (or open a backmerge PR) |
| Release PR merged to `main` | Prompt: *"Would you like to run ns-release to tag this release and update the changelog?"* |
| Feature branch merged, branch not deleted | Confirm deletion: `gh pr view <number> --json headRefName` + `git push origin --delete <branch>` |

---

## Escalation Rules

- **CI fails post-merge** → redirect to `ns-ci-diagnose` with the run ID
- **Wrong merge strategy used** (e.g. merge commit on feature branch) → note it but do not attempt to undo; advise the user to squash-merge on the next PR or rebase the target branch if history is a concern
- **Production merge** → always require explicit user confirmation in Step 5; never merge to `main` autonomously

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Diagnose a blocked PR | `ns-pr-diagnose` skill |
| Resolve XML merge conflicts | `ns-conflict-resolve` skill |
| Create a PR with correct description | `ns-pr-create` skill |
