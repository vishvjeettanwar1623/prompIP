# PrompIP Frontend

React + TypeScript + Tailwind CSS frontend for PrompIP - AI Prompt Ownership & Licensing Marketplace.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 Authentication (signup/login)
- 🛍️ Marketplace with category filtering
- 🔒 Access-controlled prompt viewing
- 📊 User dashboard for managing prompts and licenses
- ⚡ Fast development with Vite
- 🔗 Story Protocol integration UI

## Prerequisites

- Node.js v18+ and npm v8+
- Backend API running (see `../backend/README.md`)

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. The frontend is configured to proxy API requests to `http://localhost:3001`. If your backend runs on a different port, update `vite.config.ts`:

```typescript
export default defineConfig({
  // ...
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:YOUR_BACKEND_PORT',
        changeOrigin: true,
      },
    },
  },
})
```

## Running the App

### Development
```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## Pages

### 🏠 Home (`/`)
Landing page explaining PrompIP and Story Protocol integration.

### 🔐 Authentication
- `/signup` - Create new account with optional wallet address
- `/login` - Sign in to existing account

### 🛍️ Marketplace (`/marketplace`)
- Browse all listed prompts
- Filter by category
- View prompt cards with pricing
- See on-chain registration status

### 📄 Prompt Detail (`/prompt/:id`)
- View prompt metadata
- See Story Protocol information (IP ID, License Terms)
- Purchase license (for non-owners)
- Access full prompt text (for owners/license holders)
- Locked content display for unauthorized users

### ✏️ Create Prompt (`/create`)
- Form to create new prompts
- Set title, description, category, price
- Choose license type (ONE_TIME or RESALE_ALLOWED)
- Redirects to prompt detail after creation

### 📊 Dashboard (`/dashboard`)
- **My Prompts**: View all created prompts
  - Register prompts on Story Protocol
  - View on-chain status and IDs
  - Access prompt details
- **My Purchases**: View all licensed prompts
  - See license IDs and transaction hashes
  - Access purchased prompts

## Components

### Navbar
- Navigation links
- User authentication state
- Quick access to all main pages

### AuthContext
- Global authentication state management
- JWT token storage
- User session persistence

## API Integration

The frontend uses Axios to communicate with the backend API. See `src/services/api.ts` for all API methods:

```typescript
// Auth
authAPI.signup(data)
authAPI.login(data)

// Prompts
promptAPI.createPrompt(data)
promptAPI.getMarketplace()
promptAPI.getPromptById(id)
promptAPI.registerOnChain(id)
promptAPI.buyLicense(id)
promptAPI.getUserPrompts()
promptAPI.getUserLicenses()
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── Navbar.tsx
│   ├── context/          # React context providers
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Marketplace.tsx
│   │   ├── PromptDetail.tsx
│   │   ├── CreatePrompt.tsx
│   │   └── Dashboard.tsx
│   ├── services/         # API integration
│   │   └── api.ts
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Key Features

### Access Control
- Prompt text is hidden from unauthorized users
- Only creators and license holders can view full prompts
- Visual indicators show locked/unlocked state

### Story Protocol Integration
- Display Story IP Asset IDs
- Show License Terms IDs
- Transaction hash display for purchases
- On-chain registration status badges

### Responsive Design
- Mobile-friendly layouts
- Tailwind CSS utilities
- Gradient backgrounds and shadows
- Smooth transitions

## Styling

The app uses Tailwind CSS with custom colors:
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)

Customize in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
    },
  },
}
```

## Development Tips

### Hot Module Replacement
Vite provides instant HMR for fast development. Changes appear immediately without full page reloads.

### TypeScript Errors
The app is fully typed with TypeScript. Check `tsconfig.json` for compiler options.

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Navbar.tsx`

## Troubleshooting

### API Connection Issues
Ensure the backend is running at `http://localhost:3001` and accessible.

### Authentication Errors
Check that JWT tokens are being stored correctly in localStorage. Clear browser data if needed.

### Build Errors
Run `npm run build` to check for TypeScript errors before deployment.

## License

MIT
