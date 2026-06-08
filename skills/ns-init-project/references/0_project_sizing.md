# NetSuite Project Sizing & Typology Framework

Before any phase work begins, classify the project by its **Origin** and **Scale (Tier)**. This classification determines the governance level, required documentation, and how the workspace is organized.

This framework is written for an **internal NetSuite development team** working in its own established account — not for consultants migrating a full ERP from another company. Sizing is about how much process and ceremony a change warrants.

---

## Step 0 — Classification

Gather context from the user to answer these two questions.

### 1. What is the Project Origin?
- **Brownfield (the common case for internal work):** Building on an established NetSuite account with existing configuration, data, and live users — e.g., replacing an integration, refactoring a workflow, or adding a module alongside what's already there.
  - *Impact:* Requires an "As-Is" review of the affected area, regression awareness (don't break live processes), and a data/cutover plan whenever existing records are touched.
- **Greenfield:** A net-new area with no existing configuration or data to preserve — e.g., a brand-new process or subsidiary stood up from scratch.
  - *Impact:* Skip As-Is mapping and legacy data migration for that area.

> For an internal dev team working in an established account, projects are almost always **Brownfield**. Treat Greenfield as the exception — reserved for genuinely net-new process areas.

### 2. What is the Project Scale (Tier)?

| Tier | Description | Key Deliverables Required |
| :--- | :--- | :--- |
| **Tier 1: Major Initiative** | A new module implementation, a system replacement, or an integration/change that spans multiple processes end-to-end (e.g., standing up Advanced Revenue Management, replacing a legacy integration, reworking Order-to-Cash). | Full BRD, Project Charter, Detailed Roadmap, Cutover/Deployment Runbook. |
| **Tier 2: Process / Workflow Refactor** | Refactoring a significant but isolated business process or workflow, or a focused single-purpose integration (e.g., reworking the AP approval flow, adding a Fixed Assets sub-process). | Focused BRD (subset of template), Updated Roadmap, Standard Deployment Checklist. |
| **Tier 3: Small Enhancement** | An isolated change — new forms, fields, scripts, saved searches, or a small process tweak (e.g., a custom field + client script). | Simplified Functional Spec (1-page), Smoke Test Checklist. Merges Discovery/Design. |

---

## Step 1 — User Confirmation

Once you have gathered enough context, formulate a recommendation and present it to the user.

**Example Prompt:**
> "Based on our discussion, I recommend classifying this as a **Tier 2 Brownfield** project because we are refactoring the Accounts Payable approval workflow and replacing the legacy Bill.com integration in our existing account. This means a focused BRD and a standard deployment checklist. Does this classification sound right, or should we adjust the governance level?"

**YOU MUST obtain explicit user confirmation before proceeding.**

---

## Step 2 — Hand Off

Classification is the whole job of this reference. Once Origin and Tier are confirmed, hand the values to `ns-init-workspace`, which owns folder scaffolding and the creation of `PLAN.md`. Do not scaffold folders or write `PLAN.md` here.
