# OAuth 2.0 M2M Authentication Setup for SDF

## Background

NetSuite deprecated Token-Based Authentication (TBA / OAuth 1.0) for SuiteCloud SDK in version 24.2 (August 2024). SDF CLI v3+ requires OAuth 2.0 Machine-to-Machine (M2M) authentication for all CI/CD environments. Developers doing local interactive work can still use browser-based OAuth; CI pipelines must use M2M.

**Key difference from TBA:**
- TBA: token ID + token secret (stored in `client.properties`)
- OAuth 2.0 M2M: RSA private key + certificate registered in NetSuite

OAuth 2.0 tokens have a 2-year validity period.

---

## Part 1 — NetSuite Account Setup (Admin required)

These steps are done once per NetSuite environment (once for sandbox, once for production).

### Step 1.1 — Enable SuiteCloud Development Framework

If not already enabled:
1. Setup → Company → Enable Features → SuiteCloud tab
2. Enable: **SuiteCloud Development Framework**
3. Save

### Step 1.2 — Enable OAuth 2.0

1. Setup → Company → Enable Features → SuiteCloud tab
2. Enable: **OAuth 2.0**
3. Save

### Step 1.3 — Generate an RSA Key Pair

On your local machine (or in a secure location), generate a 2048-bit RSA key pair:

```bash
# Generate private key
openssl genrsa -out ns_private.pem 2048

# Extract the public key (for the certificate)
openssl req -new -x509 -key ns_private.pem -out ns_certificate.pem -days 730 \
  -subj "/CN=SDF CI Deploy/O=YourCompany/C=US"
```

This produces:
- `ns_private.pem` — keep this secret; NEVER commit; NEVER share
- `ns_certificate.pem` — the public certificate, uploaded to NetSuite

### Step 1.4 — Register the Certificate in NetSuite

1. Setup → Company → OAuth 2.0 Client Credentials (M2M) Setup
   - *(Path may vary slightly by NetSuite version)*
2. Click **Create New**
3. Fill in:
   - **Name:** `CI Deploy — [Environment]` (e.g., `CI Deploy — Sandbox`)
   - **Entity:** the user or role the CI pipeline will act as
   - **Application:** `SuiteCloud Development Framework`
   - **Role:** a role with appropriate SDF deployment permissions (see Step 1.5)
4. Click **Upload Certificate** and upload `ns_certificate.pem`
5. Save — NetSuite will display a **Certificate ID** (e.g., `abc1234567890def`). **Copy this — it will not be shown again.**

### Step 1.5 — Configure the Role

The role used by the certificate must have these permissions at minimum:
- SuiteCloud Development Framework → **Full**
- Log in using OAuth 2.0 Access Tokens → **Full**

If deploying custom fields, records, or scripts, additional permissions may be required depending on what the project deploys.

---

## Part 2 — Local Developer Setup

Each developer runs this once per project, once per environment they will deploy to.

### Step 2.1 — Install SuiteCloud CLI

```bash
npm install -g @oracle/suitecloud-cli
```

Verify: `suitecloud --version` should show 3.x or higher.

### Step 2.2 — Configure Authentication Interactively

```bash
suitecloud account:setup
```

This opens a browser-based OAuth flow. You will:
1. Log in to the target NetSuite account
2. Authorize the SuiteCloud CLI
3. Choose a role

The CLI stores auth in `client.properties` at the project root. **This file must be in `.gitignore`** — it is account-specific and contains sensitive auth data.

---

## Part 3 — CI/CD Setup (GitHub Actions)

This is done once per project, not per developer. The private key and certificate ID are stored as GitHub Secrets.

### Step 3.1 — Encode the Private Key

The SDF CLI requires a **file path** to the private key — it cannot accept the raw key as a string. In CI, you work around this by base64-encoding the key, storing it as a secret, and decoding it to a temp file at pipeline time.

```bash
# Encode the private key for GitHub Secrets
base64 -w 0 ns_private.pem
```

Copy the output. This is the value for the `NS_PRIVATE_KEY_B64` GitHub Secret.

### Step 3.2 — Create GitHub Secrets

Go to your GitHub repository:
- **For environment-scoped secrets** (recommended): Settings → Environments → [environment name] → Add secret
- **For repository-scoped secrets** (if using one set of credentials for all environments): Settings → Secrets and variables → Actions

Create these secrets for **each environment separately**:

| Secret Name | Value | Where to Find |
|---|---|---|
| `NS_ACCOUNT_ID` | NetSuite account ID | Setup → Company → Company Information → Account ID |
| `NS_CERTIFICATE_ID` | Certificate ID from Step 1.4 | Copied during certificate registration |
| `NS_PRIVATE_KEY_B64` | base64-encoded private key from Step 3.1 | Your local terminal |
| `NS_AUTH_ID` | Any unique string (e.g., `ci-deploy-sb`) | You choose |

### Step 3.3 — Pipeline Auth Steps (already in github-deploy.yml)

The workflow template already includes these steps. Understanding them:

```yaml
# Step 1: Decode the base64 private key to a temp file
- name: Decode private key
  run: |
    echo "${{ secrets.NS_PRIVATE_KEY_B64 }}" | base64 -d > /tmp/ns_private.pem
    chmod 600 /tmp/ns_private.pem

# Step 2: Register the auth with the SDF CLI for this run
- name: Configure SDF authentication
  run: |
    suitecloud account:setup:ci \
      --account "${{ secrets.NS_ACCOUNT_ID }}" \
      --authid "${{ secrets.NS_AUTH_ID }}" \
      --certificateid "${{ secrets.NS_CERTIFICATE_ID }}" \
      --privatekeypath "/tmp/ns_private.pem"

# Step N (always-run cleanup): Delete the temp key
- name: Clean up private key
  if: always()
  run: rm -f /tmp/ns_private.pem
```

The `--authid` value becomes the alias used by `suitecloud project:deploy --authid ...`.

---

## Part 4 — Verifying the Setup

### Test locally

```bash
suitecloud account:manageauth --list
# Should show your configured auth with the account ID

suitecloud project:validate
# Should pass without auth errors
```

### Test CI

Push a commit to the `develop` branch and check that the pipeline:
1. Validates successfully
2. Sets up auth without error
3. Generates `deploy.xml`
4. Deploys to the sandbox account

If the deploy fails with an authentication error, check:
- The Certificate ID matches exactly what was shown in NetSuite (no extra spaces)
- The private key was base64-encoded without line wrapping (`base64 -w 0`)
- The certificate has not expired (2-year validity)
- The role associated with the certificate has SDF permissions

---

## Troubleshooting

| Error | Likely Cause | Fix |
|---|---|---|
| `invalid_client` or auth error | Wrong certificate ID or key mismatch | Re-check certificate ID in NetSuite; re-encode key |
| `INSUFFICIENT_PERMISSION` during deploy | Role lacks SDF permission | Add SuiteCloud Development Framework → Full to role |
| `account:setup:ci: command not found` | Old CLI version (pre-3.x) | `npm install -g @oracle/suitecloud-cli` |
| `base64: invalid input` in pipeline | Line-wrapped key in secret | Re-encode with `base64 -w 0 ns_private.pem` (Linux) or `base64 ns_private.pem` (Mac) |
| Drift check fails after auth step | `--authid` mismatch | Ensure `--authid` in `account:setup:ci` matches `--authid` in `check-drift.js` call |
