import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SendTransactionError,
} from "@solana/web3.js";

export class TransferManager {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Send SOL from one wallet to another
   */
  async sendSOL(
    fromKeypair: Keypair,
    toPublicKey: PublicKey,
    amountSOL: number
  ): Promise<string> {
    const lamports = amountSOL * LAMPORTS_PER_SOL;

    console.log(`🔍 Validating transaction...`);
    console.log(`📤 From: ${fromKeypair.publicKey.toBase58()}`);
    console.log(`📥 To: ${toPublicKey.toBase58()}`);
    console.log(`💰 Amount: ${amountSOL} SOL`);

    // Validate that the sender account is a valid system account
    const senderAccountInfo = await this.connection.getAccountInfo(
      fromKeypair.publicKey
    );
    if (
      senderAccountInfo &&
      senderAccountInfo.owner.toBase58() !== "11111111111111111111111111111111"
    ) {
      throw new Error(
        `❌ Invalid sender account. This account is owned by program ${senderAccountInfo.owner.toBase58()} and cannot be used to pay transaction fees. Make sure you're using a system account, not a token account or PDA.`
      );
    }

    // Check if sender has sufficient balance
    const senderBalance = await this.connection.getBalance(
      fromKeypair.publicKey
    );
    console.log(`💰 Current balance: ${senderBalance / LAMPORTS_PER_SOL} SOL`);

    // Estimate transaction fee first
    const estimatedFee = await this.estimateTransactionFee(
      fromKeypair.publicKey,
      toPublicKey,
      amountSOL
    );
    console.log(`⚡ Estimated fee: ${estimatedFee} SOL`);

    const totalRequired = lamports + estimatedFee * LAMPORTS_PER_SOL;
    if (senderBalance < totalRequired) {
      throw new Error(
        `❌ Insufficient balance. You have ${
          senderBalance / LAMPORTS_PER_SOL
        } SOL, but need ${
          totalRequired / LAMPORTS_PER_SOL
        } SOL (${amountSOL} SOL + ${estimatedFee} SOL fee)`
      );
    }

    // Create transfer instruction
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports,
    });

    // Create transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    console.log(`🚀 Sending transaction...`);

    try {
      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair],
        {
          commitment: "confirmed",
          maxRetries: 3,
        }
      );

      return signature;
    } catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.connection);
        console.error(`❌ Transaction failed with logs:`, logs);
        throw new Error(
          `Transaction failed: ${error.message}\nLogs: ${
            logs?.join("\n") || "No logs available"
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature: string) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateTransactionFee(
    fromPublicKey: PublicKey,
    toPublicKey: PublicKey,
    amountSOL: number
  ): Promise<number> {
    const lamports = amountSOL * LAMPORTS_PER_SOL;

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports,
    });

    const transaction = new Transaction().add(transferInstruction);
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;

    const fee = await this.connection.getFeeForMessage(
      transaction.compileMessage(),
      "confirmed"
    );

    return fee.value ? fee.value / LAMPORTS_PER_SOL : 0;
  }

  /**
   * Check if an address exists on the network
   */
  async checkAddressExists(publicKey: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch {
      return false;
    }
  }
}
