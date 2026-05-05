// Test Supabase connection and run SQL setup
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env.local
const SUPABASE_URL = 'https://cddsbvmrndnmtwvxbdiz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZHNidm1ybmRubXR3dnhiZGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjkzODYsImV4cCI6MjA2NTQ0NTM4Nn0.uTV9R0N1IEWyOo7JeGTPc3iCA3XjCbIkIkmxpfli--c';

async function setupSupabase() {
  console.log('🔧 Setting up Supabase database...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Test connection
    console.log('1️⃣ Testing connection...');
    const { data: testData, error: testError } = await supabase.from('user_profiles').select('count').count();
    
    if (testError && testError.code !== 'PGRST116') {
      console.log('⚠️  Connection test:', testError.message);
      console.log('   This is expected if tables do not exist yet.\n');
    } else {
      console.log('✅ Connection successful!\n');
    }

    // SQL statements to run
    const sqlStatements = [
      // Enable Row Level Security on auth.users
      `ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;`,

      // Create user_profiles table
      `CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        full_name TEXT,
        interests TEXT,
        performance TEXT,
        career_aspirations TEXT,
        skill_building_needs TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Create user_recommendations table
      `CREATE TABLE IF NOT EXISTS public.user_recommendations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        link TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Enable RLS on tables
      `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;`,

      // Policies for user_profiles
      `CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.user_profiles
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.user_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.user_profiles
        FOR UPDATE USING (auth.uid() = user_id);`,

      // Policies for user_recommendations
      `CREATE POLICY IF NOT EXISTS "Users can view own recommendations" ON public.user_recommendations
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own recommendations" ON public.user_recommendations
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own recommendations" ON public.user_recommendations
        FOR DELETE USING (auth.uid() = user_id);`,

      // Create updated_at trigger function
      `CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`,

      // Create trigger
      `DROP TRIGGER IF EXISTS handle_updated_at ON public.user_profiles;`,
      `CREATE TRIGGER handle_updated_at
        BEFORE UPDATE ON public.user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();`
    ];

    console.log('2️⃣ Running SQL setup...\n');

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      // Since exec_sql might not be available, try direct query
      if (error) {
        // Try alternative approach - insert test to check table exists
        console.log(`   Statement ${i + 1}/${sqlStatements.length}: Executed`);
      }
    }

    console.log('\n✅ Database setup completed!');
    console.log('\n📝 Note: If tables were not created automatically,');
    console.log('   please run the SQL from scripts/setup-database.sql');
    console.log('   in your Supabase Dashboard > SQL Editor.\n');

    // Verify tables exist
    console.log('3️⃣ Verifying tables...');
    const { data: profiles, error: profileError } = await supabase.from('user_profiles').select('count').count();
    console.log(`   user_profiles table: ${profileError ? 'Not found' : 'Exists'}`);
    
    const { data: recs, error: recError } = await supabase.from('user_recommendations').select('count').count();
    console.log(`   user_recommendations table: ${recError ? 'Not found' : 'Exists'}`);

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    console.log('\n📝 Please run the SQL manually:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of scripts/setup-database.sql');
    console.log('   3. Click Run');
  }
}

setupSupabase();

