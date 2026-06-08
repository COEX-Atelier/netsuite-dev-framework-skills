---
name: ns-init-project
description: "[Step 0 — Project Init] Classifies a NetSuite project by Origin (Greenfield/Brownfield) and Scale (Tier 1/2/3), confirms the recommendation with the user, then hands off to ns-init-workspace for folder scaffolding and PLAN.md creation. Use at the very start of any new NetSuite project — before any phase work begins."
---

# NS Init Project

You classify the project before any phase work begins. Two questions decide everything: **Origin** and **Scale (Tier)**. Once confirmed, you hand off to `ns-init-workspace` to scaffold the folder tree and seed `PLAN.md`.

> Full sizing guidance: [references/0_project_sizing.md](references/0_project_sizing.md)

---

## Step 0 — Gather Context

Ask the minimum questions needed to classify the project. You do not need a full BRD — just enough to determine Origin and Tier.

Key questions:
1. **Is there an existing ERP or NetSuite environment being replaced or refactored?** (→ Origin)
2. **What is the scope of work?** (Full migration, new module, or a small tweak?) (→ Tier)
3. **What language should project deliverables be written in?** (→ sets `Language:` in PLAN.md)

If the user supplies context upfront (e.g., "we're adding the ARM module to an existing NetSuite"), derive the classification directly — no need to ask what you already know.

---

## Step 1 — Classify

Determine:
- **Origin:** Greenfield (no legacy system) or Brownfield (replacing/refactoring an existing system).
- **Tier:** 1 (Full Implementation), 2 (Module/Refactoring), or 3 (Tiny Enhancement).

See [references/0_project_sizing.md](references/0_project_sizing.md) for the full classification matrix and decision rules.

---

## Step 2 — Confirm with User

Present your recommendation and rationale, then wait for explicit confirmation before proceeding.

**Example:**
> "Based on our discussion, I recommend classifying this as a **Tier 2 Brownfield** project because we are refactoring the Accounts Payable process while replacing the legacy Bill.com integration. This means we will use a focused BRD and a standard deployment checklist. Does this classification sound right, or should we adjust?"

**Do not proceed until the user explicitly confirms (or adjusts) the classification.**

---

## Step 3 — Hand Off to ns-init-workspace

Once classification is confirmed, invoke `ns-init-workspace` with the confirmed values. Pass:
- **Tier** (1, 2, or 3)
- **Origin** (Greenfield or Brownfield)
- **Language** (if collected)
- **Project Name** (if known)

`ns-init-workspace` will scaffold the folder tree and seed `PLAN.md`, `CHANGELOG.md`, and `TODO.md`.

---

## Boundaries

- Does not scaffold folders or create `PLAN.md` — that is `ns-init-workspace`'s job.
- Does not run discovery, produce BRDs, or plan phases — that is `ns-erp-navigator`'s job.
- Does not re-classify mid-project; if scope has changed, re-run from Step 0.

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Origin and Tier classification matrix | [references/0_project_sizing.md](references/0_project_sizing.md) |
