# SDF CI Failure Catalogue

Exhaustive catalogue of GitHub Actions SDF pipeline failures, organised by category. Each entry: **log excerpt → root cause → exact fix.** Patterns match against raw job log output regardless of how it was obtained (`gh`, MCP, or pasted text).

> Scope note: this catalogue is run-level (one workflow run, one failing job). For PR-level blocker triage (conflicts, branch protection, which skill owns the fix), see `ns-pr-diagnose`.

---

## 1. Authentication & Certificate Failures

Almost always in the `validate` or deploy jobs, at the `suitecloud account:setup:ci` / `authenticate` step.

### `invalid_client`
**Excerpt:** `{"error":"invalid_client"}` or `invalid_client` in the auth step.
**Root cause:** The Certificate ID sent by CI does not match the certificate registered on the NetSuite integration record (or the wrong integration is referenced).
**Fix:**
1. NetSuite → Setup → Integrations → Manage Integrations → open the CI integration.
2. Read its **Certificate ID**.
3. Compare to the `NS_CERTIFICATE_ID` GitHub Secret (Settings → Environments → `sandbox`/`production` → Secrets).
4. Update the secret to match. Re-run the workflow.

### `INVALID_LOGIN_ATTEMPT`
**Excerpt:** `INVALID_LOGIN_ATTEMPT` or `401 Unauthorized`.
**Root cause:** Certificate expired (NetSuite OAuth 2.0 M2M certs have a **2-year TTL**), or `NS_ACCOUNT_ID` points to the wrong account.
**Fix:**
1. Regenerate the RSA key pair (`ns-github-setup` → `references/oauth_setup_guide.md`, Step 1.3).
2. Re-upload the public certificate to the integration record; note the new Certificate ID.
3. Update `NS_PRIVATE_KEY_B64` (`base64 -w 0`, no line breaks) and `NS_CERTIFICATE_ID` secrets.
4. Verify `NS_ACCOUNT_ID` matches the target exactly, including the `_SB1` suffix for sandboxes.

### `base64: invalid input`
**Excerpt:** `base64: invalid input` at the key-decode step.
**Root cause:** `NS_PRIVATE_KEY_B64` was pasted in PEM (multi-line) form; the pipeline expects a single-line base64 string.
**Fix:**
```bash
base64 -w 0 path/to/private.pem
```
Paste the single-line output as the secret value. It must contain no newlines.

### `privatekeypath: file not found`
**Excerpt:** `privatekeypath` / `file not found` at the auth step, after a decode step that appeared to succeed.
**Root cause:** The decode step wrote nothing — usually `NS_PRIVATE_KEY_B64` is unset/empty for this environment, so `base64 -d` produced an empty file silently.
**Fix:** Open the decode step's own logs. Confirm `NS_PRIVATE_KEY_B64` exists in the **correct GitHub Environment** (secrets are per-environment; a secret set on `sandbox` is invisible to the `production` job). Add the missing secret.

---

## 2. Validation Failures

In the `validate` job at `suitecloud project:validate`.

### `Object ... does not exist`
**Excerpt:** `ERROR: Object <scriptid> does not exist` / `Details: The dependency ... could not be resolved`.
**Root cause:** An XML file references an object (field, record, script) that is not present in the target account and not deployed in this project.
**Fix:** Either add the missing object to the project/`manifest.xml` dependencies, or remove the dangling reference. If the object exists only in the UI, it must be imported (`ns-object-sync`) before objects depending on it can validate.

### `Feature ... is not enabled`
**Excerpt:** `ERROR: Feature <FEATURE> is not enabled in your account`.
**Root cause:** `manifest.xml` declares `required="true"` for a feature the target account does not have enabled.
**Fix:** Enable the feature in the target account (Setup → Company → Enable Features), **or** if the project does not truly require it, set `required="false"` in `manifest.xml`. Match the manifest to the account that the job deploys to.

### `Unexpected token` / XML parse error
**Excerpt:** `Unexpected token`, `Premature end of file`, or `not well-formed` referencing an `Objects/*.xml` file.
**Root cause:** Malformed Objects XML — unclosed tag, illegal character, or an invalid enum value.
**Fix:** Run `suitecloud project:validate` locally, open the reported file at the reported line, fix the syntax. Common culprits: an `&` not escaped as `&amp;`, a truncated file from a bad merge (see `ns-conflict-resolve`).

### `CustomizationReservedId`
**Excerpt:** `CustomizationReservedId: The object ID ... is reserved`.
**Root cause:** A `scriptid` collides with a reserved or already-deployed ID in the account.
**Fix:** Rename the `scriptid` in the XML, update all references (other XML + SuiteScript), update `ci/objects-manifest.json`, re-validate.

