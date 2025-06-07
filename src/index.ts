#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { WalletManager } from "./wallet/wallet";
import { TransferManager } from "./transaction/transfer";
import { formatBalance, validatePublicKey } from "./utils/helpers";

const program = new Command();

interface WalletState {
  wallet: WalletManager | null;
  connection: Connection;
}

const state: WalletState = {
  wallet: null,
  connection: new Connection(clusterApiUrl("devnet"), "confirmed"),
};

function showErrorHelp(errorMessage: string) {
  if (
    errorMessage.includes(
      "This account may not be used to pay transaction fees"
    )
  ) {
    console.log("\n🔍 Error Analysis:");
    console.log("❌ This account may not be used to pay transaction fees");
    console.log(
      "📝 You're trying to use an account that cannot sign transactions\n"
    );
    console.log("🔧 Solutions:");
    console.log(
      "   1. Make sure you're using a WALLET private key, not a token account"
    );
    console.log(
      "   2. Verify the private key is exactly 64 bytes (88 base58 characters)"
    );
    console.log(
      "   3. Get your private key from Phantom: Settings > Show Private Key"
    );
    console.log(
      "   4. Or generate a new test wallet with: npm run dev generate"
    );
    console.log("\n💡 Need more help? Run: npm run debug");
  } else if (errorMessage.includes("Insufficient balance")) {
    console.log("\n🔍 Error Analysis:");
    console.log("❌ Insufficient balance");
    console.log("📝 Your wallet doesn't have enough SOL for the transaction\n");
    console.log("🔧 Solutions:");
    console.log("   1. Get devnet SOL from: https://faucet.solana.com");
    console.log(
      "   2. Make sure you have extra SOL for transaction fees (~0.000005 SOL)"
    );
    console.log(
      "   3. Check your balance with: npm run dev balance -k YOUR_PRIVATE_KEY"
    );
    console.log("\n💡 Need more help? Run: npm run debug");
  } else {
    console.log(
      "\n🤔 Unknown error. Run 'npm run debug' for troubleshooting help."
    );
  }
}

async function importWallet() {
  const answer = await inquirer.prompt({
    type: "password",
    name: "privateKey",
    message: "Enter your private key (base58 encoded):",
    mask: "*",
  });

  try {
    state.wallet = new WalletManager(answer.privateKey);
    console.log(`✅ Wallet imported successfully!`);
    console.log(`🔑 Public Key: ${state.wallet.getPublicKey()}`);

    // Validate the wallet can be used for transactions
    await state.wallet.validateForTransactions(state.connection);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error importing wallet:", errorMessage);
    showErrorHelp(errorMessage);
    state.wallet = null; // Reset wallet on validation failure
  }
}

