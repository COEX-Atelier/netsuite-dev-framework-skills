# Session Retrospective Report

<!-- This template is used by ns-session-retrospective.
     All placeholders in [brackets] must be filled before publishing.
     Apply the privacy filter from Stage 1.2 before completing any section.
     Generic language only — no client names, project IDs, or environment specifics. -->

| Field | Value |
| :--- | :--- |
| **Session Topic** | [Generic description of the work done — e.g., "Phase 1 Discovery deliverables" or "SuiteScript development for an approval workflow"] |
| **Session Date** | [YYYY-MM-DD] |
| **Skills Invoked** | [Comma-separated list — e.g., `ns-erp-navigator`, `ns-solution-architect`] |
| **Produced By** | ns-session-retrospective |

---

## 1. Analyse des Frictions et Pivots

<!-- List each friction or pivot as a bullet with a bold label.
     Add the root cause category in parentheses at the end of each entry.
     Minimum 2 entries; add as many as the session warrants.
     Root cause categories: skill routing error | skill ambiguity | missing skill |
     tool fragility | context loss | scope creep | user expectation gap -->

- **[Event Label — e.g., Initial Skill Routing]:** [1–3 sentences describing what happened and why it was a friction point. Generic — no project specifics.] *(Root cause: [category])*

- **[Event Label — e.g., Tool Call Failure]:** [Description.] *(Root cause: [category])*

- **[Event Label]:** [Description.] *(Root cause: [category])*

---

## 2. Audit des Skills et Commandes

<!-- One sub-section per skill used. One sub-section per tool/command type used.
     Keep observations generic and framework-oriented.
     Add or remove skill and tool sections based on what was used. -->

### Skills

#### `[skill-name]`
- **Used for:** [Generic description of the task]
- **What worked:** [Generic strength observed]
- **Friction or ambiguity:** [What was unclear or caused extra turns — or "None" if clean]
- **Suggested improvement:** [Specific, actionable change — or "None"]

#### `[skill-name]`
- **Used for:** [Description]
- **What worked:** [Strength]
- **Friction or ambiguity:** [Issue — or "None"]
- **Suggested improvement:** [Change — or "None"]

### Slash Commands

<!-- One sub-section per /command invoked. Delete this section if no slash commands were used. -->

#### `/[command-name]`
- **Used for:** [What the user was trying to accomplish]
- **Triggered correctly:** [Yes / No — did it launch the intended workflow?]
- **Friction or confusion:** [Any wording, missing step, or unexpected behavior — or "None"]
- **Suggested improvement:** [Specific change to the command's prompt — or "None"]

### Tools

#### File Operations (read, edit, write)
- **Pattern observed:** [e.g., "Read-before-edit was required to avoid content mismatch failures"]
- **Reliability issue:** [e.g., "Edit tool failed when file content had been modified between read and edit calls"] — or "None"
- **Mitigation:** [e.g., "Always read immediately before editing to get the current file state"]

#### GitHub Tools
- **Pattern observed:** [Description]
- **Reliability issue:** [Issue — or "None"]
- **Mitigation:** [Suggestion — or "None"]

#### Bash / Shell Commands
- **Pattern observed:** [Description]
- **Reliability issue:** [Issue — or "None"]
- **Mitigation:** [Suggestion — or "None"]

---

## 3. Pistes d'Amélioration

### 3.1 Modifications des Skills

<!-- For each suggested change, name the skill, the change type, what to change, and the motivating friction event. -->

| Skill | Change Type | What to Add / Clarify / Remove | Motivating Friction |
| :--- | :--- | :--- | :--- |
| `[skill-name]` | [Add / Clarify / Remove] | [Specific instruction or section to change] | [Friction event label from Section 1] |
| `[skill-name]` | [Add / Clarify / Remove] | [Description] | [Friction event] |

### 3.2 Nouveaux Skills ou Commandes

<!-- List net-new skills or commands that would have prevented a friction.
     Use "None identified" (and delete the table) if no new skills are needed. -->

| Proposed Name | Purpose | Motivating Friction |
| :--- | :--- | :--- |
| `[proposed-skill-name]` | [What it would do] | [Friction event label from Section 1] |

### 3.3 Réduction de l'Ambiguïté

<!-- List terminology, naming conventions, or boundary conditions to standardize.
     Use "None identified" if no ambiguities were surfaced. -->

- **[Ambiguous term or boundary]:** [What caused confusion] → [Proposed standard or clarification]
- **[Ambiguous term or boundary]:** [Description] → [Proposed resolution]

---

## Quality Gate

<!-- Completed by ns-session-retrospective before requesting user approval.
     All boxes must be checked before Phase C of the Co-Writing Protocol. -->

- [ ] All three sections complete — no placeholder text remains
- [ ] Privacy filter applied — no client names, record IDs, file paths, or URLs
- [ ] Every friction event has a root cause category
- [ ] Every improvement is actionable (names a specific skill or pattern)
- [ ] Language is consistent throughout
- [ ] Written in third person / passive voice — no "you did X" phrasing
- [ ] No value judgments about the user — observations target the framework
- [ ] User has explicitly approved this draft for publication
