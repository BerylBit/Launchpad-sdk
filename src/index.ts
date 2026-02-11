import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import idl from "./idl.json";

// -----------------------------
// Types
// -----------------------------
export type LaunchpadSdkConfig = {
  programId: PublicKey;
  connection: Connection;
  wallet: anchor.Wallet; // anchor wallet wrapper around your signer
  commitment?: anchor.web3.Commitment;
};

export type InitializeGlobalArgs = {
  treasury: PublicKey;
  maxImpactBps: number; // e.g. 200 = 2%
  maxBuyBpsOfReserve: number; // e.g. 100 = 1%
  maxSellImpactBps: number; // e.g. 100 = 1%
  minCooldownSecs: number; // e.g. 30
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

  // Accounts you may create/derive elsewhere (depending on your program design)
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

    // Anchor global provider (optional but common)
    anchor.setProvider(this.provider);

    this.program = new anchor.Program(
      idl as anchor.Idl,
      cfg.programId,
      this.provider
    );
  }

  // -----------------------------
  // PDA helpers (must match your program seeds)
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

  // If your program also uses a token vault PDA, add that helper too.
  // tokenVaultPda(mint: PublicKey): PublicKey { ... }

  // -----------------------------
  // Reads
  // -----------------------------
  async getGlobalConfig() {
    return this.program.account.globalConfig.fetch(this.globalConfigPda());
  }

  async getMarket(market: PublicKey) {
    return this.program.account.market.fetch(market);
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
        minCooldownSecs: args.minCooldownSecs,
      })
      .accounts({
        admin: this.provider.wallet.publicKey,
        globalConfig: this.globalConfigPda(),
        systemProgram: anchor.web3.SystemProgram.programId,
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
        sellMinVolumeWindowLamports: args.sellMinVolumeWindowLamports,
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
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
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
        systemProgram: anchor.web3.SystemProgram.programId,
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
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async graduate(market: PublicKey) {
    const tx = await this.program.methods
      .graduate()
      .accounts({
        admin: this.provider.wallet.publicKey,
        market,
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
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }
}

// -----------------------------
// Convenience: create wallet from Keypair (useful for scripts)
// -----------------------------
export function walletFromKeypair(kp: Keypair): anchor.Wallet {
  return new anchor.Wallet(kp);
}
