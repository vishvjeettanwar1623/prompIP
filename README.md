# PrompIP

**AI Prompt Ownership & Licensing Marketplace powered by Story Protocol**

PrompIP is a full-stack Web3 application that enables creators to register AI prompts as intellectual property assets on Story Protocol's blockchain, create programmable licenses, and sell them in a decentralized marketplace.

![Story Protocol](https://img.shields.io/badge/Story%20Protocol-Aeneid%20Testnet-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-cyan)
![Express](https://img.shields.io/badge/Express-4.18-green)

## 🌟 Features

- **🔗 Story Protocol Integration**: Register prompts as on-chain IP assets using the official TypeScript SDK
- **📜 Programmable Licenses**: Create and issue license tokens with custom terms (commercial use, resale, royalties)
- **🔒 Access Control**: Prompt content is locked until license is purchased
- **💰 Marketplace**: Browse, filter, and purchase AI prompts
- **📊 Dashboard**: Manage your created prompts and purchased licenses
- **🔐 Authentication**: Secure JWT-based auth with wallet integration
- **🎨 Modern UI**: Beautiful Tailwind CSS design with responsive layouts

## 🏗️ Architecture

```
prompip/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── story/   # Story Protocol SDK integration
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/      # Database schema
└── frontend/        # React + Vite + TypeScript + Tailwind
    └── src/
        ├── pages/
        ├── components/
        └── services/
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm v8+
- PostgreSQL database
- Story Protocol wallet with Aeneid testnet funds

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration:
# - WALLET_PRIVATE_KEY (without 0x prefix)
# - RPC_PROVIDER_URL=https://aeneid.storyrpc.io
# - JWT_SECRET
# - DATABASE_URL

# Set up database
npm run prisma:generate
npm run prisma:migrate

# Start backend
npm run dev
```

Backend runs at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📖 How It Works

### For Creators

1. **Sign up** and optionally add your wallet address
2. **Create a prompt** with title, description, category, and pricing
3. **Register on-chain** using Story Protocol to mint an IP asset
4. **Create license terms** (automatically handled during registration)
5. **Sell licenses** to buyers in the marketplace

### For Buyers

1. **Browse marketplace** and filter by category
2. **View prompt details** (content is locked)
3. **Purchase license** using the Story Protocol SDK
4. **Access unlocked content** after successful purchase
5. **View license details** including transaction hash and license token ID

## 🔧 Story Protocol Integration

### IP Asset Registration

Each prompt is registered as an IP Asset on Story Protocol:

```typescript
const response = await client.ipAsset.register({
  nftContract: process.env.NFT_CONTRACT_ADDRESS,
  tokenId: BigInt(Date.now()),
  metadata: { /* prompt metadata */ },
  txOptions: { waitForTransaction: true },
});
```

### License Terms Creation

License terms are attached to IP assets:

```typescript
const response = await client.license.attachLicenseTerms({
  ipId: ipId,
  licenseTemplate: process.env.LICENSE_TEMPLATE_ADDRESS,
  licenseTermsId: BigInt(1),
  txOptions: { waitForTransaction: true },
});
```

### License Token Issuance

Buyers receive license tokens on purchase:

```typescript
const response = await client.license.mintLicenseTokens({
  licenseTermsId: licenseTermsId,
  licensorIpId: ipId,
  receiver: buyerAddress,
  amount: 1,
  txOptions: { waitForTransaction: true },
});
```

## 🗄️ Database Schema

### Users
- Email, password hash, wallet address
- Relations to prompts and licenses

### Prompts
- Title, description, prompt text (encrypted)
- Category, price, license type
- Story IP ID and License Terms ID
- Creator relation

### Licenses
- Buyer and prompt relations
- Story license token ID
- Transaction hash

### Payments
- Payment tracking with status
- Amount and timestamp

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Prompts
- `GET /api/prompts/marketplace` - List all prompts
- `GET /api/prompts/:id` - Get prompt details
- `POST /api/prompts` - Create prompt (auth)
- `POST /api/prompts/:id/register` - Register on-chain (auth)
- `POST /api/prompts/:id/buy` - Purchase license (auth)
- `GET /api/prompts/user/prompts` - My prompts (auth)
- `GET /api/prompts/user/licenses` - My licenses (auth)

## 🎨 Frontend Pages

- **/** - Landing page with feature overview
- **/marketplace** - Browse all prompts with filters
- **/prompt/:id** - Detailed prompt view with purchase option
- **/create** - Create new prompt form
- **/dashboard** - Manage prompts and view purchases
- **/login** & **/signup** - Authentication

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Private key stored in environment variables
- Access control for prompt content
- On-chain ownership verification

## 🌐 Story Protocol Network

**Network**: Aeneid Testnet  
**RPC URL**: `https://aeneid.storyrpc.io`  
**SDK**: `@story-protocol/core-sdk`

Get testnet funds from the [Story Protocol Faucet](https://faucet.story.foundation/)

## 📦 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- Story Protocol SDK
- viem (Ethereum library)
- JWT authentication
- bcrypt for password hashing

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Context API for state management

## 🛠️ Development

### Backend Scripts
```bash
npm run dev          # Development with nodemon
npm run build        # Compile TypeScript
npm start            # Production mode
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
```

### Frontend Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

## 📝 Environment Variables

### Backend `.env`
```env
WALLET_PRIVATE_KEY=your_key_without_0x
RPC_PROVIDER_URL=https://aeneid.storyrpc.io
JWT_SECRET=your_secret
DATABASE_URL=postgresql://...
PORT=3001
NFT_CONTRACT_ADDRESS=0x...  (optional)
LICENSE_TEMPLATE_ADDRESS=0x...  (optional)
```

### Frontend
No environment variables needed (proxies to backend)

## 🎯 Hackathon Demo

This project is designed for Web3 hackathons and demonstrates:

1. ✅ Real Story Protocol SDK integration (not mocked)
2. ✅ On-chain IP asset registration
3. ✅ License creation and issuance
4. ✅ Ownership verification and access control
5. ✅ Full-stack TypeScript application
6. ✅ Production-ready architecture

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Story Protocol](https://story.foundation/) for the IP infrastructure
- [viem](https://viem.sh/) for Ethereum interactions
- Aeneid testnet for blockchain testing

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check Story Protocol documentation
- Review the README files in `/backend` and `/frontend`

---

**Built with ❤️ for the future of AI prompt ownership**
