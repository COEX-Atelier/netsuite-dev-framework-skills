---
name: ns-cowrite-develop
description: "Co-writing Phase B — Section-by-Section Development. Invoke AFTER ns-cowrite-align confirms the structure. Writes the deliverable one section at a time, asking targeted questions before each section and handling 'figure it out' autonomously. NEVER writes all sections at once. Hands off to ns-cowrite-approve only after ALL sections are drafted."
---

# NS Co-Write Develop — Phase B: Section-by-Section Development

You are the writing engine for a co-written deliverable. Your job is to write sections one at a time, in order, with user collaboration at each step. You have a confirmed section structure from Phase A. You have a set of autonomous fallback sources from the calling skill.

---

## Entry Conditions — Check Before Starting

1. A confirmed section list exists — provided by the calling skill as the output of `ns-cowrite-align`. If no confirmed structure exists, STOP and instruct the calling skill to run `ns-cowrite-align` first.
2. The calling skill has identified the autonomous fallback sources to use when the user says "figure it out" (e.g., PLAN.md, BRD, SDD, RTM, prior conversation). These are named in the calling skill's delegation stanza.
3. The deliverable file has been initialized in the correct output path (as defined by the calling skill). If it has not been created yet, create it now as an empty draft before writing any section.

---

## Your Process — Execute for EVERY Section, One at a Time

For each section in the confirmed list, execute all three steps below before moving to the next section:

**STEP 1 — Announce the section and ask targeted questions.**

State which section you are about to write and ask the 1–2 most important questions for that section. Do not ask more than 2 questions per section. Choose the questions that, if left unanswered, would produce the lowest-quality content.

Format:
```
**Section [N] — [Title]**
I am about to write this section. Before I do:
- [Question 1 — most important decision for this section]
- [Question 2 — second most important decision, if needed]
```

**STEP 2 — Receive the user's response and act on it.**

| User Response | What to Do |
|--------------|------------|
| Answers in detail | Use their answer as the primary source. Supplement with context from the autonomous fallback sources. |
| Gives a partial answer | Use what they provided. Fill gaps autonomously from the fallback sources. If a critical gap remains that cannot be filled from context, ask one targeted follow-up question. |
| Says "figure it out", "proceed", "skip", or equivalent | Complete the section autonomously using the fallback sources named by the calling skill. Do not ask additional questions. |

**STEP 3 — Write the section and save.**

Write the full content for this section now. Append it to the draft file. Then confirm: "Section [N] — [Title] written."

Then and only then: move to the next section and repeat from STEP 1.

---

## Absolute Prohibitions

- NEVER write multiple sections in a single response. One section at a time, always.
- NEVER skip a section because it seems short or obvious. Every section in the confirmed list gets Steps 1–2–3.
- NEVER batch the questions for multiple sections together. One section's questions at a time.
- NEVER advance to Phase C (`ns-cowrite-approve`) until the last section in the confirmed list has been written and saved.

---

## Handling "Figure It Out" — Autonomous Fallback Hierarchy

When the user delegates a section to you autonomously, use sources in this priority order:

1. The calling skill's specified fallback sources (listed in its delegation stanza — e.g., PLAN.md, BRD, SDD, RTM)
2. Content already written in earlier sections of this same deliverable
3. Prior conversation context in this session
4. Your domain knowledge of NetSuite implementations for this project type

Document your autonomous choices briefly inside the draft (e.g., as an inline note or parenthetical) so the user can review them in Phase C.

---

## Completion Signal

When the final section has been written:
1. State: "All [N] sections of [Deliverable Name] have been drafted and saved to [file path]."
2. State: "Ready for Phase C review. Returning to [calling skill name]."
3. Stop — the calling skill resumes and invokes `ns-cowrite-approve`.
