---
name: ns-init-workspace
description: "[Workspace Init] Builds and organizes a NetSuite project workspace — scaffolds the framework folder tree (phase folders, 0_Governance, PLAN/CHANGELOG/BACKLOG docs) in a target folder, and reconciles existing loose files into place or quarantines stale ones to legacy. Use to initialize, scaffold, set up, structure, organize, restructure, clean up, or reconcile a project folder, even when the framework is not named. Not for project sizing or tier classification — that is ns-erp-navigator."
---

# NS Init Workspace

Your job is to turn a target folder into a correctly structured NetSuite implementation workspace — either by **scaffolding** the framework tree from scratch, or by **reconciling** an existing, messy folder into it. You own the *mechanics* of workspace setup, the work the framework calls "Step 2 — Workspace Initialization."

You do **not** decide the project's tier or origin (that classification belongs to `ns-erp-navigator`), and you do **not** re-scope a project. You take a known or stated goal and make the folder on disk match the framework — safely, because you are moving a user's real project files.

The structure you build is documented in [references/framework_tree.md](references/framework_tree.md). Read it before scaffolding or reconciling — it is the single source of truth for the tree.

---

## Step 0 — Read the situation before acting

Two questions decide everything that follows. Answer them first, by looking — not by asking.

1. **Is the target folder empty or populated?**
   - Empty (or only stray files, no framework folders) → you will **scaffold**, then **reconcile** any stray files.
   - Already has framework folders (`01_Discovery/`, `0_Governance/`, a `PLAN.md`…) → this is a **re-run**. Create only what is missing; never clobber what exists (see [Mechanics](#mechanics)).
2. **Is there a `PLAN.md` at the target root?**
   - Yes → read it. It gives you the **Tier**, **Origin**, **Language**, and the **current goal/phase** — everything you need to scaffold the right tree and to judge active-vs-legacy during reconciliation.
   - No → you are initializing fresh. Get the Tier next (Step 1).

Confirm the **target folder** with the user if it is not obvious from context — *"Initialize the workspace here in the current folder, or somewhere else?"* You will be moving files inside it, so be sure you have the right one.

---

## Step 1 — Determine the Tier (do not classify)

The tier decides which tree to build (7 phases vs. 3). Get it in this order, and **do not improvise a classification** — that is the navigator's job:

1. **From `PLAN.md`** — if a `Tier:` is recorded, use it.
2. **From an explicit override** — if the user passed a tier (e.g. `tier=2`), use that.
3. **Otherwise ask plainly** — *"What tier is this project — 1 (Full), 2 (Module/Refactor), or 3 (Tiny Enhancement)? If it hasn't been classified yet, run ns-erp-navigator first to size it."*

If the user genuinely doesn't know, point them to `ns-erp-navigator` for sizing rather than guessing. You scaffold *after* the tier is known.

---

## Step 2 — Scaffold the tree

Build the structure from [references/framework_tree.md](references/framework_tree.md). In summary:

**Root (all tiers):** `PLAN.md`, `CHANGELOG.md`, `BACKLOG.md`, and `0_Governance/NAMING_CONVENTIONS.md`.

**Phase folders:**
- **Tier 1 & 2** → `01_Discovery/` … `07_GoLive/`
- **Tier 3** → `Discovery_Design/`, `Build_Test/`, `Deployment/`

**Inside every phase folder** (uniform across all tiers): an empty `assets/` and an empty `artifacts/`. `_legacy/` is created only on demand.

Seed the four coordination docs from the bundled stubs in `assets/` (`PLAN.md`, `CHANGELOG.md`, `BACKLOG.md`, `NAMING_CONVENTIONS.md`). Fill the `PLAN.md` sizing fields from what you know (Tier/Origin/Language); leave the rest as the stub's placeholders for the navigator and downstream skills to complete. For a Tier 3 project, use the 3-row phase table; for Tier 1 & 2, the 7-row table.

> Structural folder names are **always English** and `artifacts` is spelled the **US way** — even on a French project. Only document *content* follows the project language. See the governance stub for why.

---

## Step 3 — Reconcile existing files (only if the folder had content)

If the target folder already contained files, sort them into the tree. This is the careful part — you are moving real project data — so it runs behind a dry-run and a single approval. Full procedure: [references/reconciliation_playbook.md](references/reconciliation_playbook.md). The shape of it:

1. **Establish and confirm the current goal.** Read it from `PLAN.md`, or synthesize it from the heads of the substantive files, then **restate it and get a yes** before classifying anything. Legacy is defined relative to this goal — if the goal is wrong, every legacy call is wrong.
2. **Classify each file content-aware.** Read each file's *head* (not just its name) and sort it four ways — official deliverable → phase root · input → `assets/` · unofficial/working → `artifacts/` · stale → `_legacy/`. An item is **legacy when its name *or* its content doesn't match the current goal exactly**; when truly unsure, default to active and flag it.
3. **Present a dry-run move plan** — a `source → destination → class → why` table, plus counts and any ambiguous calls — and **get one approval**.
4. **Move** (never copy) everything in the plan. Mappable-but-superseded items go to `0X_Area/_legacy/`; unmappable stale items go to root `99_Legacy/`. Never overwrite on collision — suffix `__2` and flag it.

If at any point the user signals the **scope or goal has changed** (a rescope, not just "file this"), **hard-stop**: move nothing, and point them to the most appropriate scoping/grilling skill **currently in their skill list** (chosen dynamically, never hardcoded). Resume only once a fresh confirmed goal exists.

---

## Step 4 — Report and log

When scaffolding/reconciling is done:

1. **Print a run summary:** the resulting tree, plus counts — *N files moved active, M to legacy, K unmapped/uncertain* — and call out every collision-suffixed file and every item you defaulted to active so the user can redirect.
2. **Log it as the first `CHANGELOG.md` entry** — date, what was initialized, and the reconciliation counts. This is exactly the audit trail `CHANGELOG.md` exists for, and it seeds the file with a real entry instead of an empty stub. Example:
   `### Added`
   `- 2026-06-05 — Workspace initialized (Tier 2). 14 files reconciled (11 active, 3 → legacy, 0 unmapped).`

---

## Mechanics — the guarantees that keep this safe {#mechanics}

These hold on every run. They exist because the input is a user's real, often only, copy of their project.

- **Move, not copy.** The point is to reorganize the folder in place, not duplicate it.
- **Dry-run + one approval before any move.** The user sees the whole plan once, approves once, then you execute the lot — no per-file nagging, no moving ahead of approval.
- **Non-clobbering re-run.** If structure already exists, create only what's missing. Don't recreate, empty, or reorder existing folders — if a pre-existing folder's purpose is unclear, **ask what it was for** rather than assuming.
- **Never overwrite on collision.** Two files headed for one path? Keep both (`name.md`, `name__2.md`) and flag it. Silent overwrite is unacceptable.
- **Restate-and-confirm the goal before reconciling.** Active-vs-legacy is meaningless without an agreed goal.
- **Hard-stop on rescope.** A moving goal makes every classification unreliable; stop and get the scope re-established first.

---

## Boundaries — what this skill does NOT do

- **It does not classify or size the project.** Tier and Origin come from `ns-erp-navigator` (or the user). This skill consumes that decision; it doesn't make it.
- **It does not re-scope.** On a rescope it hands off to a scoping/grilling skill and waits.
- **It does not edit the navigator or `0_project_sizing.md`.** Aligning the navigator's reference to this split/substructure model is a separate, planned follow-up skill — out of scope here.
- **It does not author phase deliverables.** It builds and organizes the *containers*; the spoke skills (`ns-solution-architect`, `ns-configurator`, `ns-test-manager`, …) write what goes in them.

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Canonical folder tree, per-phase substructure, four-way sort | [references/framework_tree.md](references/framework_tree.md) |
| Reconciliation procedure, classification heuristics, legacy & collision rules | [references/reconciliation_playbook.md](references/reconciliation_playbook.md) |
| Coordination doc stubs to seed | `assets/PLAN.md`, `assets/CHANGELOG.md`, `assets/BACKLOG.md`, `assets/NAMING_CONVENTIONS.md` |

---

## Core Principles

- **The folder is the user's real project — treat every move as irreversible.** Dry-run, approve, move; never copy-then-diverge, never overwrite.
- **Structure should be obvious, not clever.** A predictable `assets/`/`artifacts/`/phase-root home for every file means nobody has to think about where things go.
- **Legacy is relative to a confirmed goal.** Never bury a file as "stale" against a goal the user hasn't agreed to.
- **Stay in your lane.** Build and organize containers. Sizing, scoping, and deliverable authoring belong to other skills — defer to them.
