---
name: ns-pr-diagnose
description: "[PR Lifecycle — Diagnose] Diagnoses why a pull request cannot merge. Use when a PR is blocked: distinguishes merge conflicts, failing CI checks, branch protection violations, and SDF-specific pipeline failures — and provides a precise, actionable fix for each."
---

# NS PR Diagnose

## Step 0 — Detect GitHub Tooling

Before reading any PR state, determine which GitHub integration is available. Test in this order and use the **first** that works:

1. **`gh` CLI** — run `gh --version`. If it succeeds, use `gh pr view`, `gh run view`, and `gh run view --log-failed` for all GitHub operations.
2. **GitHub MCP tools** — check whether `mcp__github__pull_request_read` and `mcp__github__get_job_logs` are available (they will appear in the tool list in Claude Code web sessions). If available, use them.
3. **Manual fallback** — if neither is available, ask the user to paste the relevant information:
   - The PR page URL and any merge-blocking messages shown in the GitHub UI
   - The failing CI job name and the last 50 lines of its log

Document which path was selected at the top of every user-facing output.

---

## Step 1 — Identify the PR

1. If the user is on a feature branch (`git rev-parse --abbrev-ref HEAD`), look up the open PR for that branch automatically.
2. If multiple PRs exist or the branch is ambiguous, ask: *"Which PR number should I diagnose?"*
3. Fetch PR status using the detected tool:
   - `gh pr view <number> --json state,mergeable,statusCheckRollup,reviewDecision,baseRefName,headRefName`
   - or GitHub MCP `pull_request_read` with method `get`

---

## Step 2 — Classify the Blocker

Work through the following checks in order. The first confirmed blocker is the primary issue — resolve it before re-checking for secondary blockers.

### 2a — Merge Conflicts

If the PR has `mergeable: CONFLICTING`:

1. Run `git fetch origin && git diff --name-only HEAD..origin/<base>` or use the GitHub MCP to list conflicting files.
2. Classify each conflicting file:

   | File type | Pattern | Next step |
   |---|---|---|
   | Object XML | `Objects/*.xml` | Redirect to `ns-conflict-resolve` (do not resolve inline here) |
   | SuiteScript | `SuiteScripts/**/*.js` | Standard 3-way merge; review logic carefully for governance/entry-point conflicts |
   | `manifest.xml` | `manifest.xml` | Check feature dependency additions — pick the superset |
   | CI config | `ci/**`, `.github/**` | Defer to whichever branch has the most recent pipeline update |
   | Other | Everything else | Standard merge |

3. For XML conflicts: **do not attempt to resolve here.** State: *"XML object conflicts require the ns-conflict-resolve skill. Stopping here and handing off."* Then invoke or recommend `ns-conflict-resolve`.

### 2b — CI Failures

If the PR has failing status checks:

1. Fetch the latest workflow run for the branch:
   - `gh run list --branch <branch> --limit 5`
   - or GitHub MCP `actions_list` with `list_workflow_runs`
2. Read the failed job logs:
   - `gh run view <run-id> --log-failed`
   - or GitHub MCP `get_job_logs`
3. Match logs against the known SDF failure catalogue in `references/ci-failure-patterns.md`. Present the identified root cause and exact fix. See Step 3 for the full pattern table.

### 2c — Branch Protection Violations

If CI is green and there are no conflicts but the PR is still blocked:

1. Check required reviewers — identify who has not yet approved:
   - `gh pr view <number> --json reviewDecision,reviews`
   - or GitHub MCP `pull_request_read` with method `get`
2. Check required status checks — list which checks are required vs. which have passed.
3. Check if the base branch has protection rules requiring linear history (squash/rebase only) and whether the current PR satisfies that.

Present each unmet protection condition as a separate bullet with the exact action required.

---

## Step 3 — SDF CI Failure Pattern Matching

When CI has failed, match the log output against these patterns. Present the **first matching pattern** as the primary diagnosis:

| Log pattern | Root cause | Exact fix |
|---|---|---|
| `invalid_client` or `INVALID_LOGIN_ATTEMPT` | OAuth certificate mismatch or cert expired in NetSuite | 1. Open NetSuite → Setup → Integrations → Manage Integrations → find the CI integration record. 2. Verify the Certificate ID matches `NS_CERTIFICATE_ID` in GitHub Secrets. 3. If the cert has expired, generate a new one and update both the integration record and the secret. |
| `base64: invalid input` | Private key secret has embedded line breaks | Re-encode: `base64 -w 0 <path/to/key.pem>` and update the `NS_PRIVATE_KEY` GitHub Secret with the single-line output. |
| `INSUFFICIENT_PERMISSION` | CI role lacks SuiteCloud Development Framework permission | In NetSuite: Setup → Users/Roles → Manage Roles → edit the CI role → Permissions tab → Setup subtab → add "SuiteCloud Development Framework" with "Full" level. |
| `deploy.xml` in diff | `deploy.xml` was committed to the branch | Run `git rm --cached deploy.xml && git commit -m "Remove deploy.xml from tracking" && git push`. Verify `deploy.xml` is in `.gitignore`. |
| Drift detection exit 1 | A UI change was made to an SDF-owned object that isn't committed | Follow the instructions printed by `check-drift.js`: either re-import the object (`suitecloud object:import`) and commit the updated XML, or revert the UI change in NetSuite. |
| `project:validate` failed | XML syntax error or missing feature/object dependency | Run `suitecloud project:validate` locally. Read each reported error: fix XML syntax issues directly; for missing dependencies, add the feature or object to `manifest.xml` features/dependencies. |

See [references/ci-failure-patterns.md](references/ci-failure-patterns.md) for the full catalogue including less-common patterns and environment-specific variants.

---

## Step 4 — Report

Present a prioritised list of blockers. Always lead with the **highest-severity blocker** (merge conflict > CI failure > protection rule). Format:

```
Blocker 1 (MERGE CONFLICT): Objects/CustomRecord_coex_project.xml has a conflict.
→ This requires ns-conflict-resolve. Handing off.

Blocker 2 (CI FAILURE): job "sdf-validate" failed with INSUFFICIENT_PERMISSION.
→ Fix: Add SuiteCloud Development Framework > Full to the CI role in NetSuite (see Step 3 above).

Blocker 3 (PROTECTION): 1 required reviewer has not approved (requested: @bolduck91).
→ Fix: Request or wait for the pending review.
```

Address **one blocker at a time**. After each fix, re-run the diagnosis from Step 2 rather than assuming the other blockers are still present.

---

## Escalation Rules

- **XML conflicts** → always redirect to `ns-conflict-resolve`, never resolve inline
- **Unknown CI failure** (no matching pattern) → paste the first 20 error lines and ask the user for context; do not guess
- **Production PR blocked** (base is `main`) → note this explicitly and recommend extra caution before advising any force-unblock

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Full SDF CI failure catalogue | [references/ci-failure-patterns.md](references/ci-failure-patterns.md) |
| XML conflict resolution | `ns-conflict-resolve` skill |
| PR creation with correct checklist | `ns-pr-create` skill |
