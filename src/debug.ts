#!/usr/bin/env node

/**
 * Debug script for testing wallet validation and transaction debugging
 * Usage: npm run dev debug-wallet
 */

import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js";
import { WalletManager } from "./wallet/wallet";
import bs58 from "bs58";

async function debugWallet() {
  console.log("🔍 Solana Wallet Debug Tool\n");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Test with a randomly generated wallet (this should work)
  console.log("1️⃣ Testing with a new random wallet:");
  const randomKeypair = Keypair.generate();
  const randomPrivateKey = bs58.encode(randomKeypair.secretKey);

  try {
    const randomWallet = new WalletManager(randomPrivateKey);
    console.log(`✅ Random wallet created: ${randomWallet.getPublicKey()}`);
    await randomWallet.validateForTransactions(connection);
  } catch (error) {
    console.error(
      `❌ Random wallet failed:`,
      error instanceof Error ? error.message : error
    );
  }

  console.log("\n2️⃣ Common issues and solutions:");
  console.log("");
  console.log(
    '🔧 If you get "This account may not be used to pay transaction fees":'
  );
  console.log(
    "   - Make sure you're using a WALLET private key, not a token account"
  );
  console.log(
    "   - The private key should be 64 bytes (128 hex characters or ~88 base58 characters)"
  );
  console.log(
    "   - Don't use Program Derived Addresses (PDAs) as they cannot sign transactions"
  );
  console.log("");
  console.log("🔧 How to get a valid private key:");
  console.log("   - From Phantom wallet: Settings > Show Private Key");
  console.log("   - From Solana CLI: solana-keygen new --outfile wallet.json");
  console.log("   - From this tool: use the random wallet above for testing");
  console.log("");
  console.log("🔧 Valid private key formats:");
  console.log("   - Base58: " + randomPrivateKey);
  console.log(
    "   - Array: [" +
      Array.from(randomKeypair.secretKey).slice(0, 8).join(",") +
      ",...] (64 numbers total)"
  );
  console.log("");

  // Check network status
  console.log("3️⃣ Network status:");
  try {
    const slot = await connection.getSlot();
    const blockHeight = await connection.getBlockHeight();
    console.log(
      `✅ Connected to devnet - Slot: ${slot}, Block Height: ${blockHeight}`
    );
  } catch (error) {
    console.error(`❌ Network connection failed:`, error);
  }

  console.log("\n🎯 To test with your wallet:");
  console.log("   npm run dev start");
}

if (require.main === module) {
  debugWallet().catch(console.error);
}

export { debugWallet };
