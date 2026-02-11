

# Berylbit Launchpad SDK

Official TypeScript SDK for interacting with the **Berylbit Launchpad** protocol on Solana.

This SDK is the primary integration surface for:
- frontends
- bots / keepers
- analytics dashboards
- partner launch tooling

It wraps the on-chain program into clean, composable functions so integrators do **not** need to:
- manually derive PDAs
- build raw instructions
- decode account layouts
- track Anchor version changes

---

## Install (GitHub)

### Stable (recommended)
```bash
npm install github:BerylBit/Launchpad-sdk#v0.1.0
