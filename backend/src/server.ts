import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import promptRoutes from "./routes/promptRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://promp-ip.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview deployments and configured origins
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/prompts", promptRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "PrompIP API is running" });
});

// Root route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "PrompIP API is running", docs: "/health" });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Only listen when not running as serverless function
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 PrompIP API running on port ${PORT}`);
    console.log(`📡 Story Protocol Network: Aeneid Testnet`);
  });
}

// Export for Vercel serverless
export default app;
