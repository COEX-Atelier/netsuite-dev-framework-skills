---
name: deleak
description: "Strips AI context-leakage and telltale phrasing from a file, leaving natural prose. Use to clean a draft of injected-context references (today's date, user name, model identity, \"based on the context provided\") and overused AI tics before sharing. Trigger on de-AI, remove AI tells, naturalize, clean up this draft, or context leakage."
---

# deleak

Edit the target file in place (or the supplied text). Make only the changes below — never alter meaning, facts, or structure.

1. **Cut context leakage** — delete references the writer would not naturally include: today's date, the user's name/email, model identity, "as of my knowledge cutoff", "based on the context/documents provided", "you mentioned", "per your request".
2. **Strip AI tics** — remove or rewrite: "It's important/worth noting", "Certainly!", "Great question", "I hope this helps", "Feel free to", "In today's fast-paced world", "In conclusion", and filler "Furthermore/Moreover".
3. **Replace inflated diction** — delve→go into, leverage→use, robust→solid, utilize→use; drop "testament to", "tapestry", "navigate the landscape", "underscore".
4. **Break the tells** — undo rule-of-three padding, "Not only X but also Y", uniform paragraph lengths, and decorative em-dashes; vary sentence rhythm.
5. **Leave a one-line summary** of what you changed; if a phrase might be intentional, flag it instead of editing.
