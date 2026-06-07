---
name: ns-init-workspace
description: "[Step 2 — Workspace Init] Scaffolds a NetSuite project workspace folder tree from scratch or reconciles an existing messy folder into the framework structure. Use to initialize, scaffold, organize, restructure, or reconcile a project folder. Not for project sizing or tier classification."
---

# NS Init Workspace

## Step 0 — Read the situation

Two questions decide what follows:

1. **Empty or populated?** — Empty (or only stray files) → scaffold, then reconcile strays. Already has framework folders → re-run; create only what's missing.
2. **Is there a `PLAN.md`?** — Yes → read it for Tier, Origin, Language, current goal. No → initializing fresh; get the Tier next.

Confirm the **target folder** if it is not obvious from context — you will be moving files inside it.

---

## Step 1 — Determine the Tier

1. From `PLAN.md` Tier field if present.
2. From an explicit override (e.g. `tier=2`).
3. Otherwise ask — *"What tier — 1 (Full), 2 (Module/Refactor), or 3 (Tiny Enhancement)? Run ns-erp-navigator first if it hasn't been classified."*

---

## Step 2 — Scaffold the tree

Build from [references/framework_tree.md](references/framework_tree.md):

**Root (all tiers):** `PLAN.md`, `CHANGELOG.md`, `TODO.md`, and an (empty) `00_Governance/` folder.

**Phase folders:**
- **Tier 1 & 2** → `01_Discovery/` … `07_GoLive/`
- **Tier 3** → `Discovery_Design/`, `Build_Test/`, `Deployment/`

**Inside every phase folder:** empty `assets/` and `artifacts/`. `_legacy/` is created only on demand.

Seed the three coordination docs from the bundled stubs in `assets/`. Fill the `PLAN.md` sizing fields from what you know; leave the rest as placeholders. Use the 3-phase variants for Tier 3; 7-phase for Tier 1 & 2.

---

## Step 3 — Reconcile existing files (only if the folder had content)

Full procedure: [references/reconciliation_playbook.md](references/reconciliation_playbook.md). Shape:

1. **Establish and confirm the current goal.** Read from `PLAN.md` or synthesize from file heads, then **restate it and get a yes** before classifying anything. Legacy is defined relative to this goal.
2. **Classify each file content-aware.** Read each file's head and sort: official deliverable → phase root · input → `assets/` · unofficial/working → `artifacts/` · stale → `_legacy/`. When unsure, default to active and flag it.
3. **Present a dry-run move plan** (source → destination → class → why table, plus counts and ambiguous calls) and **get one approval**.
4. **Move** (never copy). Mappable-but-superseded → `0X_Area/_legacy/`; unmappable stale → `99_Legacy/`. Never overwrite — suffix `__2` and flag.

On **rescope** (goal has changed, not just "file this"): hard-stop, point to the appropriate scoping/grilling skill currently in the skill list, resume only once a fresh confirmed goal exists.

---

## Step 4 — Report and log

1. **Print a run summary:** resulting tree, counts (N active, M to legacy, K unmapped), collision-suffixed files, and items defaulted to active.
2. **Log the first `CHANGELOG.md` entry** — date, what was initialized, reconciliation counts.

---

## Boundaries

- Does not classify or size the project — consumes tier/origin from the user or `ns-erp-navigator`.
- Does not re-scope or author phase deliverables.

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Canonical folder tree, per-phase substructure, four-way sort | [references/framework_tree.md](references/framework_tree.md) |
| Reconciliation procedure, classification heuristics, legacy & collision rules | [references/reconciliation_playbook.md](references/reconciliation_playbook.md) |
| Coordination doc stubs to seed | `assets/PLAN.md`, `assets/CHANGELOG.md`, `assets/TODO.md` |
