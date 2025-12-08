import { client, account } from "./utils";
import { Address } from "viem";
import { PILFlavor, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { createHash } from "crypto";

interface PromptMetadata {
  name: string;
  description: string;
  externalUrl?: string;
  attributes?: { trait_type: string; value: string }[];
}

interface ReputationData {
  trustScore: number;
  effectivenessScore: number;
  verificationCount: number;
  creatorReputationPoints: number;
}

interface LicenseOptions {
  commercialUse: boolean;
  allowResale: boolean;
  royaltyBps: number;
}

// SPG NFT Contract Address - will be set after creating collection
let SPG_NFT_CONTRACT: Address | null = null;

/**
 * Create SPG NFT Collection for PrompIP
 */
export async function createNFTCollection() {
  try {
    const response = await client.nftClient.createNFTCollection({
      name: "PrompIP AI Prompts",
      symbol: "PVPROMPT",
      maxSupply: 1000,
      isPublicMinting: true,
      mintOpen: true,
      mintFeeRecipient: account.address,
      contractURI: "",
    });

    SPG_NFT_CONTRACT = response.spgNftContract!;
    console.log("✅ Created SPG NFT Collection:", SPG_NFT_CONTRACT);
    
    return {
      txHash: response.txHash,
      spgNftContract: response.spgNftContract,
    };
  } catch (error) {
    console.error("Error creating NFT collection:", error);
    throw new Error("Failed to create NFT collection");
  }
}

/**
 * Get or create SPG NFT contract address
 */
async function getSPGNFTContract(): Promise<Address> {
  if (SPG_NFT_CONTRACT) {
    return SPG_NFT_CONTRACT;
  }

  // Create new collection if not exists
  const result = await createNFTCollection();
  return result.spgNftContract!;
}

/**
 * Generate IP metadata JSON with reputation data
 * This creates a standardized metadata structure for on-chain storage
 */
export function generateIPMetadata(
  metadata: PromptMetadata,
  reputation?: ReputationData
): { metadataJson: string; metadataHash: `0x${string}` } {
  const ipMetadata = {
    name: metadata.name,
    description: metadata.description,
    external_url: metadata.externalUrl || "https://prompip.app",
    attributes: [
      ...(metadata.attributes || []),
      // Add reputation attributes
      { trait_type: "trust_score", value: reputation?.trustScore?.toString() || "0" },
      { trait_type: "effectiveness_score", value: reputation?.effectivenessScore?.toString() || "0" },
      { trait_type: "verification_count", value: reputation?.verificationCount?.toString() || "0" },
      { trait_type: "creator_reputation", value: reputation?.creatorReputationPoints?.toString() || "0" },
      { trait_type: "registered_at", value: new Date().toISOString() },
    ],
    reputation: reputation || {
      trustScore: 0,
      effectivenessScore: 0,
      verificationCount: 0,
      creatorReputationPoints: 0,
    },
  };

  const metadataJson = JSON.stringify(ipMetadata);
  const metadataHash = ("0x" + createHash("sha256").update(metadataJson).digest("hex")) as `0x${string}`;

  return { metadataJson, metadataHash };
}

/**
 * Register a prompt as an IP asset on Story Protocol
 * Uses mintAndRegisterIpAssetWithPilTerms to mint NFT + register IP + attach license in one transaction
 */
export async function registerPromptAsIP(metadata: PromptMetadata, reputation?: ReputationData) {
  try {
    // Get or create SPG NFT contract
    const nftContract = await getSPGNFTContract();
    
    console.log(`📝 Registering prompt: "${metadata.name}"`);
    console.log(`🎯 For provable ownership and attribution`);
    
    // Generate metadata with reputation data
    const { metadataJson, metadataHash } = generateIPMetadata(metadata, reputation);
    console.log(`📊 Including reputation data: Trust ${reputation?.trustScore || 0}%, Verifications: ${reputation?.verificationCount || 0}`);

    // Use commercial remix PIL terms (allows commercial use with attribution + derivatives)
    // Setting minting fee to 0 since we're using reputation system instead of payments
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: nftContract,
      licenseTermsData: [
        {
          terms: PILFlavor.commercialRemix({
            defaultMintingFee: 0n, // Free to use - reputation-based system
            commercialRevShare: 0, // No revenue share
            currency: WIP_TOKEN_ADDRESS, // Story Protocol whitelisted WIP token
          }),
        },
      ],
      ipMetadata: {
        ipMetadataURI: `data:application/json;base64,${Buffer.from(metadataJson).toString('base64')}`, // Inline metadata as data URI
        ipMetadataHash: metadataHash,
        nftMetadataURI: "",
        nftMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
      },
    });

    console.log("✅ Registered IP on Story Protocol:", response.ipId);

    return {
      txHash: response.txHash,
      ipId: response.ipId,
      tokenId: response.tokenId,
      licenseTermsId: response.licenseTermsIds?.[0], // First attached license terms
    };
  } catch (error) {
    console.error("Error registering IP on Story:", error);
    throw new Error("Failed to register IP asset on Story Protocol");
  }
}

