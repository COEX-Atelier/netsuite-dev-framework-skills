# SDF CI Failure Patterns

Catalogue of known SDF pipeline failures with root causes and exact fixes. Patterns are matched against raw CI job log output.

---

## Authentication & Certificate Errors

### `invalid_client`
**Log excerpt:** `{"type":"error","code":"invalid_client","message":"..."}`  
**Root cause:** The OAuth client ID or certificate ID used by CI does not match what is registered in the NetSuite integration record.  
**Fix:**
1. NetSuite → Setup → Integrations → Manage Integrations → find the integration used for CI.
2. Note the **Certificate ID** in the integration record.
3. Compare it to the `NS_CERTIFICATE_ID` GitHub Secret (Settings → Secrets → Actions).
4. If they differ, update the GitHub Secret to match the NetSuite value.
5. If the cert has expired: generate a new RSA key pair → upload the public cert to the integration record → update `NS_PRIVATE_KEY` (base64-encoded, no line breaks) and `NS_CERTIFICATE_ID` in GitHub Secrets.

---

### `INVALID_LOGIN_ATTEMPT`
**Log excerpt:** `INVALID_LOGIN_ATTEMPT` or `401 Unauthorized`  
**Root cause:** Same as `invalid_client` — certificate mismatch or the account ID / email in CI config points to the wrong account.  
**Fix:** Same as `invalid_client`. Also verify `NS_ACCOUNT_ID` matches the target sandbox/production account ID exactly (including the `_SB1` suffix for sandboxes).

---

### `base64: invalid input`
**Log excerpt:** `base64: invalid input` during key decode step  
**Root cause:** The `NS_PRIVATE_KEY` GitHub Secret was pasted with line breaks (PEM format), but the pipeline expects a single-line base64 string.  
**Fix:**
```bash
base64 -w 0 path/to/private.pem
```
Copy the single-line output and update the `NS_PRIVATE_KEY` GitHub Secret. The value must have no newlines.

---

## Permission Errors

### `INSUFFICIENT_PERMISSION`
**Log excerpt:** `INSUFFICIENT_PERMISSION` or `You do not have the permissions required...`  
**Root cause:** The NetSuite role assigned to the CI user account does not have SuiteCloud Development Framework permission.  
**Fix:**
1. NetSuite → Setup → Users/Roles → Manage Roles → edit the CI role.
2. Permissions tab → Setup subtab.
3. Add **"SuiteCloud Development Framework"** with level **"Full"**.
4. Save. Re-trigger the CI workflow.

---

## Committed Sensitive Files

### `deploy.xml` in diff
**Log excerpt:** CI drift-check or a custom gate prints: `deploy.xml detected in commit`  
**Root cause:** `deploy.xml` was committed to the branch. This file is SDF-generated and environment-specific — it must be gitignored.  
**Fix:**
```bash
git rm --cached deploy.xml
echo "deploy.xml" >> .gitignore
git add .gitignore
git commit -m "Remove deploy.xml from tracking and add to .gitignore"
git push
```

---

## Drift Detection Failures

### Drift detection exit 1
**Log excerpt:** `Drift detected. Exiting with code 1.` or `check-drift.js` output showing changed objects  
**Root cause:** An SDF-owned object was modified directly in the NetSuite UI but the change was not committed to the repository. The XML on the file system no longer matches what is in the account.  
**Fix — Option A (keep the UI change):**
```bash
suitecloud object:import --scriptid <scriptid> --type <objecttype> --destinationfolder /Objects
git add Objects/<scriptid>.xml
git commit -m "Sync <scriptid> after UI change"
git push
```
**Fix — Option B (revert the UI change):**
Re-deploy the committed XML to overwrite the UI change:
```bash
suitecloud object:update --scriptid <scriptid>
```

---

## Validation Failures

### `project:validate` failed
**Log excerpt:** `suitecloud project:validate` exits non-zero with one or more `[ERROR]` lines  
**Root cause:** XML syntax error in an object file, or a referenced feature/object dependency is missing from `manifest.xml`.  
**Fix:**
1. Run `suitecloud project:validate` locally and read each `[ERROR]` line.
2. **XML syntax error** — open the reported `.xml` file, find the line number, fix the syntax (check unclosed tags, illegal characters, invalid enum values).
3. **Missing feature dependency** — add the feature to the `<features>` section of `manifest.xml`.
4. **Missing object dependency** — the referenced `scriptid` does not exist in the target account or is not listed in `manifest.xml`. Either add it to the manifest or ensure the referenced object exists in the sandbox.
5. Re-run `suitecloud project:validate` locally until it passes, then push.

---

## Less-Common Patterns

### `ECONNREFUSED` / `ENOTFOUND`
**Root cause:** Network connectivity failure between the CI runner and the NetSuite account endpoint.  
**Fix:** Check NetSuite system status (https://status.netsuite.com). If the account is healthy, verify that no IP allowlist or VPN requirement was recently added to the NetSuite account's web service preferences.

---

### `SuiteCloud CLI version mismatch`
**Log excerpt:** `CLI version X.Y.Z is not compatible with account version A.B.C`  
**Root cause:** The `@salto-io/suitecloud-cli` or `@oracle/suitecloud-cli` version in `package.json` is older than what the NetSuite account requires.  
**Fix:** Update the CLI package to the version required by the account:
```bash
npm install @oracle/suitecloud-cli@<required-version> --save-dev
git add package.json package-lock.json
git commit -m "Update SuiteCloud CLI to <required-version>"
git push
```

---

### `CustomizationReservedId`
**Log excerpt:** `CustomizationReservedId: The object ID ... is reserved`  
**Root cause:** A custom object's `scriptid` conflicts with a reserved or already-deployed ID in the target account.  
**Fix:** Rename the `scriptid` in the XML file, update all references in other XML files and SuiteScript code, update `ci/objects-manifest.json`, and re-validate.

---

## Diagnostic Escalation

If the CI log does not match any pattern above:

1. Extract the first 20 lines after the first `[ERROR]` or `error:` marker.
2. Check if the error originated from a custom CI script (e.g. `check-drift.js`, `validate-manifest.js`) — read that script's source to understand the condition.
3. If the error is from an unknown SuiteCloud SDK response code, search the Oracle SuiteCloud documentation or post in the SuiteAnswers community with the exact error code.
4. If the error persists after 2 re-triggers with no code change, it may be a transient NetSuite platform issue — check system status and retry in 30 minutes.
