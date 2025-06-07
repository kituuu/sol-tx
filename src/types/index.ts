import { PublicKey, Keypair } from "@solana/web3.js";

export interface WalletInfo {
  publicKey: string;
  balance: number;
}

export interface TransactionDetails {
  signature: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp?: number;
  status: "pending" | "confirmed" | "failed";
}

export interface CLIOptions {
  privateKey?: string;
  to?: string;
  amount?: string;
  cluster?: "devnet" | "testnet" | "mainnet-beta";
}

export interface TransferParams {
  fromKeypair: Keypair;
  toPublicKey: PublicKey;
  amountSOL: number;
}

export type ClusterType = "devnet" | "testnet" | "mainnet-beta";

export interface NetworkInfo {
  cluster: ClusterType;
  url: string;
  explorerBaseUrl: string;
}

export interface WalletBalance {
  sol: number;
  lamports: number;
  formatted: string;
}
