---
name: ns-release
description: "[SDF Release — Tag & Changelog] Cuts a versioned release from main — picks the next semantic version, builds a grouped changelog from commits since the last tag, publishes the GitHub release, and confirms the production deploy. Detects available tooling (gh CLI / GitHub MCP / manual git tag). Use for cut a release, tag a version, changelog, or what changed since the last release."
---

# NS Release

The step after `develop`/`release/*` merges into `main`: turn an unlabelled run of commits into a named, traceable release. Without it, SDF projects accumulate production deploys with no tag to roll back to and no record of what changed between them. `ns-pr-merge` hands off here after a release or hotfix merge.

Run this **on `main`, after the merge** — never on a feature branch.

---

## Step 0 — Detect Tooling

Pick the mechanism once and use it for Steps 2 and 6:

| Detected | Read tags / commits | Publish release |
|---|---|---|
| `gh` CLI | `git` locally | `gh release create` |
| GitHub MCP | `git` locally | `list_tags` / release tool |
| Neither | `git` locally | `git tag` + push, then GitHub UI |

The changelog is built from local `git log` regardless — only how you publish the release changes.

---

## Step 1 — Confirm You Are on `main` and Up to Date

```bash
git rev-parse --abbrev-ref HEAD   # must be main
git fetch origin main && git status -sb
```

If not on `main`, or behind `origin/main`, **stop** and tell the user to switch/pull first. Releasing from a stale or feature branch tags the wrong commit.

---

## Step 2 — Read the Baseline

Find the last release tag — the changelog baseline:

```bash
git describe --tags --abbrev=0   # e.g. v1.3.2
```

| Result | Meaning |
|---|---|
| A tag (e.g. `v1.3.2`) | Baseline for the changelog range |
| No tags / error | **First release.** Suggest `v1.0.0` and read all commits on `main` as the changelog. |

---

## Step 3 — Suggest the Next Version

Read the commits since the baseline (Step 4) first, then propose a bump. Default to the highest tier any commit justifies:

| Bump | New version | When |
|---|---|---|
| **Patch** | `v1.3.x` | Bug fixes, script tweaks, object syncs — no new objects or behaviour |
| **Minor** | `v1.x.0` | New scripts, new custom objects, new features (backward-compatible) |
| **Major** | `vX.0.0` | Breaking changes, removed objects, large-scale restructure |

Present the recommended bump with the one or two commits that drive it. Let the user confirm or override.

---

## Step 4 — Build the Changelog

```bash
git log <last-tag>..HEAD --oneline    # or all commits if first release
```

Group by commit prefix into the template (`assets/changelog-template.md`) — never a raw `git log` dump:

| Prefix | Section |
|---|---|
| `feat:` / new objects | Features |
| `fix:` / `hotfix:` | Bug Fixes |
| `sync:` | Object Syncs (UI → Git) |
| `chore:` / `ci:` | Maintenance |
| anything else | Other |

Drop merge commits. Rewrite terse messages into readable one-liners. If a section is empty, omit its heading.

---

## Step 5 — Show the Draft, Wait for Sign-off

Present the **version**, the **tag name**, and the **rendered changelog**. Ask for confirmation or edits. Do not create anything until the user approves — a published release and tag are awkward to retract.

---

## Step 6 — Publish the Release

Use the mechanism from Step 0. Tag name and release title are the version (e.g. `v1.4.0`); body is the approved changelog.

```bash
# gh CLI
gh release create v1.4.0 --target main --title "v1.4.0" --notes-file <changelog>

# manual
git tag -a v1.4.0 -m "v1.4.0" && git push origin v1.4.0
# then create the release from the tag in the GitHub UI
```

GitHub MCP: create the tag/release via the release tool against `main` at HEAD.

---

## Step 7 — Confirm the Production Deploy

**What triggers production is project-specific — read it, do not assume.** Check `ci/setup-complete.json` → `productionGate`, and confirm against the workflow's `on:` block (`.github/workflows/*.yml`). Two gates are common:

| `productionGate` | What actually deploys | What to do |
|---|---|---|
| `version-tag (v*)` | The **tag push you just made** in Step 6. The merge into `main` deployed nothing — `main` is validate-only. | Watch the run triggered by the tag. |
| `branch (main)` + environment approval | The **merge into `main`** (in `ns-pr-merge`), gated by the `production` environment reviewers. The tag is documentation only. | Check whether the merge already kicked off `deploy-production`; if it waits on the approval gate, remind the user to approve. |

Then:

1. Locate the run triggered by whichever event the table says is the real trigger (via the detected tool, or GitHub → Actions).
2. If no deploy job exists (manual deploy strategy, or `ci/setup-complete.json` absent), remind the user to run the production deploy.
3. Never describe the `develop` → `main` merge as "the release" when the gate is the tag — say so explicitly to the user, since it is a common misreading.

On a failed deploy run, redirect to `ns-ci-diagnose`.

---

## Reference

| Topic | File |
|---|---|
| Changelog structure | `assets/changelog-template.md` |
| Deploy strategy / branch model | `ci/setup-complete.json` (project root) |
| Merge that precedes a release | `ns-pr-merge` |
| Diagnosing a failed deploy run | `ns-ci-diagnose` |
