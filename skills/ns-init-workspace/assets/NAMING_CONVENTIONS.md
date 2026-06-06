# Naming Conventions & Governance

The single source of truth for how things are named and where they live in this workspace. `ns-init-workspace` creates and maintains the folder structure; this document records the conventions every agent and human must follow. `PLAN.md` points here.

## Folder structure

- **Structural folder names are always English** — `01_Discovery`, `0_Governance`, `assets`, `artifacts`, `_legacy`, `99_Legacy` — regardless of the project's content language. Stable English paths keep automation and cross-skill references working.
- **Canonical spelling is `artifacts` (US)**, not `artefacts`. This matches the dominant convention in agent/CI tooling and avoids fighting muscle memory and future automation.
- Each phase folder holds:
  - **official deliverables** at its root (BRD, SDD, Test Plan…),
  - **`assets/`** — inputs: pictures, empty templates, reference material, source data,
  - **`artifacts/`** — unofficial work: one-time reports, throwaway code, reviews, audits,
  - **`_legacy/`** — superseded items (created on demand).

## Document language

- Document **content** follows the `Language` field in `PLAN.md`. Folder and structural names do **not** — they stay English.
- Never mix languages within a single deliverable.

## File placement (four-way sort)

| Goes to | What belongs there |
|---------|--------------------|
| phase root | Official, signed-off deliverables |
| `assets/` | Inputs — pictures, empty templates, reference material, source data |
| `artifacts/` | Unofficial/working output — reports, throwaway code, reviews, audits |
| `_legacy/` | Stale items whose name or content no longer matches the current goal |

## Document naming

- Deliverables: `[Deliverable]_[Area].md` (e.g. `SDD_O2C.md`, `BRD_AP.md`).
- Dates in filenames and logs: `YYYY-MM-DD`.

## NetSuite internal IDs

For NetSuite customization internal IDs (custom fields, records, scripts, searches), follow the prefix conventions maintained by the `ns-configurator` skill — e.g. `custbody_[proj]_[name]`, `custcol_[proj]_[name]`, `customrecord_[proj]_[name]`, `customsearch_[proj]_[name]`. Define the project prefix once and use it everywhere; internal IDs are permanent once data is entered.
