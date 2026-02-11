import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import idl from "./idl.json";

// -----------------------------
// Types
// -----------------------------
export type LaunchpadSdkConfig = {
  programId: PublicKey;
  connection: Connection;
  wallet: anchor.Wallet;
  commitment?: anchor.web3.Commitment;
};

export type InitializeGlobalArgs = {
  treasury: PublicKey;
  maxImpactBps: number;
  maxBuyBpsOfReserve: number;
  maxSellImpactBps: number;
  minCooldownSecs: number;
};

export type CreateMarketArgs = {
  mint: PublicKey;

  creator: PublicKey;
  marketing: PublicKey;

  curveA: anchor.BN;
  curveB: anchor.BN;

  maxTradeImpactBps: number;
  maxBuyBpsOfReserve: number;

  sellCooldownSecs: number;
  sellMaxImpactBps: number;
  sellMaxPerCallLamports: anchor.BN;
  sellMinVolumeWindowLamports: anchor.BN;

  tokenVault: PublicKey;
  solVault?: PublicKey;
  payer?: PublicKey;
};

export type BuyArgs = {
  market: PublicKey;
  tokenVault: PublicKey;
  solVault: PublicKey;

  buyerTokenAccount: PublicKey;
  lamportsIn: anchor.BN;
  minTokensOut: anchor.BN;
};

export type SellArgs = {
  market: PublicKey;

  sellerTokenAccount: PublicKey;
  tokenVault: PublicKey;
  solVault: PublicKey;

  tokensIn: anchor.BN;
  minLamportsOut: anchor.BN;
};

export type VaultSellArgs = {
  market: PublicKey;
  treasury: PublicKey;
  creatorWallet: PublicKey;
  marketingWallet: PublicKey;

  maxLamportsToSell: anchor.BN;
  nowTs: anchor.BN;
  recentVolumeLamports: anchor.BN;
};

// -----------------------------
// SDK
// -----------------------------
export class LaunchpadSDK {
  readonly provider: anchor.AnchorProvider;
  readonly program: anchor.Program;

  constructor(cfg: LaunchpadSdkConfig) {
    this.provider = new anchor.AnchorProvider(
      cfg.connection,
      cfg.wallet,
      { commitment: cfg.commitment ?? "confirmed" }
    );

    anchor.setProvider(this.provider);

    // Anchor v0.30 expects idl.address + idl.metadata (not always present in reference/public IDLs).
    const runtimeIdl = idl as unknown as anchor.Idl & { address?: string; metadata?: any };
    runtimeIdl.address = cfg.programId.toBase58();
    runtimeIdl.metadata = runtimeIdl.metadata ?? { name: "launchpad_core" };

    // Anchor v0.30 Program constructor signature: new Program(idl, provider)
    this.program = new anchor.Program(runtimeIdl as any, this.provider);
  }

  // -----------------------------
  // PDA helpers
  // -----------------------------
  globalConfigPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      this.program.programId
    );
    return pda;
  }

  marketPda(mint: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), mint.toBuffer()],
      this.program.programId
    );
    return pda;
  }

  solVaultPda(mint: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), mint.toBuffer()],
      this.program.programId
    );
    return pda;
  }

  // -----------------------------
  // Reads (loose typing so reference IDL works)
  // -----------------------------
  async getGlobalConfig() {
    const acct = (this.program.account as any).globalConfig;
    return acct.fetch(this.globalConfigPda());
  }

  async getMarket(market: PublicKey) {
    const acct = (this.program.account as any).market;
    return acct.fetch(market);
  }

  // -----------------------------
  // Writes
  // -----------------------------
  async initializeGlobal(args: InitializeGlobalArgs) {
    const tx = await this.program.methods
      .initializeGlobal({
        treasury: args.treasury,
        maxImpactBps: args.maxImpactBps,
        maxBuyBpsOfReserve: args.maxBuyBpsOfReserve,
        maxSellImpactBps: args.maxSellImpactBps,
        minCooldownSecs: args.minCooldownSecs
      })
      .accounts({
        admin: this.provider.wallet.publicKey,
        globalConfig: this.globalConfigPda(),
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    return tx;
  }

  async createMarket(args: CreateMarketArgs) {
    const payer = args.payer ?? this.provider.wallet.publicKey;
    const market = this.marketPda(args.mint);
    const solVault = args.solVault ?? this.solVaultPda(args.mint);

    const tx = await this.program.methods
      .createMarket({
        creator: args.creator,
        marketing: args.marketing,
        curveA: args.curveA,
        curveB: args.curveB,
        maxTradeImpactBps: args.maxTradeImpactBps,
        maxBuyBpsOfReserve: args.maxBuyBpsOfReserve,
        sellCooldownSecs: args.sellCooldownSecs,
        sellMaxImpactBps: args.sellMaxImpactBps,
        sellMaxPerCallLamports: args.sellMaxPerCallLamports,
        sellMinVolumeWindowLamports: args.sellMinVolumeWindowLamports
      })
      .accounts({
        payer,
        globalConfig: this.globalConfigPda(),
        mint: args.mint,
        market,
        tokenVault: args.tokenVault,
        solVault,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      })
      .rpc();

    return { tx, market, solVault };
  }

  async buy(args: BuyArgs) {
    const tx = await this.program.methods
      .buy(args.lamportsIn, args.minTokensOut)
      .accounts({
        buyer: this.provider.wallet.publicKey,
        market: args.market,
        tokenVault: args.tokenVault,
        solVault: args.solVault,
        buyerTokenAccount: args.buyerTokenAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    return tx;
  }

  async sell(args: SellArgs) {
    const tx = await this.program.methods
      .sell(args.tokensIn, args.minLamportsOut)
      .accounts({
        seller: this.provider.wallet.publicKey,
        market: args.market,
        sellerTokenAccount: args.sellerTokenAccount,
        tokenVault: args.tokenVault,
        solVault: args.solVault,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID
      })
      .rpc();

    return tx;
  }

  async graduate(market: PublicKey) {
    const tx = await this.program.methods
      .graduate()
      .accounts({
        admin: this.provider.wallet.publicKey,
        market
      })
      .rpc();

    return tx;
  }

  async vaultSell(args: VaultSellArgs) {
    const tx = await this.program.methods
      .vaultSell(args.maxLamportsToSell, args.nowTs, args.recentVolumeLamports)
      .accounts({
        keeper: this.provider.wallet.publicKey,
        market: args.market,
        treasury: args.treasury,
        creatorWallet: args.creatorWallet,
        marketingWallet: args.marketingWallet,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    return tx;
  }
}

// Convenience for scripts
export function walletFromKeypair(kp: Keypair): anchor.Wallet {
  return new anchor.Wallet(kp);
}
