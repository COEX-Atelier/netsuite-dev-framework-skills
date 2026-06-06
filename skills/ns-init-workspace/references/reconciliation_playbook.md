# Reconciliation Playbook

How to take a folder that already has content and sort it into the framework tree **without losing anything and without guessing wrong**. Reconciliation is the riskier half of this skill — it touches the user's real project files — so it runs behind a dry-run and a single explicit approval.

## Table of Contents
1. [The non-negotiable safety contract](#1-the-non-negotiable-safety-contract)
2. [Step A — Establish and confirm the current goal](#2-step-a--establish-and-confirm-the-current-goal)
3. [Step B — Classify each file (content-aware)](#3-step-b--classify-each-file-content-aware)
4. [Step C — Build the dry-run move plan](#4-step-c--build-the-dry-run-move-plan)
5. [Step D — Move, after one approval](#5-step-d--move-after-one-approval)
6. [Legacy placement (hybrid)](#6-legacy-placement-hybrid)
7. [Collisions](#7-collisions)
8. [Rescope — hard stop](#8-rescope--hard-stop)

---

## 1. The non-negotiable safety contract

These hold for every reconciliation, no exceptions:

- **Move, never copy.** The goal is to *reorganize* a project folder in place, not to duplicate it. Copies leave two divergent truths.
- **Dry-run first, one approval, then move.** Never move a file before the user has seen the full plan and approved it once. After approval, execute the whole plan — don't re-prompt per file.
- **Never overwrite.** If two files want the same destination, keep both (see [Collisions](#7-collisions)). Real project data is irreplaceable.
- **Non-clobbering re-run.** If the structure already partly exists, create only what is missing. Do not recreate, empty, or reorder folders that are already there — ask the user what the pre-existing structure was for instead of guessing.
- **Restate the goal before touching anything.** Legacy classification is defined relative to the *current goal*; if the goal is wrong, every "legacy" call is wrong.

## 2. Step A — Establish and confirm the current goal

The "current goal" is the yardstick for active-vs-legacy. Establish it in this order:

1. **Read `PLAN.md`** (if present) — the Sizing & Rationale plus the in-progress phase tell you what the project is currently about.
2. **If no `PLAN.md`** — synthesize a candidate goal by reading the *heads* of the most substantive files in the folder (see below) and inferring the project's subject and stage.
3. **Always restate it back and get confirmation**, e.g.: *"Reconciling against this goal — Tier 2 Brownfield AP refactor, currently mid-Build. Anything in the folder that isn't about that is a candidate for legacy. Correct?"* Wait for a yes before classifying.

If the user responds that the goal has **changed** (a rescope), stop — see [section 8](#8-rescope--hard-stop).

## 3. Step B — Classify each file (content-aware)

Do not classify on filename alone — a file named `notes.md` could be the signed BRD or a stale scratchpad. Read the **head** of each file (first ~30–50 lines, or the first KB) and combine it with filename signals.

**Signals for `phase root` (official deliverable):**
- Title/H1 matches a known deliverable (BRD, SDD, Charter, Roadmap, RTM, Test Plan, Cutover Checklist…).
- Has a document header, version, sign-off, or requirement IDs (FR-xx, TR-xx).
- Filename matches a template name from the framework.

**Signals for `assets/` (input):**
- An empty or near-empty template (headings, placeholders, no real content).
- Image/binary (`.png`, `.jpg`, `.xlsx` source extract, `.pdf` reference).
- Reference material clearly pulled *in* (vendor docs, legacy exports used as source).

**Signals for `artifacts/` (unofficial/working):**
- One-off report, audit, review, meeting notes, scratch analysis.
- Throwaway or experimental code not part of a deliverable.
- Anything that reads as working output but is not on the official deliverable list.

**Signals for `_legacy/` (stale):**
- Filename or content carries `old`, `v1`, `draft`, `backup`, `copy`, `DEPRECATED`, a superseded date.
- Content is about a subject or scope that **no longer matches the confirmed current goal**.
- A superseded earlier version of a file that also exists in a more current form.

> **Legacy rule:** an item is legacy when its **name *or* its content does not match the current goal/structure exactly.** When genuinely ambiguous between active and legacy, default to active and flag it in the plan for the user to redirect — never silently bury a file that might be live.

**Which phase?** Map the file's subject to a phase using the deliverable lists in `framework_tree.md` (requirements → `01_Discovery`, design/fit-gap → `02_Design`, scripts/config → `03_Build`, data maps → `04_Data`, tests → `05_Testing`, training → `06_Training`, cutover → `07_GoLive`). Tier 3 collapses these into `Discovery_Design` / `Build_Test` / `Deployment`.

## 4. Step C — Build the dry-run move plan

Present a single table the user can scan before anything moves:

```text
| # | Source (current path)        | Destination                        | Class   | Why |
|---|------------------------------|------------------------------------|---------|-----|
| 1 | ./AP requirements.docx       | 01_Discovery/BRD_AP.md             | active  | Has FR-xx IDs, reads as the BRD |
| 2 | ./screenshots/flow.png       | 02_Design/assets/flow.png          | active  | Reference image |
| 3 | ./old_brd_v1.md              | 01_Discovery/_legacy/old_brd_v1.md | legacy  | Superseded by #1 |
| 4 | ./random_payroll_notes.md    | 99_Legacy/random_payroll_notes.md  | legacy  | Subject not in current goal |
```

Below the table, summarize counts (N active, M legacy, K unmapped/uncertain) and explicitly list anything you defaulted to active because it was ambiguous, so the user can correct before approval.

## 5. Step D — Move, after one approval

Ask once: *"Approve this move plan? I'll execute all moves, then log the result."* On approval:
- Execute every move (create missing destination folders as needed).
- Apply collision handling ([section 7](#7-collisions)).
- Write the run summary and the first `CHANGELOG.md` entry (date, counts, notable redirects).

## 6. Legacy placement (hybrid)

Two legacy destinations, chosen by whether the item maps to a phase:

- **Mappable but superseded** → that phase's own quarantine: `0X_Area/_legacy/` (e.g. `03_Build/_legacy/old_script_v1.js`). Keeps the stale item beside its current counterpart.
- **Unmappable** (matches no phase / no longer part of this project) → single root quarantine: `99_Legacy/`, preserving the original relative subpath beneath it so provenance is obvious.

`_legacy/` and `99_Legacy/` are created only when something actually goes into them.

## 7. Collisions

If two source files resolve to the same destination path, **never overwrite**. Keep both by suffixing the later one before its extension — `report.md`, `report__2.md`, `report__3.md` — and flag every suffixed collision in the run summary so the user can decide which to keep. Silent overwrite on real project data is unacceptable.

## 8. Rescope — hard stop

If, while confirming the goal (or at any point), the user signals the project's **scope or goal has changed** — not "file this," but "we're doing something different now" — **stop immediately**:

- Do not move or reclassify anything; leave the folder exactly as it is.
- Reconciliation depends on a stable goal; against a moving goal every active/legacy call is unreliable.
- Point the user to the **most appropriate scoping or grilling skill currently in their skill list** to re-establish scope first — choose it dynamically from what is actually available (e.g. a sizing/scoping or a "grill me" skill); **do not hardcode a skill name**.
- Resume reconciliation only once a fresh, confirmed goal exists (in `PLAN.md` or restated and agreed).
