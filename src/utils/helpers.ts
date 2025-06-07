import { PublicKey } from "@solana/web3.js";

/**
 * Format balance for display
 */
export function formatBalance(balance: number): string {
  return balance.toFixed(6);
}

/**
 * Validate if a string is a valid Solana public key
 */
export function validatePublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return sol * 1_000_000_000; // 1 SOL = 1,000,000,000 lamports
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if string is a valid number
 */
export function isValidNumber(str: string): boolean {
  const num = parseFloat(str);
  return !isNaN(num) && isFinite(num) && num > 0;
}

/**
 * Get cluster URL based on environment
 */
export function getClusterUrl(
  cluster: "devnet" | "testnet" | "mainnet-beta" = "devnet"
): string {
  const urls = {
    devnet: "https://api.devnet.solana.com",
    testnet: "https://api.testnet.solana.com",
    "mainnet-beta": "https://api.mainnet-beta.solana.com",
  };
  return urls[cluster];
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(
  signature: string,
  cluster: "devnet" | "testnet" | "mainnet-beta" = "devnet"
): string {
  const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(
  address: string,
  cluster: "devnet" | "testnet" | "mainnet-beta" = "devnet"
): string {
  const clusterParam = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/address/${address}${clusterParam}`;
}
