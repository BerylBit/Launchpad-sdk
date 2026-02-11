

# Berylbit Launchpad SDK 

Official TypeScript SDK for interacting with the **Berylbit Launchpad** protocol on **Solana**.
https://t.me/Berylbit

This repository contains the **public client-side integration layer** used by applications, bots, and partners to interact with the Berylbit on-chain program.

> **Important:** This repository does **not** contain the on-chain program source code.
> The core protocol logic is intentionally private.

---

## What This SDK Is

The Berylbit Launchpad SDK is a **thin, strongly-typed client wrapper** around the on-chain Berylbit Launchpad program.

It provides:

* Safe instruction builders
* PDA derivation helpers
* Typed account decoding
* A clean interface for frontends, bots, and keepers

This allows integrators to work with the protocol **without**:

* Manually deriving PDAs
* Writing raw transactions
* Handling low-level Anchor plumbing
* Copying protocol logic

---

## What This SDK Is Not

* ❌ This is **not** the on-chain program
* ❌ This is **not** a forkable launchpad
* ❌ This does **not** expose proprietary execution logic
* ❌ This is **not** a full reference implementation

The **Launchpad Core** (bonding curve logic, execution rules, value capture mechanisms) is private and deployed on-chain.

---

## Architecture Overview

```
┌──────────────────────────┐
│  Frontends / Bots / UI   │
│  Analytics / Keepers     │
└─────────────▲────────────┘
              │
              │  TypeScript SDK
              │
┌─────────────┴────────────┐
│   Berylbit Launchpad SDK │
│   (this repository)     │
└─────────────▲────────────┘
              │
              │  Anchor / IDL
              │
┌─────────────┴────────────┐
│  Berylbit Launchpad Core │
│  (private, on-chain)     │
└──────────────────────────┘
```

---

## Installation (GitHub)

The SDK is currently distributed directly via GitHub.

```bash
npm install github:BerylBit/Launchpad-sdk
```

> Only the compiled `dist/` output is shipped to consumers.
> Source code lives in this repository for transparency and review.

---

## Basic Usage

```ts
import { LaunchpadSDK } from "berylbit-launchpad-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");

const sdk = new LaunchpadSDK({
  connection,
  programId: new PublicKey("BERYLbit_PROGRAM_ID_HERE"),
});

// Example: fetch global config
const config = await sdk.getGlobalConfig();
```

---

## Use Cases

This SDK is intended for:

* Frontend launchpad UIs
* Trading bots and keepers
* Analytics dashboards
* Partner integrations
* Indexers and monitoring tools

---

## Examples

See the [`/examples`](./examples) directory for:

* Market reads
* Config fetching
* Environment setup

---

## Design Principles

* **0% user trading fees**
* **No hidden spreads**
* **No forced routers**
* **No transfer-tax tokens**
* **Market-native value capture**
* **Bot-resistant execution paths**

The SDK exposes **interfaces**, not mechanisms.

---

## Security & Audits

This SDK:

* Is a **client library**, not a custody system
* Does not hold keys
* Does not sign transactions on behalf of users

All security assumptions are enforced by the on-chain program.

---

## Versioning

* Semantic versioning (`v0.x.y`)
* Breaking changes documented per release
* GitHub tags used for distribution

---

## License

MIT © Berylbit

---

## Disclaimer

This repository is provided for **integration purposes only**.
It is **not an audit**, **not investment advice**, and **not a guarantee of protocol safety**.

Use at your own risk.
