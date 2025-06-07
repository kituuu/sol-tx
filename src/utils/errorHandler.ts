/**
 * Enhanced error handling and troubleshooting utilities
 */

export interface ErrorSolution {
  error: string;
  description: string;
  solutions: string[];
  links?: string[];
}

export const COMMON_ERRORS: ErrorSolution[] = [
  {
    error: "This account may not be used to pay transaction fees",
    description:
      "You're trying to use an account that cannot sign transactions (like a token account or PDA)",
    solutions: [
      "Make sure you're using a WALLET private key, not a token account address",
      "Verify the private key is exactly 64 bytes (88 base58 characters)",
      "Don't use Program Derived Addresses (PDAs) - they cannot sign transactions",
      "Get your private key from Phantom: Settings > Show Private Key",
      "Or generate a new test wallet with: npm run dev generate",
    ],
    links: [
      "https://docs.solana.com/developing/programming-model/accounts",
      "https://phantom.app/",
    ],
  },
  {
    error: "Insufficient balance",
    description:
      "Your wallet doesn't have enough SOL to cover the transaction amount plus fees",
    solutions: [
      "Check your balance with: npm run dev balance -k YOUR_PRIVATE_KEY",
      "Get devnet SOL from the faucet: https://faucet.solana.com",
      "Make sure you have extra SOL for transaction fees (~0.000005 SOL)",
      "Wait a few minutes after requesting from faucet for balance to update",
    ],
    links: ["https://faucet.solana.com"],
  },
  {
    error: "Invalid private key format",
    description: "The private key you provided is not in a valid format",
    solutions: [
      "Use base58 encoded format (88 characters starting with letters/numbers)",
      "Or use array format: [1,2,3,...] with exactly 64 numbers",
      "Don't include spaces or special characters",
      "Make sure you copied the full private key without truncation",
    ],
  },
  {
    error: "Network connection failed",
    description: "Cannot connect to the Solana network",
    solutions: [
      "Check your internet connection",
      "Try switching to a different RPC endpoint",
      "Wait a few minutes and try again (network might be congested)",
      "Use mainnet-beta for production (currently using devnet for testing)",
    ],
  },
];

export function findErrorSolution(errorMessage: string): ErrorSolution | null {
  return (
    COMMON_ERRORS.find((solution) =>
      errorMessage.toLowerCase().includes(solution.error.toLowerCase())
    ) || null
  );
}

export function displayErrorHelp(error: string): void {
  const solution = findErrorSolution(error);

  if (solution) {
    console.log(`\n🔍 Error Analysis:`);
    console.log(`❌ ${solution.error}`);
    console.log(`📝 ${solution.description}\n`);

    console.log(`🔧 Solutions:`);
    solution.solutions.forEach((sol, index) => {
      console.log(`   ${index + 1}. ${sol}`);
    });

    if (solution.links) {
      console.log(`\n🔗 Helpful Links:`);
      solution.links.forEach((link) => {
        console.log(`   • ${link}`);
      });
    }

    console.log(`\n💡 Need more help? Run: npm run debug`);
  } else {
    console.log(
      `\n🤔 Unknown error. Run 'npm run debug' for troubleshooting help.`
    );
  }
}