/**
 * Register a derivative (remix) prompt as a child IP of an existing IP
 * Links the new prompt to the parent using Story Protocol's derivative system
 */
export async function registerDerivativePrompt(
  metadata: PromptMetadata,
  parentIpId: Address,
  parentLicenseTermsId: bigint
) {
  try {
    // Get or create SPG NFT contract
    const nftContract = await getSPGNFTContract();
    
    console.log(`🔄 Registering derivative prompt: "${metadata.name}"`);
    console.log(`👆 Parent IP: ${parentIpId}`);

    // Mint NFT and register as derivative in one transaction
    const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: nftContract,
      derivData: {
        parentIpIds: [parentIpId],
        licenseTermsIds: [parentLicenseTermsId],
        maxMintingFee: 0n, // Free - using reputation system
        maxRts: 0, // No royalty tokens to mint
        maxRevenueShare: 0, // No revenue share
      },
      ipMetadata: {
        ipMetadataURI: "",
        ipMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        nftMetadataURI: "",
        nftMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
      },
    });

    console.log("✅ Registered derivative IP:", response.ipId);
    console.log("🔗 Linked to parent:", parentIpId);

    return {
      txHash: response.txHash,
      ipId: response.ipId,
      tokenId: response.tokenId,
      parentIpId: parentIpId,
    };
  } catch (error) {
    console.error("Error registering derivative IP:", error);
    throw new Error("Failed to register derivative IP on Story Protocol");
  }
}

/**
 * Create a license definition for a given IP
 */
export async function createPromptLicenseDefinition(
  ipId: Address,
  options: LicenseOptions
) {
  try {
    // Attach PIL (Programmable IP License) terms to the IP asset
    const response = await client.license.attachLicenseTerms({
      ipId: ipId,
      licenseTemplate: process.env.LICENSE_TEMPLATE_ADDRESS as Address,
      licenseTermsId: BigInt(1), // Using PIL flavor ID
    });

    return {
      txHash: response.txHash,
      licenseTermsId: BigInt(1), // Return the ID we attached
    };
  } catch (error) {
    console.error("Error creating license definition:", error);
    throw new Error("Failed to create license definition on Story Protocol");
  }
}

/**
 * Issue a license (mint license tokens) to a buyer wallet address
 */
export async function issuePromptLicense(
  ipId: Address,
  licenseTermsId: bigint,
  buyerAddress: Address,
  maxMintingFee: bigint,
  amount: number = 1
) {
  try {
    console.log(`💳 Calling Story Protocol mintLicenseTokens:`);
    console.log(`   IP ID: ${ipId}`);
    console.log(`   License Terms ID: ${licenseTermsId}`);
    console.log(`   Buyer: ${buyerAddress}`);
    console.log(`   Max Minting Fee: ${maxMintingFee} Wei (${Number(maxMintingFee) / 1e18} IP)`);
    console.log(`   Amount: ${amount}`);

    const response = await client.license.mintLicenseTokens({
      licenseTermsId: licenseTermsId,
      licensorIpId: ipId,
      receiver: buyerAddress,
      amount: amount,
      maxMintingFee: maxMintingFee, // Maximum fee buyer is willing to pay
    });

    console.log(`✅ Story Protocol Response:`);
    console.log(`   TX Hash: ${response.txHash}`);
    console.log(`   License Token IDs:`, response.licenseTokenIds?.map(id => id.toString()));

    return {
      txHash: response.txHash,
      licenseTokenIds: response.licenseTokenIds,
    };
  } catch (error) {
    console.error("Error issuing license:", error);
    throw new Error("Failed to issue license on Story Protocol");
  }
}

/**
 * Get IP asset details
 * Note: Direct get method not available in SDK v1.4.2
 * IP details can be queried from blockchain using the ipId
 */
export async function getIPAssetDetails(ipId: Address) {
  // Return the ipId for now - frontend can display it
  // In production, you'd query the blockchain or Story API for details
  return { ipId };
}
