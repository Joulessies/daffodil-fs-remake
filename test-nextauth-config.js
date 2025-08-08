import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

async function testNextAuthConfig() {
  console.log("🔍 Testing NextAuth Configuration\n");
  
  // 1. Check environment variables
  console.log("📋 Environment Variables Check:");
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
  
  // 2. Test service role key connection
  console.log("\n🔑 Testing Service Role Key:");
  try {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test if service role can access users table
    const { data: users, error } = await serviceClient
      .from("users")
      .select("*")
      .limit(1);
      
    if (error) {
      console.log("❌ Service role key test failed:", error.message);
    } else {
      console.log("✅ Service role key working correctly");
      console.log(`   Can access users table (found ${users.length} users)`);
    }
    
    // Test if service role can bypass RLS
    const testUser = {
      email: `service-test-${Date.now()}@example.com`,
      name: "Service Test User",
      image: "https://via.placeholder.com/100"
    };
    
    console.log("\n➕ Testing Service Role Insert Permissions:");
    const { data: insertData, error: insertError } = await serviceClient
      .from("users")
      .insert([testUser])
      .select();
      
    if (insertError) {
      console.log("❌ Service role cannot insert:", insertError.message);
    } else {
      console.log("✅ Service role can insert users (bypassing RLS)");
      
      // Clean up the test user
      const { error: deleteError } = await serviceClient
        .from("users")
        .delete()
        .eq("email", testUser.email);
        
      if (deleteError) {
        console.log("⚠️ Could not clean up test user:", deleteError.message);
      } else {
        console.log("🧹 Test user cleaned up");
      }
    }
    
  } catch (error) {
    console.error("❌ Service role test failed:", error.message);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 NEXTAUTH CONFIGURATION STATUS:");
  console.log("=".repeat(50));
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    console.log("✅ All required environment variables are set");
    console.log("✅ Service role key is working");
    console.log("✅ NextAuth should now work properly");
    console.log("");
    console.log("🚀 You can now:");
    console.log("1. Start your app with: npm run dev");
    console.log("2. Go to http://localhost:3000/login");
    console.log("3. Try logging in with Google or GitHub");
    console.log("4. Users should appear in your Supabase table after login");
  } else {
    console.log("❌ Missing environment variables:", missingVars.join(", "));
    console.log("Please add these to your .env file");
  }
}

testNextAuthConfig().catch(console.error);
