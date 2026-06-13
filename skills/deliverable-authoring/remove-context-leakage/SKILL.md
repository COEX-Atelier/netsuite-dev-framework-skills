---
name: remove-context-leakage
description: "Edits a draft to remove the marks of AI authorship before it reaches a reader. Two targets: context that leaked in from the request (the date it was written, the asker's name or email, the model's identity, lines like 'based on the documents you shared' or 'as requested'), and the generated-text voice (throat-clearing openers, reflexive praise, helpdesk sign-offs, inflated words, lists always three items long). Trigger on remove context leakage, de-AI a draft, or make this read like I wrote it."
---

# Remove context leakage

When a model drafts a document, things bleed in that the author would never have written. Strip both kinds, then leave the writing alone.

**Leaked context** — traces of the request, not the document. The date it happened to be generated, the name or email of whoever asked, the model's own identity, asides like "based on the documents you shared," "as you requested," "not specific to your case." The reader was never in that conversation. Cut anything that only makes sense if they were.

**The generated voice** — the house style of machine text:
- openers that clear their throat: "It's worth noting," "It's important to understand," "In today's landscape"
- reflexive praise and sign-offs: "Great question," "Certainly," "I hope this helps," "Feel free to"
- inflated stand-ins for plain words: leverage, utilize, robust, delve, "a testament to," "navigate the complexities of"
- rhythm tells: every list exactly three items, every paragraph the same length, an em-dash in every other sentence

Loosen the rhythm the way a person writing quickly would.

## Running the pass

- Read the whole draft first, then edit in place. Change wording, never meaning — keep the facts, the structure, and the author's choices.
- When something might be deliberate (a date the document is meant to carry, a real term of art, a name that belongs in the text), leave it and flag it instead of scrubbing it.
- Don't overcorrect into clipped, choppy prose. Natural writing still flows; you're removing tells, not voice.
- Close with one line on what you cut, so the author sees the pattern next time.
