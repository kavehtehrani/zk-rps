# ZK Rock Paper Scissors Game

A zero-knowledge rock-paper-scissors game built with Noir, Barretenberg, and Hardhat 3.

## Project Structure

```
zk-rps/
├── circuit/          # Noir ZK circuit
│   ├── src/
│   │   └── main.nr   # Circuit logic
│   └── Nargo.toml
├── contracts/        # Solidity smart contracts
│   ├── contracts/
│   │   ├── RockPaperScissors.sol
│   │   └── RockPaperScissors.t.sol
│   ├── scripts/
│   │   └── deploy.ts
│   └── hardhat.config.ts
└── frontend/         # Web frontend
    ├── index.html
    ├── app.js
    └── vite.config.js
```

## Setup

### 1. Noir Circuit

```bash
cd circuit
nargo compile
nargo test  # Verify all tests pass
```

### 2. Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test solidity  # Run tests
```

### 3. Frontend

```bash
cd frontend
npm install
# Copy circuit JSON
cp ../circuit/target/circuit.json target/
# Copy contract artifact
cp ../contracts/artifacts/contracts/RockPaperScissors.sol/RockPaperScissors.json contract-artifact.json
```

## Local Testing

### Start Hardhat Node

```bash
cd contracts
npx hardhat node
```

### Deploy Contract

In a new terminal:

```bash
cd contracts
npx hardhat ignition deploy ignition/modules/RockPaperScissors.ts --network localhost
```

Copy the contract address from the output and update `CONTRACT_ADDRESS` in `frontend/app.js`.

The deployment address will look like:

```
RockPaperScissorsModule#RockPaperScissors - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and connect your wallet (MetaMask configured for Hardhat network).

### Fund Your Wallet

When you run `npx hardhat node`, Hardhat creates 20 pre-funded accounts with 10,000 ETH each. You can:

**Option 1: Import a Hardhat account into MetaMask** (easiest)

- Copy a private key from the Hardhat node output
- In MetaMask: Account icon → Import Account → Paste private key

**Option 2: Send ETH to your MetaMask account**

```bash
cd contracts
npx hardhat run scripts/fundWallet.ts --network localhost <YOUR_METAMASK_ADDRESS>
```

## How It Works

1. **Commit Phase**: Both players commit their moves as hashes (move + salt)
2. **Reveal Phase**: Players reveal their moves with ZK proofs proving:
   - The revealed move matches the commitment
   - The move is valid (0, 1, or 2)
   - The winner is correctly determined
3. **Resolution**: Contract verifies proofs and resolves the game

## Deployment

The contract is deployed using Hardhat Ignition. Deployment artifacts are stored in `ignition/deployments/` and can be used to resume or modify deployments.

To deploy to localhost (after starting `npx hardhat node`):

```bash
npx hardhat ignition deploy ignition/modules/RockPaperScissors.ts --network localhost
```

## Next Steps

- [ ] Integrate ZK proof verifier contract
- [ ] Add betting/stakes functionality
- [ ] Improve frontend UX
- [ ] Deploy to testnet
