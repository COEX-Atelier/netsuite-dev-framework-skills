# Source Control & CI

SDF-aware git and CI operations that keep source control and the NetSuite account in sync. These work through the `suitecloud` CLI and `git` — no GitHub tooling required.

| Skill | What it does |
|---|---|
| **ns-object-sync** | Pulls a single SDF-owned object that was edited in the NetSuite UI back into source control, with a reviewed diff and a descriptive commit. The manual counterpart to drift detection. |
| **ns-conflict-resolve** | Resolves merge conflicts in SDF project files (`Objects/*.xml`, `manifest.xml`, FileCabinet) using SDF-aware rules instead of treating them as plain text. |
| **ns-ci-diagnose** | Reads a failing GitHub Actions SDF workflow run and returns one root cause and one exact fix, matching logs against the SDF failure catalogue. |
