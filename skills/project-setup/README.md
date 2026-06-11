# Project Setup

One-time skills that stand up a NetSuite project before any phase work begins — classifying the project, scaffolding its workspace, and wiring up GitHub-based team collaboration.

| Skill | What it does |
|---|---|
| **ns-init-project** | _Step 0._ Classifies the project by Origin (Brownfield/Greenfield) and Scale (Tier 1/2/3), captures the dev environment (account, sandbox, where code lives), then hands off to `ns-init-workspace`. |
| **ns-init-workspace** | _Step 2._ Scaffolds the framework folder tree and `PLAN.md` from scratch, or reconciles an existing messy folder into the standard structure. |
| **ns-github-setup** | _One-time._ Audits an SDF repository and configures GitHub collaboration: deploy.xml strategy, CI/CD pipeline with OAuth 2.0, object-ownership boundaries between SDF and the UI, and optional drift detection. |
