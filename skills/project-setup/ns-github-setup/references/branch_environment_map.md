# Branch and Environment Mapping

## Core Principle

Each branch maps to exactly one NetSuite environment. A push to a branch triggers a deployment to that environment and no other. GitHub Environments enforce this by scoping credentials (secrets) per environment so a sandbox pipeline cannot accidentally use production credentials.

**Exception — the production trigger is not always a branch.** Where branch protection is not enforceable, the gate is a version tag and `main` deploys nothing (Model 1b). On an already-configured project, `ci/setup-complete.json` → `productionGate` states which it is; that file wins over every model below.

---

## Model 1 — Simple (Most Common)

**1 Sandbox + Production**

```
feature/TICKET-123  ──── validate only (no deploy)
        │
        │  PR → develop
        ▼
    develop  ──────────── auto-deploy → Sandbox
        │
        │  PR → main (requires approval)
        ▼
      main  ────────────── auto-deploy → Production (manual approval gate)
```

**Branch rules:**
| Branch | Deploy Target | Protection |
|---|---|---|
| `feature/*` | None | Short-lived; delete after merge |
| `develop` | Sandbox | No direct push from developers; merged via PR only |
| `main` | Production | Require PR, require `validate` to pass, require 1+ approver |

**When to use:** Most NetSuite implementations, **when branch protection and required reviewers are actually enforceable** (paid org plan, or public repo). On a free-plan private repo the approval gate does not exist — use Model 1b instead.

---

## Model 1b — Tag-Gated Production (no enforceable branch protection)

**1 Sandbox + Production, where the release tag is the gate**

```
feat/TICKET-123  ──── validate only (no deploy)
        │
        │  PR → develop
        ▼
    develop  ──────────── auto-deploy → Sandbox
        │
        │  merge/PR → main   ⚠️ deploys NOTHING (validate only)
        ▼
      main  ──────────── validate only; the branch that tags are cut from
        │
        │  git tag v1.4.0 && git push origin v1.4.0   (ns-release)
        ▼
    tag v*  ──────────── deploy → Production
```

**Branch rules:**
| Branch | Deploy Target | Protection |
|---|---|---|
| `feat/*`, `fix/*` | None | Short-lived; delete after merge |
| `develop` | Sandbox | Merged via PR; push auto-deploys |
| `main` | **None** — validate only | Mirror of production; kept in sync so tags are cut from a known state |
| tag `v*` | Production | The deliberate act of tagging *is* the gate |

**When to use:** Free-plan private repos where rulesets/required reviewers cannot be enforced, or any team that wants an explicit, auditable release act rather than an approval click.

⚠️ **Naming trap:** in this model the `develop` → `main` PR is **not** "the release" — it deploys nothing. The release is the tag push. Do not describe the merge as a release flow.

---

## Model 2 — Two Sandboxes

**Dev Sandbox + QA Sandbox + Production**

```
feature/TICKET-123  ──── auto-deploy → Dev Sandbox (optional)
        │
        │  PR → develop
        ▼
    develop  ──────────── auto-deploy → QA Sandbox
        │
        │  PR → main
        ▼
      main  ────────────── auto-deploy → Production (approval gate)
```

**Branch rules:**
| Branch | Deploy Target | Protection |
|---|---|---|
| `feature/*` | Dev Sandbox (optional) | Developer-controlled |
| `develop` | QA Sandbox | No direct push; merged via PR only |
| `main` | Production | Require PR + 2 approvers + all checks passing |

**When to use:** Larger teams where developers need isolated dev sandboxes while QA runs on a stable integration environment.

**Note:** Feature-branch deploys to a dev sandbox are optional and typically triggered manually rather than on every push, to avoid burning sandbox refreshes.

---

## Model 3 — Production Only (No Sandbox)

```
feature/TICKET-123
        │  PR → main
        ▼
      main  ────────────── deploy → Production
```

This model is high-risk and should be avoided. If you must use it:
- Require thorough code review (2+ approvers)
- Use `suitecloud project:validate` as a mandatory pre-deploy gate
- Use `--accountspecificvalues WARNING` not `ERROR`
- Schedule deploys during off-hours

---

## Hotfix Workflow (All Models)

For urgent production fixes that cannot wait for the full PR cycle:

```
main
  │  branch: hotfix/TICKET-456
  │
  │  [fix committed]
  │
  │  PR → main (fast-track approval)
  │  merge → auto-deploy → Production
  │
  │  backmerge: PR hotfix → develop
  │  (keep develop in sync with production)
```

Never merge directly to main without a PR, even for hotfixes.

Under **Model 1b** the merge into `main` does not ship the hotfix — cut a patch tag (`v1.4.1`) right after the merge, and only then is production fixed.

---

## GitHub Environments Setup

GitHub Environments (Settings → Environments) provide:
1. **Environment-scoped secrets** — `NS_ACCOUNT_ID` resolves to the sandbox ID for the sandbox environment, production ID for the production environment
2. **Required reviewers** — deploy jobs targeting `production` pause for manual approval
3. **Environment variables** — `DRIFT_DETECTION=true` can be set per-environment without changing the YAML

### Recommended configuration per environment

**`sandbox` environment:**
- No required reviewers (auto-deploy on push to `develop`)
- Secrets: `NS_ACCOUNT_ID`, `NS_CERTIFICATE_ID`, `NS_PRIVATE_KEY_B64`, `NS_AUTH_ID`
- Variables: `DRIFT_DETECTION=true` (if mixed team)

**`production` environment:**
- Required reviewers: 1–2 (typically Tech Lead + Project Manager)
- Wait timer: optional (e.g., 5 minutes to allow cancellation)
- Secrets: `NS_ACCOUNT_ID`, `NS_CERTIFICATE_ID`, `NS_PRIVATE_KEY_B64`, `NS_AUTH_ID`
- Variables: `DRIFT_DETECTION=false` (production should only receive what sandbox already approved)

---

## Branch Protection Rules

### `main` branch (Settings → Branches → Add rule)

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1 (or 2 for critical projects)
  ☑ Dismiss stale pull request approvals when new commits are pushed

☑ Require status checks to pass before merging
  Required status checks:
    - Validate SDF Project   (the 'validate' job name in the workflow)

☑ Require branches to be up to date before merging

☑ Do not allow bypassing the above settings
```

### `develop` branch

```
Branch name pattern: develop

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  Required status checks:
    - Validate SDF Project
```

---

## PR Checklist for SDF Code Reviews

When reviewing a PR that modifies SDF objects or scripts, check:

- [ ] Script internal IDs follow naming convention: `customscript_[proj]_[desc]_[type]`
- [ ] Field internal IDs follow naming convention: `custbody_[proj]_[desc]` etc.
- [ ] No hardcoded internal IDs in SuiteScript (use saved search lookups or config records)
- [ ] `manifest.xml` feature flags are intentional — `required="true"` will fail deployment if feature is off
- [ ] No `client.properties`, `*.pem`, or `deploy.xml` in the commit
- [ ] All new objects added to `OBJECT_OWNERSHIP.md` with ownership declared
- [ ] `ci/objects-manifest.json` updated if new SDF-owned objects were added (for drift detection)
- [ ] Unit tests pass (if `@oracle/suitecloud-unit-testing` is configured)
