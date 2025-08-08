import { config } from "dotenv";
import { supabase } from "./src/lib/supabase.js";

config();

async function testTableVisibility() {
  console.log("🔍 Testing Table Visibility and RLS Policies\n");
  
  try {
    // 1. Test basic table access
    console.log("📋 Testing basic table access...");
    const { data: users, error: selectError } = await supabase
      .from("users")
      .select("*");
    
    if (selectError) {
      console.log("❌ Cannot read users table:", selectError.message);
      console.log("Error code:", selectError.code);
    } else {
      console.log(`✅ Can read users table. Found ${users.length} users.`);
      if (users.length > 0) {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
        });
      } else {
        console.log("   Table is empty.");
      }
    }
    
    // 2. Test table count (sometimes more permissive than SELECT *)
    console.log("\n🔢 Testing table count...");
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    
    if (countError) {
      console.log("❌ Cannot count users:", countError.message);
    } else {
      console.log(`✅ Table count: ${count} users`);
    }
    
    // 3. Test insert permissions
    console.log("\n➕ Testing insert permissions...");
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      image: "https://via.placeholder.com/100"
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([testUser])
      .select();
    
    if (insertError) {
      console.log("❌ Cannot insert user:", insertError.message);
      console.log("Error code:", insertError.code);
      
      if (insertError.code === "42501") {
        console.log("💡 This is a Row Level Security (RLS) policy violation.");
        console.log("   The table exists but RLS policies prevent anonymous access.");
      }
    } else {
      console.log("✅ Can insert user:", insertData);
    }
    
    // 4. Check what happens when we try to access specific schema info
    console.log("\n🏗️ Testing schema access...");
    const { data: schemaInfo, error: schemaError } = await supabase
      .from("information_schema.tables")
      .select("table_name, table_schema")
      .eq("table_name", "users");
      
    if (schemaError) {
      console.log("❌ Cannot access schema info:", schemaError.message);
    } else {
      console.log("✅ Schema info:", schemaInfo);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎯 DIAGNOSIS:");
    console.log("=".repeat(50));
    
    if (selectError && selectError.code === "42501") {
      console.log("❌ PROBLEM IDENTIFIED: Row Level Security (RLS)");
      console.log("");
      console.log("Your users table has RLS enabled with policies that prevent");
      console.log("the anonymous key from reading or writing data.");
      console.log("");
      console.log("🔧 SOLUTIONS:");
      console.log("1. In Supabase Dashboard → SQL Editor, run:");
      console.log("   ALTER TABLE users DISABLE ROW LEVEL SECURITY;");
      console.log("");
      console.log("2. Or add a more permissive RLS policy:");
      console.log("   CREATE POLICY \"Allow anonymous read\" ON users");
      console.log("   FOR SELECT USING (true);");
      console.log("");
      console.log("3. Or use service_role key for admin operations");
    } else if (users && users.length === 0) {
      console.log("✅ CONNECTION WORKING: Table is just empty");
      console.log("");
      console.log("The table exists and is accessible, but contains no data.");
      console.log("Users will appear when someone logs in through your app.");
    } else {
      console.log("✅ EVERYTHING WORKING: Connection and data access OK");
    }
    
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.error("Full error:", error);
  }
}

testTableVisibility();
