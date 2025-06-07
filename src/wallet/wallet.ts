import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export class WalletManager {
  private keypair: Keypair;

  constructor(privateKey: string) {
    try {
      // Try to decode the private key as base58
      const secretKey = bs58.decode(privateKey);
      if (secretKey.length !== 64) {
        throw new Error(
          `Invalid private key length: expected 64 bytes, got ${secretKey.length}`
        );
      }
      this.keypair = Keypair.fromSecretKey(secretKey);
    } catch (error) {
      try {
        // If base58 decode fails, try as array of numbers
        const secretKey = JSON.parse(privateKey);
        if (Array.isArray(secretKey)) {
          if (secretKey.length !== 64) {
            throw new Error(
              `Invalid private key length: expected 64 bytes, got ${secretKey.length}`
            );
          }
          this.keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
        } else {
          throw new Error("Invalid private key format");
        }
      } catch {
        throw new Error(
          "Invalid private key format. Please provide a base58 encoded private key or array of 64 numbers."
        );
      }
    }

    // Validate that the keypair was created correctly
    console.log(`🔑 Wallet loaded successfully`);
    console.log(`📍 Public Key: ${this.keypair.publicKey.toBase58()}`);
  }

  /**
   * Get the keypair
   */
  getKeypair(): Keypair {
    return this.keypair;
  }

  /**
   * Get the public key as string
   */
  getPublicKey(): string {
    return this.keypair.publicKey.toBase58();
  }

  /**
   * Get the private key as base58 string
   */
  getPrivateKey(): string {
    return bs58.encode(this.keypair.secretKey);
  }

  /**
   * Create a new random wallet
   */
  static createNew(): WalletManager {
    const keypair = Keypair.generate();
    const privateKey = bs58.encode(keypair.secretKey);
    return new WalletManager(privateKey);
  }

  /**
   * Validate if a string is a valid private key
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      new WalletManager(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate that this wallet can be used for transactions
   */
  async validateForTransactions(connection: any): Promise<void> {
    const accountInfo = await connection.getAccountInfo(this.keypair.publicKey);

    if (accountInfo) {
      // Check if this is a system account (owner should be System Program)
      const systemProgramId = "11111111111111111111111111111111";
      if (accountInfo.owner.toBase58() !== systemProgramId) {
        throw new Error(
          `❌ This account is owned by program ${accountInfo.owner.toBase58()} and cannot sign transactions. ` +
            `System accounts should be owned by ${systemProgramId}. ` +
            `You may be using a token account or PDA instead of a wallet account.`
        );
      }
      console.log(
        `✅ Account validation passed - this is a valid system account`
      );
    } else {
      console.log(
        `ℹ️  This account doesn't exist on-chain yet (will be created on first transaction)`
      );
    }
  }
}
