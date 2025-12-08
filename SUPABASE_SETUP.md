# Supabase PostgreSQL Setup Guide

## 📋 Prerequisites
- Supabase account (free tier works): https://supabase.com
- Vercel account: https://vercel.com

---

## 🚀 Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `prompip` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes for setup

---

## 🔑 Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to:
   - **Settings** (gear icon) → **Database** → **Connection String**
2. Select **"URI"** tab
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

---

## 💻 Step 3: Update Local Environment

1. Open `backend/.env` file
2. Replace the `DATABASE_URL` with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your-actual-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
   ```

---

## 🗄️ Step 4: Run Database Migration

Run these commands in your terminal:

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Generate Prisma client for PostgreSQL
npm run prisma:generate

# Create and apply migration to Supabase
npx prisma migrate dev --name supabase_init
```

This will:
- Create all tables in your Supabase database
- Set up the schema with User, Prompt, License, and Verification models

---

## ✅ Step 5: Verify Database Setup

1. Go to Supabase Dashboard → **Table Editor**
2. You should see tables: `User`, `Prompt`, `License`, `Verification`
3. Test your local backend:
   ```bash
   npm run dev
   ```
4. Backend should connect successfully to Supabase

---

## 🚢 Step 6: Deploy to Vercel

### Backend Deployment

1. Go to https://vercel.com/new
2. Import your GitHub repository: `vishvjeettanwar1623/prompIP`
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
4. Add **Environment Variables**:
   ```
   DATABASE_URL = postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   WALLET_PRIVATE_KEY = your_wallet_private_key
   JWT_SECRET = your_jwt_secret
   RPC_PROVIDER_URL = https://aeneid.storyrpc.io
   PORT = 3001
   ```
5. Click **"Deploy"**

### Frontend Deployment

1. Create another Vercel project
2. Import same GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Add **Environment Variables** (if you have any API URLs):
   ```
   VITE_API_URL = https://your-backend.vercel.app
   ```
5. Click **"Deploy"**

---

## 🔒 Security Notes

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use Supabase's connection pooling for production (append `?pgbouncer=true`)
- ✅ Enable Row Level Security (RLS) in Supabase if needed
- ✅ Rotate your `JWT_SECRET` in production

---

## 🐛 Troubleshooting

### Migration fails with "relation already exists"
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually delete tables in Supabase Table Editor and re-run migration
npx prisma migrate deploy
```

### Connection timeout errors
- Check Supabase project is not paused (free tier auto-pauses after 7 days inactivity)
- Verify connection string is correct
- Ensure password doesn't have special characters (URL encode if needed)

### Vercel deployment fails
- Ensure all environment variables are set correctly
- Check Vercel build logs for specific errors
- Verify `vercel.json` configuration is correct

---

## 📚 Useful Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Update local `.env` with connection string
3. ✅ Run migrations to create tables
4. ✅ Test local backend connection
5. ✅ Deploy backend to Vercel with environment variables
6. ✅ Deploy frontend to Vercel
7. ✅ Update frontend to use deployed backend URL

---

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs
