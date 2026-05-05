#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Run this to check if your Supabase configuration is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase Setup Verification\n');
console.log('='.repeat(50));

// Check 1: Environment variables
console.log('\n1️⃣  Checking Environment Variables...\n');

const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.local.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file is missing!');
  console.log('📝 To fix: Run "cp .env.local.example .env.local"');
  console.log('   Then edit .env.local and add your Supabase credentials');
} else {
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
  const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
  
  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL is not configured');
    console.log('📝 Get your URL from: Supabase Dashboard > Settings > API > Project URL');
  } else if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is configured');
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL format may be incorrect');
    console.log('   Expected format: https://your-project-id.supabase.co');
  }
  
  if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
    console.log('📝 Get your anon key from: Supabase Dashboard > Settings > API > anon public');
  } else if (supabaseKey.length > 50) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is configured');
  } else {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY may be too short');
  }
}

// Check 2: Supabase packages
console.log('\n2️⃣  Checking Supabase Packages...\n');

const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const hasSupabaseJs = packageJson.dependencies?.['@supabase/supabase-js'];
  const hasSupabaseSsr = packageJson.dependencies?.['@supabase/ssr'];
  
  if (hasSupabaseJs) {
    console.log('✅ @supabase/supabase-js is installed');
  } else {
    console.log('❌ @supabase/supabase-js is missing');
  }
  
  if (hasSupabaseSsr) {
    console.log('✅ @supabase/ssr is installed');
  } else {
    console.log('❌ @supabase/ssr is missing');
  }
}

// Check 3: Database setup script
console.log('\n3️⃣  Checking Database Setup...\n');

const sqlPath = path.join(__dirname, '..', 'scripts', 'setup-database.sql');
if (fs.existsSync(sqlPath)) {
  console.log('✅ Database setup script exists');
  console.log('   Location: scripts/setup-database.sql');
} else {
  console.log('❌ Database setup script is missing');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 Summary:\n');
console.log('To complete Supabase setup:');
console.log('1. Create .env.local from .env.local.example');
console.log('2. Add your Supabase URL and anon key to .env.local');
console.log('3. Run the SQL from scripts/setup-database.sql in Supabase Dashboard');
console.log('4. Configure Authentication settings in Supabase Dashboard');
console.log('\nSee SETUP.md for detailed instructions.\n');

// Check 4: Auth configuration files
console.log('4️⃣  Checking Auth Configuration Files...\n');

const authFiles = [
  { path: 'app/components/auth/auth-provider.tsx', name: 'Auth Provider' },
  { path: 'app/components/auth/auth-form.tsx', name: 'Auth Form' },
  { path: 'lib/supabase/client.ts', name: 'Supabase Client' },
  { path: 'lib/supabase/server.ts', name: 'Supabase Server Client' },
  { path: 'middleware.ts', name: 'Middleware' },
  { path: 'app/auth/callback/route.ts', name: 'Auth Callback' },
];

let allFilesExist = true;
authFiles.forEach(({ path: filePath, name }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${name} exists (${filePath})`);
  } else {
    console.log(`❌ ${name} is missing (${filePath})`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));
console.log('✨ Verification complete!\n');

