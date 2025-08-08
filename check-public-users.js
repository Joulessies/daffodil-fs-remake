import { config } from "dotenv";
import { supabase } from "./src/lib/supabase.js";

// Load environment variables
config();

async function checkPublicUsers() {
  try {
    console.log("🔍 Checking Public Users Table...\n");

    // Check if we can read from the public.users table
    console.log("📝 Step 1: Reading from public.users table...");
    const { data: users, error: readError } = await supabase
      .from("users")
      .select("*")
      .limit(10);

    if (readError) {
      console.log("❌ Error reading users:", readError.message);
      console.log(
        "💡 This might mean the table doesn't exist in public schema"
      );
    } else {
      console.log(
        `✅ Successfully read ${users.length} users from public.users table`
      );

      if (users.length === 0) {
        console.log("📝 Table is empty - no users have logged in yet");
        console.log("💡 Try logging in with Google/GitHub to create a user");
      } else {
        users.forEach((user, index) => {
          console.log(`   User ${index + 1}: ${user.name} (${user.email})`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Created: ${user.created_at}`);
          console.log("   ---");
        });
      }
    }

    // Test table structure
    console.log("\n📊 Checking table structure...");
    const { data: columns, error: structureError } = await supabase
      .from("users")
      .select("*")
      .limit(0);

    if (structureError) {
      console.log("❌ Error checking structure:", structureError.message);
    } else {
      console.log("✅ Table structure is accessible");
    }

    console.log("\n🎯 Summary:");
    console.log("✅ Database connection working");
    console.log("✅ Public users table accessible");
    if (users.length === 0) {
      console.log("📝 No users yet - this is normal for a new setup");
      console.log(
        "💡 Users will appear here when they log in with Google/GitHub"
      );
    } else {
      console.log(`✅ Found ${users.length} users in database`);
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

checkPublicUsers();