---

## 3. Deploy Failures

In `deploy-sandbox` / `deploy-production` at `suitecloud project:deploy`.

### `INSUFFICIENT_PERMISSION`
**Excerpt:** `INSUFFICIENT_PERMISSION` / `You do not have the permissions required`.
**Root cause:** The NetSuite role assigned to the CI user lacks SDF deploy permission.
**Fix:** NetSuite → Manage Roles → CI role → Permissions → Setup → add **SuiteCloud Development Framework** at level **Full**. Save, re-run.

### `accountspecificvalues`
**Excerpt:** `ERROR: ... contains account-specific values` / `accountspecificvalues`.
**Root cause:** An XML object embeds an account-specific internal ID (e.g. a hardcoded subsidiary or department reference) that differs across accounts.
**Fix:** Either deploy tolerantly with `suitecloud project:deploy --accountspecificvalues WARNING` (downgrades the error to a warning), or — better — parameterise the value so it resolves per account. Prefer parameterising for values that must be correct in production.

### `SuiteApp is locked`
**Excerpt:** `SuiteApp is locked` / `locked for deployment`.
**Root cause:** Deploying SDF account-customization objects into an account where the target SuiteApp/bundle is locked — typically the wrong target account.
**Fix:** Verify `NS_ACCOUNT_ID` is the intended account. A locked SuiteApp usually means the deploy is aimed at a managed-bundle account it shouldn't touch.

---

## 4. Drift Detection Failures

In the `drift-check` step (`ci/check-drift.js`), enabled when `DRIFT_DETECTION=true`.

### `DRIFT DETECTED` exit 1
**Excerpt:** `DRIFT DETECTED` followed by a list of changed objects; job exits 1.
**Root cause:** **Expected gate**, not a bug. An SDF-owned object was edited in the NetSuite UI but the change was never committed — the account no longer matches the repo. Deploying now would overwrite the UI change.
**Fix:** Follow the resolution steps `check-drift.js` prints, or run **`ns-object-sync`** to import and commit the UI change (keep it) — or revert the UI change if it was unintended. Then re-run the pipeline.

### `Import failed` in check-drift
**Excerpt:** `Import failed` / `object:import` error inside the drift step.
**Root cause:** The drift script authenticates and imports live objects; this is an auth failure on the import, not real drift.
**Fix:** Diagnose using §1 (Authentication). The drift step uses the same credentials as deploy.

---

## 5. Infrastructure & Tooling Failures

Environment-level, usually transient or config.

### `npm install -g` timeout / `ETIMEDOUT` / `ECONNRESET`
**Root cause:** Transient registry or network blip installing the SuiteCloud CLI.
**Fix:** Re-run the workflow. If it recurs across several runs, pin/cache the CLI version.

### `git diff: fatal: bad revision`
**Excerpt:** `fatal: bad revision 'HEAD^'` or `unknown revision`, often in `generate-deploy.js` or a diff-based step.
**Root cause:** `actions/checkout` did a shallow clone (`fetch-depth: 1`); diff steps need history.
**Fix:** Set `fetch-depth: 0` on the checkout step in the workflow.

### `ECONNREFUSED` / `ENOTFOUND`
**Root cause:** Network failure reaching the NetSuite endpoint.
**Fix:** Check https://status.netsuite.com. If healthy, verify no IP allowlist / token-based-access restriction was recently added to the account's web-services preferences.

### `CLI version ... not compatible`
**Excerpt:** `CLI version X.Y.Z is not compatible with account version A.B.C`.
**Root cause:** The `@oracle/suitecloud-cli` version is older than the account requires (NetSuite enforces a version floor each release).
**Fix:**
```bash
npm install @oracle/suitecloud-cli@<required-version> --save-dev
```
Commit `package.json` + `package-lock.json`, push.

---

## Escalation — Unrecognised Failure

If no signature matches:

1. Extract the first ~20 lines after the first `[ERROR]` / `error:` marker.
2. If the failure came from a custom CI script (`check-drift.js`, `generate-deploy.js`), read that script's source — the failing condition is in there.
3. If it's an unknown SuiteCloud SDK code, search Oracle SuiteCloud docs / SuiteAnswers for the exact code.
4. If it persists after 2 re-runs with no code change, treat as a transient NetSuite platform issue — check system status, retry later.
5. Once the cause is known, **add the new pattern to this catalogue** under the right category so the next diagnosis is instant.
