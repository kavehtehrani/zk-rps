import { defineConfig, configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-viem-assertions";
import hardhatIgnitionViemPlugin from "@nomicfoundation/hardhat-ignition-viem";
import "@solidstate/hardhat-contract-sizer";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from root directory (parent of contracts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env") });

export default defineConfig({
  plugins: [hardhatIgnitionViemPlugin],
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    overrides: {
      "contracts/UltraVerifier.sol": {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1, // Minimum runs for smallest deployment size (23,937 bytes vs 24,857 with runs: 200)
            // Lower runs = smaller bytecode size, higher runs = more efficient runtime
            // See: https://docs.base.org/learn/hardhat/hardhat-tools-and-testing/reducing-contract-size
          },
          metadata: {
            bytecodeHash: "none", // Shrink bytecode by omitting metadata hash
          },
          debug: {
            revertStrings: "strip", // Remove revert strings to reduce size
          },
          // viaIR causes stack too deep errors for this large contract
        },
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
    strict: true,
  },
  networks: {
    hardhat: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      // blockGasLimit is read by 'hardhat node' command
      // Set to 30M to accommodate large verifier contract (~24KB bytecode)
      blockGasLimit: 30000000,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      // Set high gas limit for large contract deployment
      // The verifier contract is ~23KB and needs significant gas
      gas: 30000000, // Transaction gas limit
      gasPrice: "auto",
      timeout: 60000, // 60 seconds timeout
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      // Sepolia has high block gas limit (30M+), should handle large contracts
      gas: "auto",
      gasPrice: "auto",
      timeout: 120000, // 2 minutes timeout for testnet
    },
  },
});
