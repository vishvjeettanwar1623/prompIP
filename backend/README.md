# PrompIP Backend

Backend API for PrompIP - AI Prompt Ownership & Licensing Marketplace powered by Story Protocol.

## Features

- 🔐 JWT Authentication (signup/login)
- 📝 Prompt CRUD operations
- 🔗 Story Protocol integration (IP registration, license management)
- 💳 License purchasing and ownership tracking
- 🗄️ PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js v18+ and npm v8+
- PostgreSQL database
- Story Protocol wallet with testnet funds (Aeneid testnet)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
WALLET_PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_PROVIDER_URL=https://aeneid.storyrpc.io
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://user:password@localhost:5432/prompip?schema=public
PORT=3001

# Story Protocol Configuration (optional)
NFT_CONTRACT_ADDRESS=your_nft_contract_address
LICENSE_TEMPLATE_ADDRESS=your_license_template_address
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Running the Server

### Development
```bash
npm run dev
```

The server will start at `http://localhost:3001`

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token

### Prompts
- `GET /api/prompts/marketplace` - Get all listed prompts (public)
- `GET /api/prompts/:id` - Get single prompt details
- `POST /api/prompts` - Create new prompt (auth required)
- `POST /api/prompts/:id/register` - Register prompt on Story Protocol (auth required)
- `POST /api/prompts/:id/buy` - Purchase prompt license (auth required)
- `GET /api/prompts/user/prompts` - Get user's created prompts (auth required)
- `GET /api/prompts/user/licenses` - Get user's purchased licenses (auth required)

## Database Schema

- **Users**: User accounts with email, password, and wallet address
- **Prompts**: AI prompts with metadata and Story Protocol IDs
- **Licenses**: License records linking buyers to prompts
- **Payments**: Payment transaction records

## Story Protocol Integration

The backend integrates with Story Protocol's TypeScript SDK to:

1. **Register IP Assets**: Each prompt can be registered as an on-chain IP asset
2. **Create License Terms**: Define license terms (commercial use, resale, royalties)
3. **Issue License Tokens**: Mint license tokens for buyers

See `src/story/storyService.ts` for implementation details.

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── story/            # Story Protocol integration
│   └── server.ts         # Express server setup
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
└── tsconfig.json
```

## Development Notes

- All Story Protocol operations require a configured wallet with testnet funds
- The wallet private key must be stored securely in environment variables
- License registration requires the prompt to be registered as an IP asset first
- Access control ensures only creators and license holders can view full prompt text

## Troubleshooting

### Prisma Client Errors
If you encounter Prisma client errors, regenerate the client:
```bash
npm run prisma:generate
```

### Story Protocol Connection Issues
Ensure your RPC URL is correct and your wallet has testnet funds:
- RPC: `https://aeneid.storyrpc.io`
- Get testnet funds from the Story Protocol faucet

### Database Connection
Verify your DATABASE_URL is correct and PostgreSQL is running.

## License

MIT
