Run the `ns-session-retrospective` skill for this session.

If the user provided a scope hint, use it: $ARGUMENTS

Execute the full skill workflow defined in `skills/ns-session-retrospective/SKILL.md`:

1. **Step 0 — Language detection:** Check for `PLAN.md` and read the `Language:` field. If absent, infer from the dominant language used in this conversation.

2. **Step 1 — Context gathering:** In workspace mode (PLAN.md found), confirm session scope and skills used. In standalone mode, ask for: task worked on, skills invoked, tools used, and known friction points. Accept "figure it out" as a valid answer and reconstruct from conversation context.

3. **Co-Writing Protocol — Phase A:** Present the three retrospective sections as a list, flag which ones need user confirmation, and get approval on the structure before writing anything.

4. **Stages 1–2 — Reconstruct and write:** Build the internal session inventory, apply the privacy filter (strip all client names, record IDs, file paths, personal names, URLs), then write the retrospective section-by-section using `skills/ns-session-retrospective/assets/Retrospective_Template.md` as the base.

5. **Stage 3 — Quality gate:** Verify all checklist items before moving to review.

6. **Co-Writing Protocol — Phase C:** Present a 3–5 bullet summary, request explicit user approval. Do not publish until the user confirms.

7. **Stage 4 — Publish:** Create a GitHub issue in `COEX-Atelier/netsuite-dev-framework-skills` with label `retrospective`. Report the issue URL.
