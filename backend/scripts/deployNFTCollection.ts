import "dotenv/config";
import { createNFTCollection } from "../src/story/storyService";

/**
 * Deploy SPG NFT Collection for PrompIP
 * This script creates the NFT collection contract on Story Protocol
 * that will be used to mint and register prompt IP assets
 */
async function main() {
  console.log("🚀 Deploying PrompIP NFT Collection on Story Protocol...\n");
  
  try {
    const result = await createNFTCollection();
    
    console.log("\n✅ SUCCESS! NFT Collection Deployed");
    console.log("=====================================");
    console.log("Contract Address:", result.spgNftContract);
    console.log("Transaction Hash:", result.txHash);
    console.log("Network: Story Protocol Aeneid Testnet");
    console.log("Explorer:", `https://aeneid.storyscan.io/address/${result.spgNftContract}`);
    console.log("\n🎯 Use this contract address for your project submission!");
    
  } catch (error) {
    console.error("❌ Error deploying NFT collection:", error);
    process.exit(1);
  }
}

main();
