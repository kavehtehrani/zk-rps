import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RockPaperScissorsModule", (m) => {
  // Use existing verifier deployed via Remix
  // Sepolia: https://sepolia.etherscan.io/address/0x7f13ed97b75acd4835bd75b643d9f48814180fc7
  const verifierAddress = m.getParameter(
    "verifierAddress",
    "0x7f13ed97b75acd4835bd75b643d9f48814180fc7"
  );

  const rockPaperScissors = m.contract("RockPaperScissors", [], {});

  // Wire existing verifier into the game contract
  m.call(rockPaperScissors, "setVerifier", [verifierAddress], {
    after: [rockPaperScissors],
    id: "SetVerifier",
  });

  return { rockPaperScissors };
});
