---
name: ns-object-sync
description: "[SDF Git — Sync Object] Pulls a single SDF-owned object that was edited in the NetSuite UI back into source control, with a reviewed diff and a descriptive commit. The manual counterpart to ci/check-drift.js. Operates through suitecloud CLI and git — no GitHub tooling required."
---

# NS Object Sync

The workflow for "I changed a field/script in the NetSuite UI — how do I get it into Git properly?" Without a guided path, developers either forget to sync (the next CI deploy silently overwrites their UI work) or commit blindly (no diff review). This skill imports the one object, reviews the diff, and commits it with intent.

> Tool-agnostic by design: every step uses `suitecloud` and `git`, both local. No GitHub API access needed.

---

## Step 1 — Identify the Object & Confirm Ownership

Get the **internal/script ID** and **object type** (ask, or read from context if already stated). Then check `OBJECT_OWNERSHIP.md`:

| Ownership | Action |
|---|---|
| SDF-owned | Proceed — this object belongs in Git |
| UI-owned | **Stop.** UI-owned objects are deliberately not synced to Git. Explain and exit. |
| Not listed | Likely a new object. Confirm with the user it should be SDF-owned; if yes, it gets added to the registry (Step 6). |

If `OBJECT_OWNERSHIP.md` is absent, note the project hasn't run `ns-github-setup`; ask the user to confirm ownership before continuing.

---

## Step 2 — Confirm Authentication

```bash
suitecloud account:manageauth --list
```

If no auth is configured for the target account, point the user to `ns-github-setup` → `references/oauth_setup_guide.md`, **Part 2 (Local Developer Setup)** to set up `client.properties` / interactive auth. Do not proceed without auth.

---

## Step 3 — Import the Object

```bash
suitecloud object:import \
  --type <objecttype> \
  --scriptid <scriptid> \
  --destinationfolder Objects \
  --overridetype OVERWRITE
```

`OVERWRITE` replaces the local XML with the account's current state so the diff in Step 4 shows exactly what changed in the UI.

---

## Step 4 — Show the Diff & Confirm Intent

```bash
git diff Objects/<scriptid>.xml
```

Present the changes and ask: **"Are these changes intentional?"**

| Answer | Action |
|---|---|
| Yes | Proceed to commit (Step 5) |
| No | `git checkout -- Objects/<scriptid>.xml` to discard. Advise reverting the change in the NetSuite UI too, or the next drift check will flag it again. |
| Partially | Open the file for targeted editing, keep only the intended changes, then commit |

Never commit without showing the diff first.

---

## Step 5 — Commit & Push

Generate a **descriptive** message — never just `sync`:

```
sync: import UI changes to <scriptid> — <what changed>
```

e.g. `sync: import UI changes to custbody_o2c_approval_status — relabel field and add help text`

```bash
git add Objects/<scriptid>.xml
git commit -m "sync: import UI changes to <scriptid> — <what changed>"
git push -u origin <current-feature-branch>
```

Push to the current feature branch — never directly to `main`/`develop`.

---

## Step 6 — Keep the Drift Manifest in Sync

If the object is **not** already in `ci/objects-manifest.json`, add it so drift detection tracks it going forward:

```json
{ "type": "<objecttype>", "scriptid": "<scriptid>" }
```

Commit that change too. If you also added the object to `OBJECT_OWNERSHIP.md` in Step 1, include both in the same commit. (`ci/objects-manifest.json` is committed source control, not gitignored — always safe to include.)

---

## Step 7 — Reminder

If this sync was triggered by a **drift detection failure** in CI (the pipeline went red), remind the user to **re-run the pipeline** after pushing — the drift gate will now pass because the account and the repo match.

---

## Reference

| Topic | File |
|---|---|
| Object ownership registry | `OBJECT_OWNERSHIP.md` (project root) |
| Drift-tracked objects list | `ci/objects-manifest.json` (project root) |
| Local auth setup (Part 2) | `ns-github-setup` → `references/oauth_setup_guide.md` |
| Automated drift detection (the thing this does manually) | `ns-github-setup` → `scripts/check-drift.js` |
| Diagnosing the CI drift failure | `ns-ci-diagnose` |
