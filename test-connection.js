import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

async function testConnection() {
  console.log("🔍 Supabase Connection Diagnostic\n");
  
  // 1. Check environment variables
  console.log("📋 Environment Variables:");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
  
  // 2. Test basic client creation
  console.log("\n🔌 Testing Client Creation:");
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log("✅ Supabase client created successfully");
    
    // 3. Test basic connection with a simple query
    console.log("\n🌐 Testing Basic Connection:");
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    
    if (error) {
      console.log("❌ Connection failed:", error.message);
      console.log("Error code:", error.code);
      console.log("Full error:", error);
      
      // Check if it's a table not found error
      if (error.code === "42P01") {
        console.log("\n💡 Table 'users' doesn't exist. Let's check what tables are available...");
        
        // Try to list tables using information_schema
        const { data: tables, error: tableError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public");
          
        if (tableError) {
          console.log("❌ Can't list tables:", tableError.message);
        } else {
          console.log("📋 Available tables in public schema:");
          tables.forEach(table => console.log("  -", table.table_name));
        }
      }
    } else {
      console.log("✅ Connection successful!");
      console.log("Table exists and is accessible");
    }
    
    // 4. Test authentication status
    console.log("\n👤 Testing Auth Status:");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log("❌ Auth error:", authError.message);
    } else {
      console.log("Auth user:", user ? `✅ Logged in as ${user.email}` : "❌ Not authenticated");
    }
    
    // 5. Test with a simple RPC call or direct query
    console.log("\n🔍 Testing Database Access:");
    const { data: version, error: versionError } = await supabase
      .rpc('version');
      
    if (versionError) {
      console.log("❌ RPC call failed:", versionError.message);
      
      // Try a different approach - check connection with raw SQL if possible
      console.log("Trying alternative connection test...");
    } else {
      console.log("✅ Database version:", version);
    }
    
  } catch (error) {
    console.error("❌ Client creation failed:", error.message);
    console.error("Full error:", error);
  }
  
  // 6. Test direct database connection (if using pg client)
  console.log("\n🗄️  Testing Direct Database Connection:");
  try {
    // Using node-postgres for direct connection test
    const { Client } = await import("pg");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log("✅ Direct PostgreSQL connection successful");
    
    const res = await client.query("SELECT version()");
    console.log("Database version:", res.rows[0].version.substring(0, 50) + "...");
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log("Users table exists:", tableCheck.rows[0].exists ? "✅ Yes" : "❌ No");
    
    if (tableCheck.rows[0].exists) {
      const userCount = await client.query("SELECT COUNT(*) FROM public.users");
      console.log("User count in table:", userCount.rows[0].count);
    }
    
    await client.end();
  } catch (error) {
    console.log("❌ Direct database connection failed:", error.message);
    console.log("This might be normal if pg package is not installed");
  }
}

testConnection().catch(console.error);
