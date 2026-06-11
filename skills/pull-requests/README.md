# Pull Request Lifecycle

The create → diagnose → merge path for SDF feature branches on GitHub. Each skill is NetSuite-aware: it understands SDF objects, deploy strategies, and the downstream deployment.

| Skill | What it does |
|---|---|
| **ns-pr-create** | Creates a well-formed pull request for an SDF feature branch — inspects the diff, flags SDF anti-patterns, and generates a NetSuite-aware description. |
| **ns-pr-diagnose** | Diagnoses why a PR cannot merge, classifies the blocker (merge conflict, CI failure, or branch protection), and routes to the specialist skill that resolves it. |
| **ns-pr-merge** | Safely merges a PR and confirms the downstream NetSuite deployment — validates merge conditions, recommends the correct SDF branch strategy, and monitors the deploy pipeline. |
