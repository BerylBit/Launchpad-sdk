
# Berylbit Launchpad SDK 

Official TypeScript / JavaScript SDK for interacting with the **Berylbit Launchpad** protocol on Solana. https://t.me/Berylbit

This SDK allows developers to **connect to**, **read from**, and **build on top of** the Berylbit Launchpad without access to the private on-chain core.

> The core protocol logic is intentionally private.
> This SDK is the public integration layer.

---

## What can I do with this SDK?

* Build launchpad frontends
* Read markets and protocol state
* Build bots / keepers / analytics
* Prepare integrations before public launch

This SDK is **build-ready**.
Public token launches are **not enabled yet**.

---

## Requirements

* Node.js v18+
* npm or yarn
* Basic JavaScript or TypeScript knowledge

No Solana CLI required for basic usage.

---

## Quick Start (see it work in 2 minutes)

### 1️⃣ Create a new project

```bash
mkdir berylbit-test
cd berylbit-test
npm init -y
```

---

### 2️⃣ Install the SDK

```bash
npm install github:BerylBit/Launchpad-sdk
```

This installs the SDK into `node_modules/`.

---

### 3️⃣ Create a test file

Create a file called `test.js`:

```js
const { LaunchpadSDK } = require("berylbit-launchpad-sdk");

console.log("SDK loaded:", typeof LaunchpadSDK);
```

---

### 4️⃣ Run it

```bash
node test.js
```

If you see:

```
SDK loaded: function
```

✅ The SDK is installed and working.

You are now ready to build.

---

## Where is the SDK code?

After install, the compiled SDK lives here:

```
node_modules/berylbit-launchpad-sdk/dist/
```

You **do not** need to open these files manually.

You import the SDK in your own code and build on top of it.

---

## Connecting to the protocol (example)

```js
const { LaunchpadSDK } = require("berylbit-launchpad-sdk");
const { Connection, PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://api.devnet.solana.com");

const sdk = new LaunchpadSDK({
  connection,
  programId: new PublicKey("PROGRAM_ID_HERE")
});

console.log("Connected to Berylbit Launchpad");
```

> A public devnet program ID will be provided when available.

---

## Running repository examples (recommended)

Examples are included **in this repository**.

To run them:

```bash
git clone https://github.com/BerylBit/Launchpad-sdk
cd Launchpad-sdk
npm install
```

Copy environment config:

```bash
cp examples/.env.example .env
```

Run example:

```bash
node examples/read-market.ts
```

This will connect to the protocol and read market state.

---

## Project Structure (for clarity)

```
Launchpad-sdk/
├── src/          # SDK client (TypeScript)
├── examples/     # Example scripts
├── dist/         # Compiled output (for npm)
├── README.md
├── package.json
└── LICENSE
```

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


## Important Notes

* This SDK does **not** deploy contracts
* This SDK does **not** custody funds
* This SDK does **not** expose private protocol logic
* All enforcement happens on-chain

---

## Status

* ✅ SDK: Live
* 🔒 Core protocol: Private
* 🧪 Public launches: Coming later
* 🧱 Builders: Welcome

---

## License

MIT © Berylbit

---

## Disclaimer

This SDK is provided for integration purposes only.
Use at your own risk. This is not financial advice.

---


