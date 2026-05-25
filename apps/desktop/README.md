# Workbench Desktop

Standalone Tauri 2 client for Workbench. Connect to any BullMQ-backed Redis
URL and inspect runs, schedulers, flows, and metrics — no infrastructure to
deploy, no auth to configure.

## Architecture

```
┌───────────────────────┐         ┌──────────────────────────┐
│ Tauri webview         │  HTTP   │ Bun-compiled sidecar     │
│   onboarding + ui     │ ──────► │   buildWorkbenchApiApp   │ ──► Redis
│   (React + Vite)      │ loopback│   (API-only, 127.0.0.1)  │
└──────────┬────────────┘         └──────────────────────────┘
           │ invoke()
           ▼
   Tauri Rust core (lifecycle, updater, single-instance, store)
```

- The dashboard UI is imported as source from `@getworkbench/core/ui` and
  rendered in the same React tree as the onboarding screens.
- The sidecar serves only `/api/*` and `/config`. Loopback only — never bound
  to a public interface.
- Connection switching restarts the sidecar with a new `REDIS_URL`.
- Auto-update via `tauri-plugin-updater` and GitHub Releases.

## Development

```bash
# From the repo root, once
bun install

# Local Redis (any BullMQ-friendly Redis works)
docker compose up -d redis

# Dev loop: Vite + watched sidecar build + tauri dev
bun run --filter=@workbench/desktop dev
```

The first run takes a minute (Cargo compiles Tauri). After that, edits are
hot-reloaded:

- UI changes → Vite HMR
- Sidecar source changes → `bun build --watch` rebuilds the binary; the next
  `Connect` action picks up the new build
- Rust changes → `tauri dev` rebuilds and relaunches

Set `VITE_DEFAULT_REDIS_URL` in `.env.local` to pre-fill the onboarding form.

## Production build

```bash
bun run --filter=@workbench/desktop build
```

This produces signed/notarised `.app` + `.dmg` bundles in
`src-tauri/target/release/bundle/`. **macOS-only for now** — when Linux /
Windows ship, `bundle.targets` in `tauri.conf.json` and the matrix in
`desktop-release.yml` need to be extended.

### Updater signing key

The `pubkey` field in `src-tauri/tauri.conf.json` ships with the binary and
**cannot be rotated** without re-installing the app for every existing
user. Before the first public release:

```bash
bun x @tauri-apps/cli signer generate -w ~/workbench-prod.key
# Paste the contents of ~/workbench-prod.key.pub into tauri.conf.json
# under plugins.updater.pubkey (replacing the REPLACE_BEFORE_RELEASE
# placeholder).
# Store ~/workbench-prod.key (the private half) in your password manager
# and add it as the GitHub secret TAURI_SIGNING_PRIVATE_KEY.
```

The committed placeholder is safe to ship in dev builds — the pubkey is
only decoded at update-install time, so a malformed value just makes
`check()` fail (no boot panic).

### Release flow

1. Bump versions in `apps/desktop/package.json`, `tauri.conf.json`, and
   `src-tauri/Cargo.toml` together. (They must agree.)
2. Push to the `release` branch (or trigger the workflow via the GitHub
   UI). `.github/workflows/desktop-release.yml` will:
   - compile the sidecar for both mac triples (arm64, x64),
   - sign the sidecar with Hardened Runtime (allow-jit entitlements),
   - run `tauri-action@v0` which builds + signs + notarises the outer
     `.app` and produces a `.dmg`,
   - publish artifacts to a **draft** GitHub Release including
     `latest.json`.
3. Inspect the draft, then click **Publish**. That last step is what
   flips on auto-update for running clients — `latest.json` only resolves
   for published releases.

### Required secrets

| Secret | Purpose |
| --- | --- |
| `TAURI_SIGNING_PRIVATE_KEY` | Signs the updater payload. Generate with `bun tauri signer generate`. Embed the matching `pubkey` in `tauri.conf.json`. |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password for the updater key. |
| `APPLE_CERTIFICATE` | Base64-encoded Developer ID Application `.p12`. |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the `.p12`. |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (TEAMID)`. |
| `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` | For notarisation via `notarytool`. |

If `APPLE_CERTIFICATE` isn't set, the macOS jobs still build but produce an
unsigned bundle (Gatekeeper warning on first launch).

## Layout

```
apps/desktop/
├── src/                    # Onboarding + Tauri-side React app
│   ├── app.tsx             # Top-level state machine
│   ├── chrome/             # Overlay title bar, settings panel
│   ├── onboarding/         # Welcome → Connect → Connecting → Error
│   ├── lib/                # Tauri command wrappers, store, updates, toasts
│   ├── main.tsx, styles.css
│   └── types.d.ts          # React 19 JSX global
├── sidecar/
│   ├── src/main.ts         # The Hono-backed API server
│   └── build.ts            # Per-triple `bun build --compile`
├── dist-sidecar/           # Sidecar output (gitignored, outside src-tauri/)
└── src-tauri/
    ├── src/                # Rust commands + lifecycle
    │   ├── lib.rs          # connect / disconnect / ping / get_status
    │   ├── redis_ping.rs   # Rust-side Redis ping for the first pill
    │   ├── secrets.rs      # OS-keychain backed password persistence
    │   └── sidecar.rs      # Spawn + handshake + crash-watch
    ├── capabilities/       # ACL for shell:execute and plugin scopes
    ├── tauri.conf.json
    ├── entitlements.plist  # macOS hardened-runtime entitlements (main app)
    ├── sidecar-entitlements.plist  # codesign entitlements for the sidecar
    └── icons/              # Generated via `tauri icon app-icon.png`
```
