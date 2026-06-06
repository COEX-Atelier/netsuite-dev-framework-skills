# NetSuite Framework Workspace Tree

This is the canonical folder structure `ns-init-workspace` builds and reconciles against. It is the **split/substructure** model — coordination documents are split out from the phase tree, and every phase folder carries a uniform `assets/` + `artifacts/` substructure.

> **Why this shape.** The old model kept everything (plan, decisions, deliverables) tangled inside a single monolithic tree. Splitting the live coordination docs to the root and giving each phase a predictable in/out/quarantine substructure means any agent or human can find — and correctly file — work without guessing.

---

## Table of Contents
1. [Root coordination layer](#1-root-coordination-layer)
2. [Phase folders — Tier 1 & 2](#2-phase-folders--tier-1--2)
3. [Phase folders — Tier 3](#3-phase-folders--tier-3)
4. [The per-phase substructure](#4-the-per-phase-substructure)
5. [The four-way sort](#5-the-four-way-sort)
6. [Naming and language rules](#6-naming-and-language-rules)

---

## 1. Root coordination layer

Present at every tier:

```text
PLAN.md                       # slim live plan — sizing, rationale, phase status table, governance pointer
CHANGELOG.md                  # audit trail (Keep a Changelog format); init/reconcile is the first entry
BACKLOG.md                    # deferred / out-of-scope / parked items
0_Governance/
  NAMING_CONVENTIONS.md       # the governance doc PLAN.md points to
```

`0_Governance/` sorts first (the `0_` prefix) because it governs everything below it.

## 2. Phase folders — Tier 1 & 2

```text
01_Discovery/        # BRD, Project Charter, Implementation Roadmap, Interview Notes, System Landscape
02_Design/           # SDD, Fit-Gap Analysis, RTM, Integration Specs
03_Build/            # Configuration Workbook, Scripts, Workflow Design Docs, Naming Conventions artifact
04_Data/             # Data Mapping Dictionaries, Cleansing rules, validated CSVs
05_Testing/          # Test Plan, UAT Scripts, Defect Log, Test Summary Report
06_Training/         # Training Matrix, SOPs, User Guides, training schedule
07_GoLive/           # Cutover Checklist, Go/No-Go, Hypercare Log, post-mortem
```

Each phase folder carries the [per-phase substructure](#4-the-per-phase-substructure).

## 3. Phase folders — Tier 3

Tier 3 (Tiny Enhancement) collapses the seven phases into three, but keeps the **same** per-phase substructure (uniform behavior — agents never special-case a tier):

```text
Discovery_Design/    # Simplified 1-page Functional Spec
Build_Test/          # Implementation notes, Smoke Test Checklist
Deployment/          # Deployment Checklist
```

The root coordination layer (`PLAN.md`, `CHANGELOG.md`, `BACKLOG.md`, `0_Governance/`) is identical to Tiers 1 & 2.

## 4. The per-phase substructure

Inside **every** phase folder (Tier 1, 2, and 3 alike):

```text
0X_Phase/
  <official deliverables live here at the folder root>   # BRD.md, SDD_O2C.md, Test_Plan.md ...
  assets/        # INPUTS — pictures, empty templates, reference material, source data brought into the phase
  artifacts/     # UNOFFICIAL work — one-time reports, throwaway code, reviews, audit notes, scratch analysis
  _legacy/       # ON DEMAND — superseded items that no longer match the current goal (created only when needed)
```

- `assets/` and `artifacts/` are **scaffolded empty at init** — they are the standard home for every phase's work, so a predictable skeleton lets people drop files in the right place without thinking.
- `_legacy/` is created **only when something needs to go there** — it is the exception, not the norm, so empty `_legacy/` folders never litter the tree.

## 5. The four-way sort

Every file encountered during reconciliation lands in exactly one of four places within its phase:

| Destination | What belongs there |
|-------------|--------------------|
| **phase root** | Official, signed-off deliverables (BRD, SDD, Test Plan, Charter, Cutover Checklist…) |
| **`assets/`** | Inputs: pictures, empty templates, reference material, source data pulled *into* the phase |
| **`artifacts/`** | Unofficial/working output: one-time reports, throwaway code, reviews, audit reports — anything *not* an official deliverable |
| **`_legacy/`** | Stale: name *or* content no longer matches the current project goal/structure |

Unmappable stale items (those that match no phase) go to a single root quarantine: `99_Legacy/` (see the reconciliation playbook).

## 6. Naming and language rules

- **Structural folder names are always English** — `01_Discovery`, `0_Governance`, `assets`, `artifacts`, `_legacy`, `99_Legacy` — regardless of the project's content language in `PLAN.md`. Only *document content* follows the language rule. Stable English paths keep automation and cross-skill references working.
- **Canonical spelling is `artifacts` (US)**, not `artefacts`. This matches the dominant convention in agent/CI tooling (build artifacts, `upload-artifact`, MLflow) and avoids fighting muscle memory and future automation.
