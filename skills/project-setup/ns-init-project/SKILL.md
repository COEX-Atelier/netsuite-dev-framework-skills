---
name: ns-init-project
description: "[Step 0 — Project Init] Classifies a NetSuite project by Origin (Brownfield/Greenfield) and Scale (Tier 1/2/3), captures the dev environment (account/sandbox, SDF codebase, where code lives), confirms with the user, then hands off to ns-init-workspace for folder scaffolding and PLAN.md creation. Use at the very start of any new NetSuite project — before any phase work begins."
---

# NS Init Project

You classify the project before any phase work begins. Two questions decide the governance level — **Origin** and **Scale (Tier)** — and along the way you also capture *where the work happens* (account/sandbox, SDF codebase, dev location). Once confirmed, you hand off to `ns-init-workspace` to scaffold the folder tree and seed `PLAN.md`.

> Full sizing guidance: [references/0_project_sizing.md](references/0_project_sizing.md)

---

## Step 0 — Gather Context

Ask the minimum questions needed to classify the project and locate where the work happens. You do not need a full BRD — just enough to determine Origin, Tier, and the dev environment.

**Classification questions:**
1. **Are we changing an existing area of the account, or standing up something net-new?** (→ Origin — almost always Brownfield for internal work)
2. **What is the scope of work?** (A new module/integration, a process/workflow refactor, or a small enhancement?) (→ Tier)
3. **What language should project deliverables be written in?** (→ sets `Language:` in PLAN.md)

**Dev-environment questions** (so downstream build skills know where code lives):
4. **Which account/sandbox does this target, and is there a sandbox branch for the work?**
5. **Where is the SDF codebase** (path or repo URL), and **is there a local files directory** for working material?
6. **Where does the coding happen** — in this project folder directly, a remote repo, or another local path?

If the user supplies context upfront (e.g., "we're adding the ARM module to our existing NetSuite, code lives in the `acme-sdf` repo"), derive what you can directly — no need to ask what you already know.

---

## Step 1 — Classify

Determine:
- **Origin:** Brownfield (changing an existing area of an established account — the common case) or Greenfield (a genuinely net-new area with nothing to preserve).
- **Tier:** 1 (Major Initiative), 2 (Process/Workflow Refactor), or 3 (Small Enhancement).

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
- **Origin** (Brownfield or Greenfield)
- **Language** (if collected)
- **Project Name** (if known)
- **Environment** — account/sandbox, sandbox branch, SDF codebase location, local files directory, and where coding happens (this folder | remote repo | another local path)

`ns-init-workspace` will scaffold the folder tree and seed `PLAN.md` (including its **Environment** section), `CHANGELOG.md`, and `TODO.md`.

---

## Boundaries

- Does not scaffold folders or create `PLAN.md` — that is `ns-init-workspace`'s job.
- Does not run discovery, produce BRDs, or plan phases — that is `ns-erp-navigator`'s job.
- Does not set up the GitHub/SDF deploy pipeline — that is `ns-github-setup`'s job, a separate one-time step run **before Phase 3 build**. When capturing the SDF codebase in Step 0, note for the user that `ns-github-setup` should be run on that repository before build begins; `ns-init-workspace` seeds a `TODO.md` item for it.
- Does not re-classify mid-project; if scope has changed, re-run from Step 0.

---

## Reference Quick Links

| Topic | File |
|-------|------|
| Origin and Tier classification matrix | [references/0_project_sizing.md](references/0_project_sizing.md) |
