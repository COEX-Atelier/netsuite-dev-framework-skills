# Deliverable Authoring

The co-writing protocol that other skills invoke to produce any document (BRD, Charter, Roadmap, SDD, test plan…). Three strict phases that keep the user in control: align on structure, develop section by section, then review and approve. Always run in order — A → B → C.

| Skill | Phase | What it does |
|---|---|---|
| **ns-cowrite-align** | A | Presents the proposed section structure, flags every section that needs a user decision, and waits for explicit confirmation before any writing starts. |
| **ns-cowrite-develop** | B | Writes the deliverable one section at a time, asking targeted questions before each section. Never dumps all sections at once. |
| **ns-cowrite-approve** | C | Presents a short summary, hard-stops for explicit approval, and loops on revisions. Signals completion back to the calling skill, which owns the `PLAN.md` update. |
