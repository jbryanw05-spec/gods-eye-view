# GOD'S EYE: OMEGA — Start Here

This is the OMEGA-enhanced fork of God's Eye View.

## Windows: easiest local launch

1. Download this repository as a ZIP: https://github.com/jbryanw05-spec/gods-eye-view/archive/refs/heads/main.zip
2. Extract the ZIP to a folder you can find again.
3. Install Node.js **24.14.x** or **26.x** if it is not already installed: https://nodejs.org/en/download
4. Double-click **START-GODS-EYE-OMEGA.bat** in the extracted folder.
5. Keep the black terminal window open. Your browser opens to http://localhost:4173.

The first launch installs the exact locked dependencies automatically. Later launches reuse them. The launcher checks the environment before starting.

## What works without API keys

The app can start without API keys. Some imagery, search, voice, and specialist provider features need optional third-party credentials. Add credentials only through the app's Provider Settings / POWER UP flow; never commit secrets to this repository.

## Important security note

The launcher binds the server to **127.0.0.1** (this computer only). Do not change that to 0.0.0.0 or expose the port to the public internet without first adding authentication and reviewing the provider-key proxy surface. The app is designed for local use by default.

## Troubleshooting

- **Node not found:** install Node.js 24.14.x or 26.x, close and reopen the terminal, then run the launcher again.
- **Dependency install fails:** check your internet connection and run the launcher again.
- **Port 4173 is busy:** close the other app using that port, then retry.
- **Setup check reports an issue:** follow the exact message printed by `npm run doctor`.

For manual setup, open PowerShell in the extracted folder and run:

```powershell
npm ci
npm run doctor
npm run dev -- --host 127.0.0.1 --strictPort --open
```
