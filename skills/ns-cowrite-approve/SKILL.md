---
name: ns-cowrite-approve
description: "Co-writing Phase C — Review and Approval. Invoke AFTER ns-cowrite-develop completes all sections. Presents a 3-5 bullet summary, HARD STOPS awaiting explicit approval, loops on revisions, and signals completion back to the calling skill WITHOUT updating PLAN.md. PLAN.md update is the calling skill's responsibility."
---

# NS Co-Write Approve — Phase C: Review and Approval

You are the approval gate for a co-written deliverable. The draft is complete. Your job is to present it for review, apply revisions, and obtain explicit approval before signaling completion. You do NOT update PLAN.md. You do NOT run quality gates. You do NOT declare completion without the user saying so.

---

## Entry Conditions — Check Before Starting

1. The draft file exists on disk and all sections are populated. If any section is empty or contains placeholder text, STOP and return to `ns-cowrite-develop` to complete that section first.
2. The calling skill is identified. You will signal completion back to it, not proceed independently.

---

## Your Process — Execute All Steps

**STEP 1 — Present the summary.**

Read the full draft. Then present a summary of 3–5 bullet points covering:
- The key decisions made (scope choices, design decisions, significant tradeoffs)
- Any sections completed autonomously (flagged as "I completed this based on [source]")
- Any open questions or assumptions the user should verify

Format:
```
**[Deliverable Name] — Draft Summary**
- [Key decision or content highlight 1]
- [Key decision or content highlight 2]
- [Key decision or content highlight 3]
- [Autonomous choices made, if any]
- [Open questions or assumptions, if any]
```

**STEP 2 — Ask for explicit approval. Use this exact question:**

> "Does this meet your expectations, or would you like changes before I finalize it?"

**STEP 3 — STOP. Wait for the user's response.**

Do not finalize. Do not update PLAN.md. Do not run the quality gate. Do not signal completion. Wait.

**STEP 4 — Act on the user's response.**

| User Response | What to Do |
|--------------|------------|
| Explicit approval: "yes", "approved", "looks good", "finalize it", "ship it", or equivalent | Proceed to STEP 5. |
| Requests changes | Apply all requested changes to the draft file, re-save, then return to STEP 1 (present updated summary) and STEP 2 (ask again). |
| Ambiguous response (e.g., "it's fine" without confirming changes are addressed, or partial feedback) | Apply what was clearly requested, then re-present and ask: "I've applied [list of changes]. Does this now meet your expectations?" |
| Says "close enough" or "good for now" without explicit approval | Do NOT treat this as approval. Ask: "To confirm — are you approving this draft for finalization, or do you want to revisit it later?" |

**Approval must be explicit. Silence is not approval. "It's fine" is not approval. Ambiguity requires re-asking.**

**STEP 5 — Signal completion to the calling skill.**

State: "**[Deliverable Name] is approved.** The draft at [file path] is finalized."
State: "Returning to [calling skill name]. The calling skill will now [describe the post-approval action as documented in the calling skill — e.g., 'run the quality gate checklist' or 'update PLAN.md']."

Do not take the post-approval action yourself. Stop here.

---

## Absolute Prohibitions

- NEVER update PLAN.md. That is the calling skill's responsibility.
- NEVER run the quality gate checklist. That is the calling skill's responsibility.
- NEVER treat implicit agreement as explicit approval.
- NEVER signal completion before the user uses explicit approval language.
- NEVER exit the revision loop early because revisions seem minor. Every revision restarts from STEP 1.

---

## Revision Loop — No Exit Without Approval

Every time the user requests changes:
1. Apply changes → re-save draft
2. Present updated summary (STEP 1)
3. Ask approval question (STEP 2)
4. Wait (STEP 3)
5. Evaluate response (STEP 4)

This loop has no maximum iteration count. The document stays a draft until the user explicitly approves it.
