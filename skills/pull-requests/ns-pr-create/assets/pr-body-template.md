## What changed

<!-- Auto-filled by ns-pr-create: list of SuiteScript files and Object XMLs with a one-line description of each change -->

| File | Type | Summary |
|---|---|---|
|  |  |  |

## NetSuite deployment impact

<!-- Auto-filled by ns-pr-create based on ci/setup-complete.json and PLAN.md -->

- **Target environment:** <!-- e.g. Sandbox (merge to develop). If the base is `main`, check ci/setup-complete.json → productionGate: on a tag-gated project this PR deploys NOTHING — write "aucun déploiement (mise à jour de main avant tag v*)". -->
- **Deploy strategy:** <!-- e.g. SDF CI pipeline, manual, etc. -->
- **SDF-owned objects modified:** <!-- Yes / No — list if yes -->
- **manifest.xml changed:** <!-- Yes (review feature flags) / No -->

## Checklist

- [ ] Script IDs follow naming convention (`customscript_[proj]_[description]_[type]`)
- [ ] New objects added to `OBJECT_OWNERSHIP.md`
- [ ] `ci/objects-manifest.json` updated (if new SDF-owned objects were added)
- [ ] No `client.properties` / `*.pem` / `deploy.xml` committed
- [ ] `manifest.xml` feature flags reviewed (if `manifest.xml` changed)
- [ ] Unit tests pass locally
- [ ] Sandbox validation (`suitecloud project:validate`) passes
- [ ] QA sign-off obtained (Tier 1 & 2 projects)
