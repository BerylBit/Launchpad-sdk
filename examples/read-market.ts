import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { LaunchpadSDK, walletFromKeypair } from "../src/index";

// This example is READ-ONLY friendly.
// It shows how to instantiate the SDK and read on-chain state.
// For write actions (buy/sell/etc.), you must provide a funded wallet + correct accounts.

async function main() {
  const RPC = process.env.RPC_URL ?? "https://api.devnet.solana.com";
  const PROGRAM_ID = process.env.LAUNCHPAD_PROGRAM_ID;
  const MARKET = process.env.MARKET_PDA; // optional for read-market

  if (!PROGRAM_ID) {
    throw new Error("Missing LAUNCHPAD_PROGRAM_ID in env");
  }

  const connection = new Connection(RPC, "confirmed");

  // For read-only calls you can still use a random keypair.
  const kp = Keypair.generate();
  const wallet = walletFromKeypair(kp);

  const sdk = new LaunchpadSDK({
    connection,
    wallet,
    programId: new PublicKey(PROGRAM_ID),
  });

  console.log("RPC:", RPC);
  console.log("Program:", PROGRAM_ID);

  // Try reading global config (will exist only if initialized on that cluster)
  try {
    const global = await sdk.getGlobalConfig();
    console.log("GlobalConfig:", global);
  } catch (e) {
    console.log("GlobalConfig not found on this cluster (or not initialized).");
  }

  if (MARKET) {
    const marketPk = new PublicKey(MARKET);
    const market = await sdk.getMarket(marketPk);
    console.log("Market:", market);
  } else {
    console.log("Tip: set MARKET_PDA to read a specific market account.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
