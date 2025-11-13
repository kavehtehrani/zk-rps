# ZK Rock Paper Scissors Game

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![Solidity 0.8.20](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![Hardhat 3](https://img.shields.io/badge/Hardhat-3.0-fff100?logo=hardhat&logoColor=black) ![Noir](https://img.shields.io/badge/Noir-ZK-black?logo=aztec&labelColor=000000)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js)

A zero-knowledge rock-paper-scissors game where players commit moves, reveal with ZK proofs, and resolve games on-chain. Built with **Noir**, **Barretenberg**, **Hardhat 3**, and **Ethereum**.

![screenshot](./public/screenshot.png)

## Overview

Players generate zero-knowledge proofs using Noir circuits that prove:

- Both moves are valid (0=Rock, 1=Paper, 2=Scissors)
- The winner calculation is mathematically correct
- The game logic matches the smart contract's resolution logic

## Technology Stack

- **Noir**: Domain-specific language for ZK circuits
- **Barretenberg**: Backend proof system  
- **NoirJS**: JavaScript bindings for Noir circuits
- **Solidity 0.8.20**: Game logic and state management
- **Hardhat 3**: Development environment
- **Vite**: Frontend build tool
- **Ethers.js v6**: Ethereum interaction

## How Zero-Knowledge Works

### The Circuit (`circuit/src/main.nr`)

The Noir circuit validates moves and computes the winner.

### Commit-Reveal Scheme

To prevent front-running and ensure fair play:

1. **Commit Phase**:

   - Player 1 generates random salt and creates commitment: `keccak256(move || salt)`
   - Player 1 submits commitment hash to contract (move is hidden)
   - Player 2 joins by submitting their move directly (no commit needed)

2. **Reveal Phase**:

   - Player 1 reveals move + salt
   - Contract verifies `keccak256(move || salt) == commitment`
   - ZK proof generated proving winner calculation

3. **Resolution**:
   - Contract verifies ZK proof on-chain (if verifier is set)
   - Contract's `_resolveGame()` determines winner

## Game Flow

```
Player 1                     Contract                    Player 2
   |                            |                            |
   |-- createGame(commitment) ->|                            |
   |                            |                            |
   |                            |<-- joinGame(move2) -------|
   |                            |                            |
   |-- resolveGame(move+salt) ->|                            |
   |     + ZK proof             |                            |
   |                            |                            |
   |                            |-- _resolveGame() ----------|
   |<-- GameResolved event -----|                            |
```

## Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Noir** ([install instructions](https://noir-lang.org/docs/getting_started/nargo_installation))
- **MetaMask** (for wallet connection)

### 1. Install Dependencies

```bash
# Circuit dependencies (Noir comes with nargo)
cd circuit
nargo --version  # Verify installation

# Contract dependencies
cd ../contracts
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Compile Circuit

```bash
cd circuit
nargo compile
nargo test  # Verify all tests pass
```

This generates `target/circuit.json` needed by the frontend.

### 3. Setup Frontend Artifacts

```bash
cd frontend

# Copy compiled circuit
mkdir -p target
cp ../circuit/target/circuit.json target/

# Contract artifact will be loaded from deployments.json after deployment
```

## Running Locally

### 1. Start Hardhat Node

```bash
cd contracts
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with Chain ID `31337`.

### 2. Deploy Contract

In a new terminal:

```bash
cd contracts
npx hardhat ignition deploy ignition/modules/RockPaperScissors.ts --network localhost
```

The contract address will be saved to `frontend/deployments.json` automatically.

### 3. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## License

GPLv3
