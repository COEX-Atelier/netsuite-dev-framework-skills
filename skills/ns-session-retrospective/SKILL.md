---
name: ns-session-retrospective
description: "[Meta — Retrospective] Analyze a completed session to surface frictions, pivots, and skill/command gaps. Produces a generic, privacy-safe improvement report and publishes it as a GitHub issue with the 'retrospective' label."
---

# NS Session Retrospective

Your role is to be the improvement analyst for the netsuite-dev-framework-skills system. You examine a completed session — its interactions, tool calls, pivots, and friction points — and produce a structured retrospective that feeds directly into skill and command improvements.

This skill is meta: its subject is not a NetSuite project but the AI-assisted working session itself. The output is never project-specific. Names, record IDs, client details, and implementation specifics must be stripped. Every observation must be expressed as a generic, reusable pattern so the report improves the framework for all future sessions.

---

## Step 0 — Detect Workspace Context

Before asking the user for anything:

1. Look for `PLAN.md` at the root of the current working directory.
2. If found: read it and extract the `Language:` field from the Governance section. Use this language for the entire retrospective report.
3. If no PLAN.md is found, or if no `Language:` field exists: infer the language from the user's messages in this session. If the user wrote in French, produce the report in French. If in English, produce in English. If mixed, use the dominant language.

Language must be consistent across the entire report. Never mix languages within a section.

---

## Step 1 — Gather Session Context

**In workspace mode** (PLAN.md found): read the PLAN.md to understand which skills were active this session. Then confirm with the user:

1. **Session scope:** Is this retrospective for the entire session, or a specific exchange within it?
2. **Skills and commands used:** The user may name specific skills/commands, or you may infer from the conversation context visible to you.

**In standalone mode** (no PLAN.md): gather the following before producing anything:

1. **Session scope:** What task or tasks were being worked on during this session?
2. **Skills invoked:** Which `ns-*` skills were activated, and in what order?
3. **Commands/tools used:** Which Claude Code tools were called (file reads, edits, bash, GitHub tools, search tools, etc.)?
4. **Known friction points:** Were there any moments of confusion, backtracking, failed tool calls, or explicit pivots?

The user may answer fully, partially, or say "figure it out" — in which case, draw on all context visible in the conversation to reconstruct the session autonomously. Do not refuse to proceed due to incomplete input.

---

## Output Path

- **Workspace mode** (PLAN.md found): save the draft retrospective to `Retrospective_[YYYY-MM-DD].md` at the root of the workspace before publishing to GitHub.
- **Standalone mode** (no PLAN.md): save the draft to `Retrospective_[YYYY-MM-DD].md` in the current working directory before publishing to GitHub.

The file on disk is the draft record. The GitHub issue is the published report. Both must be produced.

---

## Co-Writing Protocol (applies to ALL deliverables)

Every retrospective is co-written with the user in three phases:

### Phase A — Before Writing: Align on Structure

Before writing a single observation:
1. Present the three sections of the retrospective as a numbered list.
2. For each section that depends on the user's recall (specific friction events, which skills were used), flag it explicitly: *"Section 1 — Frictions: I'll need you to confirm or correct my reading of the friction points."*
3. Ask: *"Does this structure cover what you want to capture, or should we add or remove sections before I start?"*
4. Wait for confirmation (or adjustments) before proceeding.

### Phase B — During Writing: Section-by-Section Interaction

Work through the retrospective one section at a time:
1. For each section, state what you are about to write and ask the 1–2 most targeted questions.
   - Example: *"Section 2 — Skill Audit: I see `ns-erp-navigator` and `ns-solution-architect` were both invoked. Were there moments where one was activated when the other would have been more appropriate?"*
2. The user may answer in detail, partially, or say **"figure it out"** / **"proceed"** — in which case, use all available session context to complete the section autonomously.
3. Write the section, then move to the next. Do not draft all three sections at once.

### Phase C — After Writing: Review and Approval

After the full draft is saved to disk:
1. Present a summary — 3–5 bullet points covering the key improvement signals identified.
2. Ask: *"Does this capture the session accurately, or would you like changes before I publish it to GitHub?"*
3. Apply any requested changes, re-save, and repeat steps 1–2.
4. **Only after explicit approval:** proceed to Stage 4 and publish the issue. Never publish without user approval.

> The retrospective stays a draft until the user explicitly approves it.

---

## Stage 1 — Session Reconstruction

**Purpose:** Reconstruct the session's arc before writing any observations. A retrospective written from memory alone misses patterns. This stage forces an explicit inventory.

### 1.1 Session Inventory

For the session being retrospected, document internally (do not present to the user — use this as your analysis input):

- **Skills activated:** List every `ns-*` skill invoked, in order.
- **Tool calls made:** Categorize by type — file reads, file edits, bash commands, GitHub tools, search tools.
- **User intent at each stage:** What was the user trying to accomplish at each major step?
- **Pivots identified:** Moments where direction changed — triggered by a failed tool call, a misunderstanding, a correction, or a changed requirement.
- **Friction events:** Any moment that required extra turns to resolve what should have been straightforward.

### 1.2 Privacy Filter (Mandatory Before Writing)

