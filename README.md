# PrompIP

**AI Prompt Ownership & Licensing Marketplace powered by Story Protocol**

PrompIP is a Web3 marketplace where creators can register AI prompts as intellectual property (IP) assets on Story Protocol's blockchain. Create programmable licenses, build derivative works, earn reputation, and trade prompts in a decentralized marketplace.

## ✨ Features

- **On-Chain IP Registration** - Register prompts as IP assets using Story Protocol SDK
- **Programmable Licenses** - Create license tokens with custom terms (commercial use, derivatives, royalties)
- **License Verification** - Verify license ownership on-chain with cryptographic proof
- **Derivative Prompts** - Create derivative works from existing prompts with parent IP linking
- **Reputation System** - On-chain reputation tracking for creators
- **Marketplace** - Browse, filter, and purchase AI prompts
- **Leaderboards** - Track top creators and trending prompts
- **Wallet Integration** - Connect with RainbowKit + wagmi

## 🛠️ Tech Stack

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Story Protocol SDK, JWT

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, wagmi, RainbowKit

**Blockchain:** Story Protocol (Aeneid Testnet)

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database
- Story Protocol wallet with testnet funds ([Faucet](https://faucet.story.foundation/))

### Backend

```bash
cd backend
npm install

# Create .env file with:
# DATABASE_URL=postgresql://...
# WALLET_PRIVATE_KEY=your_key_without_0x
# RPC_PROVIDER_URL=https://aeneid.storyrpc.io
# JWT_SECRET=your_secret
# PORT=3001

npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:3001/api

npm run dev
```

Backend runs at `http://localhost:3001` | Frontend runs at `http://localhost:5173`

---

**Built with ❤️ for the future of AI prompt ownership**
