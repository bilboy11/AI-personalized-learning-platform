// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://cddsbvmrndnmtwvxbdiz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZHNidm1ybmRubXR3dnhiZGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjkzODYsImV4cCI6MjA2NTQ0NTM4Nn0.uTV9R0N1IEWyOo7JeGTPc3iCA3XjCbIkIkmxpfli--c';

async function testSupabase() {
  console.log('🔧 Testing Supabase connection...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Test authentication API
    console.log('1️⃣ Testing Auth API...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('   Auth API response:', error.message);
      if (error.message.includes('Invalid API key')) {
        console.log('\n❌ API Key is invalid!');
        console.log('   Please check your Supabase Dashboard > Settings > API');
      }
    } else {
      console.log('✅ Auth API working! No user logged in (expected)');
    }

    // Test listing tables
    console.log('\n2️⃣ Testing table access...');
    
    // Try to select from user_profiles
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('   user_profiles:', error.message);
      } else {
        console.log('   user_profiles: Accessible');
      }
    } catch (e) {
      console.log('   user_profiles:', e.message);
    }

    // Try user_recommendations
    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('   user_recommendations:', error.message);
      } else {
        console.log('   user_recommendations: Accessible');
      }
    } catch (e) {
      console.log('   user_recommendations:', e.message);
    }

    console.log('\n📝 If tables show errors, they need to be created.');
    console.log('   Go to Supabase Dashboard > SQL Editor');
    console.log('   Run the SQL from scripts/setup-database.sql\n');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testSupabase();