async function showBalance() {
  if (!state.wallet) {
    console.error("❌ No wallet imported. Please import a wallet first.");
    return;
  }

  try {
    const publicKey = new PublicKey(state.wallet.getPublicKey());
    const balance = await state.connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    console.log(`💰 Balance: ${formatBalance(solBalance)} SOL`);
  } catch (error) {
    console.error(
      "❌ Error fetching balance:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

async function sendSOL() {
  if (!state.wallet) {
    console.error("❌ No wallet imported. Please import a wallet first.");
    return;
  }

  const recipientAnswer = await inquirer.prompt({
    type: "input",
    name: "recipient",
    message: "Enter recipient public key:",
    validate: (input: string) => {
      return validatePublicKey(input)
        ? true
        : "Please enter a valid public key";
    },
  });

  const amountAnswer = await inquirer.prompt({
    type: "number",
    name: "amount",
    message: "Enter amount to send (SOL):",
    validate: (input: number | undefined) => {
      return input && input > 0 ? true : "Amount must be greater than 0";
    },
  });

  const confirmAnswer = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: `Send ${amountAnswer.amount} SOL to ${recipientAnswer.recipient}?`,
    default: false,
  });

  if (!confirmAnswer.confirm) {
    console.log("❌ Transaction cancelled");
    return;
  }

  try {
    const transferManager = new TransferManager(state.connection);
    const signature = await transferManager.sendSOL(
      state.wallet.getKeypair(),
      new PublicKey(recipientAnswer.recipient),
      amountAnswer.amount
    );

    console.log(`✅ Transaction sent successfully!`);
    console.log(`🔗 Transaction signature: ${signature}`);
    console.log(
      `🌐 View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error sending transaction:", errorMessage);
    showErrorHelp(errorMessage);
  }
}

async function mainMenu() {
  if (!state.wallet) {
    await importWallet();
    if (!state.wallet) return;
  }

  while (true) {
    console.log("\n=== Solana Wallet CLI ===");

    const answer = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "💰 Show Balance", value: "balance" },
        { name: "💸 Send SOL", value: "send" },
        { name: "🔄 Switch Wallet", value: "switch" },
        { name: "🚪 Exit", value: "exit" },
      ],
    });

    switch (answer.action) {
      case "balance":
        await showBalance();
        break;
      case "send":
        await sendSOL();
        break;
      case "switch":
        await importWallet();
        break;
      case "exit":
        console.log("👋 Goodbye!");
        process.exit(0);
    }
  }
}

program
  .name("solana-wallet-cli")
  .description("A CLI tool for Solana wallet operations")
  .version("1.0.0");

program
  .command("start")
  .description("Start the interactive wallet CLI")
  .action(mainMenu);

program
  .command("balance")
  .description("Show wallet balance")
  .option("-k, --private-key <key>", "Private key (base58 encoded)")
  .action(async (options) => {
    if (options.privateKey) {
      try {
        state.wallet = new WalletManager(options.privateKey);
        await showBalance();
      } catch (error) {
        console.error(
          "❌ Error:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    } else {
      console.error(
        "❌ Please provide a private key using -k or --private-key"
      );
    }
  });

program
  .command("send")
  .description("Send SOL to another wallet")
  .option("-k, --private-key <key>", "Private key (base58 encoded)")
  .option("-t, --to <address>", "Recipient public key")
  .option("-a, --amount <amount>", "Amount to send (SOL)")
  .action(async (options) => {
    if (!options.privateKey || !options.to || !options.amount) {
      console.error("❌ Please provide all required options: -k, -t, -a");
      return;
    }

    try {
      state.wallet = new WalletManager(options.privateKey);

      if (!validatePublicKey(options.to)) {
        console.error("❌ Invalid recipient public key");
        return;
      }

      const amount = parseFloat(options.amount);
      if (amount <= 0) {
        console.error("❌ Amount must be greater than 0");
        return;
      }

      const transferManager = new TransferManager(state.connection);
      const signature = await transferManager.sendSOL(
        state.wallet.getKeypair(),
        new PublicKey(options.to),
        amount
      );

      console.log(`✅ Transaction sent successfully!`);
      console.log(`🔗 Transaction signature: ${signature}`);
      console.log(
        `🌐 View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  });

program
  .command("debug")
  .description("Run diagnostic tools and show troubleshooting information")
  .action(async () => {
    const { debugWallet } = await import("./debug");
    await debugWallet();
  });

program
  .command("generate")
  .description("Generate a new random wallet for testing")
  .action(async () => {
    try {
      const newWallet = WalletManager.createNew();
      console.log("🎉 New wallet generated!");
      console.log(`🔑 Public Key: ${newWallet.getPublicKey()}`);
      console.log(`🔐 Private Key: ${newWallet.getPrivateKey()}`);
      console.log("");
      console.log("⚠️  IMPORTANT: Save your private key securely!");
      console.log(
        "⚠️  This wallet has 0 SOL balance. Fund it on devnet to use for transactions."
      );
      console.log("");
      console.log("🚰 Get devnet SOL at: https://faucet.solana.com");
    } catch (error) {
      console.error(
        "❌ Error generating wallet:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  });

// If no command is provided, start interactive mode
if (process.argv.length === 2) {
  mainMenu();
} else {
  program.parse(process.argv);
}
