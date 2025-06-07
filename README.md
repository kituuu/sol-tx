# Solana Wallet CLI

A TypeScript command-line interface application for Solana wallet operations. This CLI tool allows you to import wallets, check balances, and send SOL transactions on the Solana blockchain.

## Features

- 🔐 Import wallet using private key (base58 or array format)
- 💰 Check SOL balance
- 💸 Send SOL to other wallets
- 🌐 Works with Solana devnet (configurable for other networks)
- 📱 Interactive CLI interface
- ⚡ Command-line arguments support

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Interactive Mode

Start the interactive CLI:

```bash
npm start
```

Or if you want to run in development mode:

```bash
npm run dev
```

### Command Line Arguments

#### Check Balance

```bash
npm run dev balance -k YOUR_PRIVATE_KEY
```

#### Send SOL

```bash
npm run dev send -k YOUR_PRIVATE_KEY -t RECIPIENT_PUBLIC_KEY -a AMOUNT
```

### Examples

```bash
# Check balance
npm run dev balance -k "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXp32x7rVP8"

# Send 0.1 SOL
npm run dev send -k "YOUR_PRIVATE_KEY" -t "RECIPIENT_PUBLIC_KEY" -a 0.1
```

## Available Solana APIs

This application uses the following Solana Web3.js APIs:

### Connection APIs

- `getBalance(publicKey)` - Get SOL balance for an address
- `getAccountInfo(publicKey)` - Get account information
- `getTransaction(signature)` - Get transaction details
- `getFeeForMessage(message)` - Estimate transaction fees
- `getLatestBlockhash()` - Get recent blockhash for transactions

### Transaction APIs

- `sendAndConfirmTransaction()` - Send and wait for transaction confirmation
- `SystemProgram.transfer()` - Create SOL transfer instruction
- `Transaction.add()` - Add instructions to transaction

### Wallet APIs

- `Keypair.generate()` - Generate new random keypair
- `Keypair.fromSecretKey()` - Import keypair from private key
- `PublicKey()` - Create and validate public keys
- Base58 encoding/decoding for keys

### Network Information

- Devnet: `https://api.devnet.solana.com`
- Testnet: `https://api.testnet.solana.com`
- Mainnet: `https://api.mainnet-beta.solana.com`

## Project Structure

```
src/
├── index.ts              # Main CLI application
├── wallet/
│   └── wallet.ts         # Wallet management utilities
├── transaction/
│   └── transfer.ts       # Transaction handling
├── utils/
│   └── helpers.ts        # Helper functions
└── types/
    └── index.ts          # TypeScript type definitions
```

## Configuration

The application uses Solana devnet by default. You can modify the network in `src/index.ts`:

```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
```

Change `'devnet'` to `'testnet'` or `'mainnet-beta'` as needed.

## Private Key Formats

The application supports two private key formats:

1. **Base58 encoded** (recommended):

   ```
   5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXp32x7rVP8
   ```

2. **Array of numbers**:
   ```
   [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]
   ```

## Security Notes

⚠️ **Important Security Considerations:**

1. Never share your private keys
2. Use devnet for testing
3. This tool is for educational/development purposes
4. Store private keys securely
5. Consider using environment variables for private keys in production

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Clean

```bash
npm run clean
```

## Dependencies

- `@solana/web3.js` - Solana JavaScript SDK
- `@solana/spl-token` - SPL Token program interactions
- `inquirer` - Interactive command line prompts
- `commander` - Command line interface framework
- `bs58` - Base58 encoding/decoding

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:

- Check the [Solana documentation](https://docs.solana.com/)
- Review [Solana Web3.js docs](https://solana-labs.github.io/solana-web3.js/)
- Open an issue in this repository
