import { config } from "dotenv";
import { supabase } from "./src/lib/supabase.js";

// Load environment variables
config();

async function addTestUser() {
  try {
    console.log("🔍 Adding test user to users table...\n");

    // Add a test user
    const testUser = {
      email: "test@example.com",
      name: "Test User",
      image: "https://via.placeholder.com/100",
      email_verified: new Date().toISOString(),
    };

    console.log("📝 Inserting test user:", testUser);
    
    const { data, error } = await supabase
      .from("users")
      .insert([testUser])
      .select();

    if (error) {
      console.log("❌ Error inserting user:", error.message);
      console.log("Full error:", error);
      
      // Try with service role key if available
      console.log("\n💡 This might be due to RLS policies.");
      console.log("Try running this in Supabase SQL Editor instead:");
      console.log(`
INSERT INTO public.users (email, name, image, email_verified)
VALUES ('${testUser.email}', '${testUser.name}', '${testUser.image}', '${testUser.email_verified}');
      `);
    } else {
      console.log("✅ Successfully inserted test user!");
      console.log("Data:", data);
      
      // Now try to read it back
      console.log("\n📖 Reading users table...");
      const { data: users, error: readError } = await supabase
        .from("users")
        .select("*");
        
      if (readError) {
        console.log("❌ Error reading users:", readError.message);
      } else {
        console.log(`✅ Found ${users.length} users in table:`);
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Script failed:", error.message);
  }
}

addTestUser();
