---
name: ns-ci-diagnose
description: "[SDF CI — Diagnose Run] Reads a failing GitHub Actions SDF workflow run and returns one root cause and one exact fix. Detects available GitHub tooling (gh CLI / GitHub MCP / pasted logs) and matches logs against the SDF failure catalogue."
---

# NS CI Diagnose

Goes deeper than `ns-pr-diagnose` (which classifies PR-level blockers): this skill drills into a single workflow **run** and pins the failure to one cause. SDF CI failures fall into a finite set — auth, validation, deploy, drift, infrastructure — each with a recognisable log signature.

Output target: **one root cause, one fix, in under 5 lines.** No survey of possibilities.

---

## Step 0 — Get the Log

Use whatever fetches the failing run's log — `gh` CLI, GitHub Actions tooling, or, if neither is available, ask the user to paste the failing job's output. The catalogue in Step 4 matches identically regardless of source; only how you fetch the log changes.

---

## Step 1 — Identify the Run

Accept a workflow run URL, run ID, or branch name. Resolve to a run via the detected tool:

- `gh`: `gh run list --branch <branch> --limit 5`, then `gh run view <id>`
- MCP: `actions_list` filtered to the branch/workflow
- Manual: the pasted log is the run

---

## Step 2 — Identify the Failing Job

SDF pipelines (`ns-github-setup` template) have these jobs. Name the one that failed:

`validate` · `deploy-sandbox` · `deploy-production` · `drift-check`

The job name narrows the catalogue section to search first (auth/validation failures cluster in `validate`; permission/deploy in the deploy jobs).

---

## Step 3 — Fetch the Failing Log

- `gh`: `gh run view <id> --log-failed` (only failed steps)
- MCP: `get_job_logs` with `failed_only: true`
- Manual: use the pasted text

---

## Step 4 — Match Against the Catalogue

Scan the log for the first matching signature. Full catalogue with excerpts and step-by-step fixes: [references/ci-failure-catalogue.md](references/ci-failure-catalogue.md).

**Authentication**
| Log signature | Root cause | Fix |
|---|---|---|
| `invalid_client` | Wrong `NS_CERTIFICATE_ID` secret, or cert not registered on the integration record | Match the secret to the Certificate ID in NetSuite → Integrations |
| `INVALID_LOGIN_ATTEMPT` | Cert expired (2-year TTL) | Regenerate the RSA key pair, re-upload the cert, update secrets |
| `base64: invalid input` | Private key encoded with line wraps | Re-encode: `base64 -w 0 private.pem` (single line) |
| `privatekeypath: file not found` | Decode step failed silently | Read the decode step's own logs; check `NS_PRIVATE_KEY_B64` is set |

**Validation**
| Log signature | Root cause | Fix |
|---|---|---|
| `Object ... does not exist` | XML references an object missing from the target account | Deploy/create the dependency, or remove the reference |
| `Feature ... is not enabled` | `manifest.xml` requires a feature the account lacks | Enable the feature, or set `required="false"` if optional |
| `Unexpected token` (XML) | Malformed Objects XML | Run `suitecloud project:validate` locally; fix the reported line |

**Deploy**
| Log signature | Root cause | Fix |
|---|---|---|
| `INSUFFICIENT_PERMISSION` | CI role lacks SDF deploy permission | Add **SuiteCloud Development Framework: Full** to the CI role |
| `accountspecificvalues` error | Account-specific internal ID in XML | Deploy with `--accountspecificvalues WARNING`, or parameterise the value |
| `SuiteApp is locked` | Deploying to a locked SuiteApp account | Wrong target account — verify `NS_ACCOUNT_ID` |

**Drift**
| Log signature | Root cause | Fix |
|---|---|---|
| `DRIFT DETECTED` exit 1 | SDF object edited in UI, not committed (expected gate) | Follow the steps printed by `check-drift.js`; or run `ns-object-sync` |
| `Import failed` in check-drift | Auth failure on the import step | Diagnose as an auth failure (rows above) |

**Infrastructure**
| Log signature | Root cause | Fix |
|---|---|---|
| `npm install -g` timeout | Transient registry/network blip | Re-run the workflow |
| `git diff: fatal: bad revision` | Shallow clone | Add `fetch-depth: 0` to the checkout step |

---

## Step 5 — Report

Return exactly: **failing job · root cause · the one command or setting to change.** Nothing more unless the user asks.

---

## Step 6 — Unrecognised Failure

If nothing matches:

1. Print the log excerpt: the first ~20 lines after the first `[ERROR]` / `error:` marker.
2. If it came from a custom CI script (`check-drift.js`, `generate-deploy.js`), read that script to understand the failing condition.
3. Ask the user to confirm the excerpt, and **offer to extend** `references/ci-failure-catalogue.md` with the new pattern once the cause is found.

---

## Reference

| Topic | File |
|---|---|
| Full failure catalogue (excerpts + fixes) | [references/ci-failure-catalogue.md](references/ci-failure-catalogue.md) |
| Manual UI-change sync (drift fix) | `ns-object-sync` |
| PR-level blocker triage | `ns-pr-diagnose` |
| Pipeline & secrets setup | `ns-github-setup` |
