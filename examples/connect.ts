import { LaunchpadSDK } from "../src";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(process.env.RPC_URL!);

const sdk = new LaunchpadSDK({
  connection,
  programId: new PublicKey(process.env.PROGRAM_ID!)
});

console.log("SDK connected");