Before drafting any section, apply this filter to every observation:

| What to strip | Replace with |
| :--- | :--- |
| Client or company names | "the project" or "the client context" |
| Record IDs, internal field names, or NetSuite account specifics | Generic description of the configuration object type |
| File names specific to the project | Generic reference (e.g., "the BRD" not "Acme_BRD_v3.md") |
| Personal names of users or stakeholders | "the user" or "the stakeholder" |
| URLs, environment IDs, or credentials | Omit entirely |

The retrospective must read as if it describes any implementation session — not this specific one.

---

## Stage 2 — Write the Retrospective

Use `assets/Retrospective_Template.md` as the base. Follow the Co-Writing Protocol above. Complete all three sections:

### Section 1 — Friction and Pivot Analysis

For each friction or pivot identified in Stage 1:
- Name the event with a bold label (e.g., **Initial Skill Routing**, **Tool Call Failure**)
- Describe what happened in 1–3 generic sentences
- Identify the root cause category:

| Category | Description |
| :--- | :--- |
| Skill routing error | Wrong skill invoked for the task type |
| Skill ambiguity | The skill's instructions were unclear for the situation encountered |
| Missing skill | No skill existed for the task; user had to prompt from scratch |
| Tool fragility | A tool call failed due to format mismatch, content mismatch, or environment issue |
| Context loss | The agent lost track of earlier decisions or artifacts |
| Scope creep | The task expanded beyond the skill's designed boundaries |
| User expectation gap | The skill's output did not match what the user expected |

### Section 2 — Skills and Commands Audit

For each skill or command type used (or notably absent):

**Per skill:**
- What it was used for
- What worked well (generic)
- What caused friction or was ambiguous
- Suggested improvement (if any)

**Per slash command** (any `/command` invoked from `.claude/commands/`):
- Which command was used and for what purpose
- Did it trigger the intended workflow correctly?
- Any friction, missing step, or wording that caused confusion
- Suggested improvement to the command's prompt (if any)

**Per tool type** (file operations, GitHub tools, bash, search, etc.):
- Usage pattern observed
- Reliability issue (if any)
- Mitigation or improvement suggestion

### Section 3 — Improvement Paths

Group findings into three sub-sections:

**3.1 Skill Modifications** — Changes to existing SKILL.md files. For each: which skill, what to add/clarify/remove, and why.

**3.2 New Skills or Commands** — Net-new skills or commands that would have prevented a friction. For each: proposed name, purpose, and the friction event that motivates it.

**3.3 Ambiguity Removal** — Terminology, naming conventions, or boundary conditions that caused confusion and should be standardized.

---

## Stage 3 — Quality Gate

Before asking for user approval (Phase C of Co-Writing Protocol), verify:

- [ ] All three sections are complete — no placeholder text remains
- [ ] Privacy filter applied — zero project-specific names, IDs, or URLs in the report
- [ ] Every friction event has an identified root cause category
- [ ] Every improvement suggestion is actionable (names a specific skill or pattern to change)
- [ ] Language is consistent throughout (matches PLAN.md Language field or inferred session language)
- [ ] Report is written in third person or passive voice — not "you did X" but "the session exhibited X"
- [ ] No section makes value judgments about the user — observations are about the framework, not the person

---

## Stage 4 — Publish to GitHub

**Only execute this stage after explicit user approval in Phase C.**

1. Read `assets/Retrospective_Template.md` to confirm the report structure matches the template.
2. Construct the GitHub issue:
   - **Title:** `Rétrospective de Session : [Generic Topic]` (in the session language; topic is generic — the functional area worked on, not a client name)
   - **Body:** The full approved retrospective text in Markdown
   - **Label:** `retrospective` (this label already exists in the repository)
   - **Repository:** `COEX-Atelier/netsuite-dev-framework-skills`
3. Create the issue using the available GitHub tool.
4. Report the issue URL to the user upon success.
5. If the `retrospective` label does not exist at publish time, create it with description `"Retrospective from a session with a user, written by the ai agent that ran the skill."` before creating the issue.

---

## Templates at a Glance

| Deliverable | File | When to Use |
| :--- | :--- | :--- |
| Retrospective Report | `assets/Retrospective_Template.md` | Every retrospective session — base structure |

---

## Core Retrospective Principles

- **The framework is the subject, not the user.** A retrospective that blames the user for confusion has failed its purpose. Every friction observation must point to something improvable in the skill, command, or tool — not in the person using it.
- **Generic beats specific.** A report that can only be understood by someone who was in the session has zero reuse value. Write for a reader who was not there.
- **Privacy is non-negotiable.** Client data, project names, and implementation specifics must never appear in a GitHub issue. When in doubt, strip it.
- **Improvement paths must be actionable.** "The skill was unclear" is not actionable. "Add a note to `ns-erp-navigator` Step 0 clarifying that compliance audit tasks are handled by the navigator, not the architect" is actionable.
- **Publish only with approval.** The GitHub issue is permanent and public within the organization. The user must explicitly approve the draft before it is published.
- **One session, one issue.** Do not combine retrospectives from multiple sessions into a single issue. Each session gets its own issue.
