# Supabase Setup Guide

This guide will help you configure Supabase for your AI-Powered Personalised Learning Platform.

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in the details:
   - Name: `learning-platform` (or your preferred name)
   - Database Password: Generate a strong password and save it
4. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase Dashboard, go to **Settings** (left sidebar)
2. Click **API**
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace:
- `your-project-id` with your actual project ID from the URL
- `your-anon-key-here` with the anon public key you copied

## Step 4: Configure Authentication Settings

In your Supabase Dashboard:

### Enable Email/Password Authentication
1. Go to **Authentication** (left sidebar)
2. Click **Providers**
3. Click **Email**
4. Ensure "Enable Email Provider" is toggled ON
5. Click **Save**

### Configure URL Settings
1. Go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
3. Click **Save**

## Step 5: Create Database Tables

You have two options:

### Option A: Run SQL in Supabase Dashboard (Recommended)

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the contents of `scripts/setup-database.sql`
4. Click **Run**
5. You should see "Success. No rows returned"

### Option B: Use Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run the setup SQL
supabase db reset
```

## Step 6: Verify Your Setup

### Test Environment Variables
Run this in your terminal:
```bash
cat .env.local
```

You should see your credentials (not the placeholder values).

### Test Database Connection
1. Start your development server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Try to sign up with a test email
4. Check Supabase Dashboard > Authentication > Users to see if the user was created

## Step 7: Common Issues & Solutions

### "Failed to fetch..." Error

**Cause 1: Environment variables not set**
```bash
# Check if variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
```

**Solution:** Ensure `.env.local` exists and has the correct values.

**Cause 2: Invalid Supabase URL or Anon Key**
- Go to Supabase Dashboard > Settings > API
- Verify both URL and anon key are correct
- Make sure there are no extra spaces or characters

**Cause 3: Redirect URLs not configured**
- Go to Authentication > URL Configuration
- Add `http://localhost:3000/auth/callback` to Redirect URLs

### User Profile Creation Fails

This is normal - it's a non-critical error. The authentication will still work even if the profile creation fails initially.

To fix:
1. Ensure the `user_profiles` table was created in Step 5
2. Check that RLS policies are applied (Authentication > Policies)

### OAuth (Google) Not Working

1. Go to Authentication > Providers > Google
2. Ensure "Enable Google Provider" is ON
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Add redirect URLs in both Supabase and Google Cloud Console:
   - `http://localhost:3000/auth/callback`

## Step 8: Production Deployment

When deploying to production:

1. Update Supabase Authentication > URL Configuration:
   - Add your production URL to Site URL
   - Add your production URL to Redirect URLs

2. Update `.env.local` with production credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

3. Re-run the database setup on your production database if needed

## Verify Your Configuration

Run this command to check if everything is set up correctly:

```bash
# Check environment variables
grep -E "NEXT_PUBLIC_SUPABASE" .env.local

# Start development server
npm run dev
```

## Next Steps

Once authentication is working:

1. Test user registration and login
2. Verify user profiles are created automatically
3. Test password reset functionality
4. Configure additional OAuth providers if needed (Google, GitHub, etc.)

## Support

If you encounter issues:

1. Check browser console for error messages
2. Verify Supabase Dashboard logs (Monitoring > Logs)
3. Check Next.js server console for errors
4. Ensure all RLS policies are correctly applied

