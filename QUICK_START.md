# 🚀 Quick Start: Fix Login/Signup "Failed to fetch" Error

## Step 1: Copy Environment File
```bash
cd /Users/khalifa/Desktop/Designing\ AI\ Powered\ Personalised\ Learning\ platform\ for\ student\ development/Ai-powered-personalized-learning-platform
cp .env.local.example .env.local
```

## Step 2: Add Your Supabase Credentials

Edit `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public** key

## Step 3: Run Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy contents from `scripts/setup-database.sql`
3. Click **Run**

## Step 4: Configure Authentication

In Supabase Dashboard:

1. **Authentication** → **Providers** → **Email**
   - Ensure "Enable Email Provider" is ON
   - Click **Save**

2. **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
   - Click **Save**

## Step 5: Verify Setup

```bash
# Run verification script
npm run verify:supabase

# Start development server
npm run dev
```

## Step 6: Test Authentication

1. Open http://localhost:3000
2. Try signing up with a test email
3. Check Supabase Dashboard → **Authentication** → **Users** to verify

## 📖 Full Instructions

See `SETUP.md` for detailed setup instructions and troubleshooting.

## ❓ Common Issues

### "Failed to fetch..." persists
- Ensure `.env.local` has real values (not placeholders)
- Restart dev server after changing `.env.local`
- Check Supabase URL format: `https://xxx.supabase.co`

### User not created
- Run the SQL from `scripts/setup-database.sql`
- Check RLS policies are applied

### Redirect errors
- Add all URLs to Authentication → URL Configuration
- Include both localhost and production URLs

