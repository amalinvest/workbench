# Workbench Desktop — Production Checklist

Everything in this file is **procurement / one-time setup that only you can
do**. The code changes are already in the repo; once these items are
checked off and the GitHub secrets are populated, the existing
`.github/workflows/desktop-release.yml` will produce signed, notarised,
auto-updating macOS builds on every push to the `release` branch.

> **Scope: macOS-only for now.** Linux/Windows distribution is deferred
> — when you want them back, restore the matrix entries in
> `desktop-release.yml`, add `appimage` / `deb` / `nsis` to
> `tauri.conf.json#bundle.targets`, procure a Windows code-signing cert,
> and follow the Windows section in this file's git history.

Track progress by checking items off in a fork of this file or in a
GitHub issue.

---

## 1. Updater signing key (production)

This key signs the `.tar.gz` / `.zip` updater payloads. **The pubkey ships
inside the app and cannot be rotated** without re-installing the app for
every existing user. Generate it once, then guard the private half like a
production database credential.

```bash
# Generates ~/workbench-prod.key (private) + ~/workbench-prod.key.pub
bun x @tauri-apps/cli signer generate -w ~/workbench-prod.key
```

- [ ] **Paste** the contents of `~/workbench-prod.key.pub` into
  [`apps/desktop/src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json),
  replacing the `REPLACE_BEFORE_RELEASE_RUN_tauri_signer_generate`
  placeholder.
- [ ] **Store** `~/workbench-prod.key` in 1Password (or equivalent).
- [ ] **Set GitHub secrets**:
  - `TAURI_SIGNING_PRIVATE_KEY` — contents of the private key file
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — password you chose when generating

---

## 2. macOS code signing + notarisation

Required for Gatekeeper to launch the app without warning users.
Requires an active **Apple Developer Program** membership ($99/yr).

- [ ] **Enrol** in the Apple Developer Program if you haven't:
  https://developer.apple.com/programs/
- [ ] **Create a "Developer ID Application" certificate** in Apple
  Developer → Certificates, IDs & Profiles. Download the `.cer`, import
  it into Keychain Access (it pairs with the private key generated when
  you requested the cert).
- [ ] **Export** the certificate + private key from Keychain Access as a
  `.p12` file (right-click the cert → Export). Choose a strong password.
- [ ] **Base64-encode** the `.p12`:
  ```bash
  base64 -i workbench-developer-id.p12 -o workbench-developer-id.p12.b64
  ```
- [ ] **Set GitHub secrets**:
  - `APPLE_CERTIFICATE` — contents of the `.p12.b64` file
  - `APPLE_CERTIFICATE_PASSWORD` — the export password
  - `APPLE_SIGNING_IDENTITY` — e.g.
    `Developer ID Application: Your Name (TEAMID)`. Find it via
    `security find-identity -v -p codesigning`.
  - `APPLE_TEAM_ID` — the 10-character team ID (visible in your Apple
    Developer account header).
- [ ] **Generate an app-specific password** for notarytool:
  https://appleid.apple.com/account/manage → Sign-in and security →
  App-Specific Passwords. **This is NOT your iCloud password.**
- [ ] **Set GitHub secrets**:
  - `APPLE_ID` — your Apple Developer account email
  - `APPLE_PASSWORD` — the app-specific password from the step above

Without these secrets, the macOS jobs still produce a build, but it's
unsigned (Gatekeeper blocks it on first launch).

---

## 3. App icon

The current `src-tauri/app-icon.png` is a generated placeholder.

- [ ] Replace `apps/desktop/src-tauri/app-icon.png` with a **1024×1024
  transparent PNG** of the production logo.
- [ ] Regenerate the per-platform variants:
  ```bash
  cd apps/desktop
  bun x @tauri-apps/cli icon src-tauri/app-icon.png
  ```
- [ ] Commit the regenerated `src-tauri/icons/` directory.

---

## 4. Confirm app identifier

The identifier `dev.getworkbench.desktop` is hard-coded in two places:

- [`apps/desktop/src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) (`identifier`)
- [`apps/desktop/src-tauri/src/secrets.rs`](src-tauri/src/secrets.rs) (`SERVICE` constant — used as the Keychain service name)

- [ ] If this identifier is **not** final, change it in both files
  **before** the first public release. Changing it later orphans every
  saved password on existing installs.

---

## 5. Confirm updater endpoint

Currently set to:
```
https://github.com/pontusab/workbench/releases/latest/download/latest.json
```
in `apps/desktop/src-tauri/tauri.conf.json`.

- [ ] Confirm `pontusab/workbench` matches the actual repository (it
  does as of this writing, but change it here if you ever rename or
  transfer the repo).
- [ ] **First time only**: GitHub's `/releases/latest/...` URLs only
  resolve once a **published** (non-draft) release exists. The workflow
  defaults to draft; you must publish the first one manually.

---

## 6. First release

- [ ] Bump versions in all three places to the release version (e.g.
  `0.1.0`):
  - `apps/desktop/package.json`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/src-tauri/Cargo.toml`
- [ ] Push to the `release` branch (or trigger the workflow via "Run
  workflow" in the GitHub Actions UI).
- [ ] Wait for both matrix jobs to finish (macOS arm64, macOS x64).
  The Apple notarisation step is the slowest — ~10–20 min.
- [ ] Inspect the draft release that `tauri-action` created. Verify:
  - Two `.dmg` artifacts attached (one per architecture)
  - A `latest.json` file attached with both signatures
  - The `.dmg` opens without "damaged" warning on a fresh machine
- [ ] Click **Publish** on the draft. From this point, every running
  Workbench instance gets the new version on its next hourly update
  check.

---

## 7. Smoke-test the auto-updater

The first real test of the updater can only be done once you've published
at least one release.

- [ ] Bump the version (e.g. to `0.1.1`), cut a second release.
- [ ] On a machine running the `0.1.0` build, wait for the toast or open
  Settings → "Check for updates".
- [ ] Verify the "Install & restart" button downloads, swaps the binary,
  and relaunches into `0.1.1`.

---

## Out of scope (deferred)

Open a separate issue if/when these become priorities:

- **Linux + Windows distribution** — release matrix entries, `appimage`
  / `deb` / `nsis` in `bundle.targets`, Windows code-signing cert
- Sentry / `tauri-plugin-log` for crash reporting
- Unit + integration tests for the Rust modules
- Auto-publish (vs current manual "publish draft" step)
- Deep links, autostart, menubar quick-status
- Multi-connection profiles
