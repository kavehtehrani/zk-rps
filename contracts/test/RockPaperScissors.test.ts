import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toBytes, concat } from "viem";

describe("RockPaperScissors", function () {
  let contract: any;
  let player1: any;
  let player2: any;
  let publicClient: any;
  let walletClients: any[];

  beforeEach(async function () {
    const { viem } = await hre.network.connect();
    publicClient = await viem.getPublicClient();
    walletClients = await viem.getWalletClients();
    
    player1 = walletClients[0];
    player2 = walletClients[1];

    // Deploy contract
    const contractCode = await hre.artifacts.readArtifact("RockPaperScissors");
    const deployResult = await viem.deployContract({
      abi: contractCode.abi,
      bytecode: contractCode.bytecode,
      account: player1.account,
    });
    
    contract = await viem.getContractAt({
      abi: contractCode.abi,
      address: deployResult,
    });
  });

  it("Should create a game", async function () {
    const txHash = await contract.write.createGame({
      account: player1.account,
    });
    
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    const game = await contract.read.getGame([0]);
    expect(game.player1.toLowerCase()).to.equal(player1.account.address.toLowerCase());
    expect(game.status).to.equal(0); // WaitingForPlayer
  });

  it("Should allow player2 to join", async function () {
    // Create game
    await contract.write.createGame({ account: player1.account });
    
    // Join game
    const txHash = await contract.write.joinGame([0], {
      account: player2.account,
    });
    
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    const game = await contract.read.getGame([0]);
    expect(game.player2.toLowerCase()).to.equal(player2.account.address.toLowerCase());
    expect(game.status).to.equal(1); // Committed
  });

  it("Should allow players to commit moves", async function () {
    // Setup game
    await contract.write.createGame({ account: player1.account });
    await contract.write.joinGame([0], { account: player2.account });
    
    // Player 1 commits (rock = 0)
    const p1Move = 0;
    const p1Salt = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const p1Commitment = keccak256(concat([toBytes(p1Move), toBytes(p1Salt)]));
    
    await contract.write.commitMove([0, p1Commitment], {
      account: player1.account,
    });
    
    // Player 2 commits (paper = 1)
    const p2Move = 1;
    const p2Salt = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const p2Commitment = keccak256(concat([toBytes(p2Move), toBytes(p2Salt)]));
    
    await contract.write.commitMove([0, p2Commitment], {
      account: player2.account,
    });
    
    const game = await contract.read.getGame([0]);
    expect(game.player1Commitment).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    expect(game.player2Commitment).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it("Should determine winner correctly (rock beats scissors)", async function () {
    // Setup and commit
    await contract.write.createGame({ account: player1.account });
    await contract.write.joinGame([0], { account: player2.account });
    
    // Player 1: Rock (0)
    const p1Move = 0;
    const p1Salt = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const p1Commitment = keccak256(concat([toBytes(p1Move), toBytes(p1Salt)]));
    
    // Player 2: Scissors (2)
    const p2Move = 2;
    const p2Salt = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const p2Commitment = keccak256(concat([toBytes(p2Move), toBytes(p2Salt)]));
    
    await contract.write.commitMove([0, p1Commitment], { account: player1.account });
    await contract.write.commitMove([0, p2Commitment], { account: player2.account });
    
    // Reveal moves (empty proof for now - will integrate ZK verifier later)
    await contract.write.revealMove([0, p1Move, p1Salt, "0x"], {
      account: player1.account,
    });
    await contract.write.revealMove([0, p2Move, p2Salt, "0x"], {
      account: player2.account,
    });
    
    const game = await contract.read.getGame([0]);
    expect(game.winner).to.equal(1); // Player 1 wins
    expect(game.status).to.equal(3); // Completed
  });
});
