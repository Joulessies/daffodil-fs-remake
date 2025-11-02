export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter required" }),
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

    const diagnostics = {
      email,
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRole: !!serviceRole,
        supabaseUrl: supabaseUrl
          ? supabaseUrl.substring(0, 20) + "..."
          : "missing",
      },
      database: {
        connectionTest: false,
        tableExists: false,
        ordersCount: 0,
        userOrdersCount: 0,
        error: null,
      },
    };

    if (!supabaseUrl || !serviceRole) {
      return new Response(
        JSON.stringify({
          ...diagnostics,
          error: "Missing environment variables",
          solution:
            "Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE",
        }),
        { status: 200 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRole);

    try {
      // Test database connection
      const { data: testData, error: testError } = await admin
        .from("orders")
        .select("id")
        .limit(1);

      if (testError) {
        if (
          testError.message.includes("relation") &&
          testError.message.includes("does not exist")
        ) {
          diagnostics.database.error = "Orders table does not exist";
          diagnostics.solution =
            "Run the SQL schema to create the orders table";
        } else {
          diagnostics.database.error = testError.message;
        }
      } else {
        diagnostics.database.connectionTest = true;
        diagnostics.database.tableExists = true;

        // Get total orders count
        const { count: totalCount } = await admin
          .from("orders")
          .select("*", { count: "exact", head: true });
        diagnostics.database.ordersCount = totalCount || 0;

        // Get user orders count
        const { count: userCount } = await admin
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("customer_email", email);
        diagnostics.database.userOrdersCount = userCount || 0;

        // Get recent orders for debugging
        const { data: recentOrders } = await admin
          .from("orders")
          .select("order_number, customer_email, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        diagnostics.recentOrders = recentOrders || [];
      }
    } catch (err) {
      diagnostics.database.error = err.message;
    }

    return new Response(JSON.stringify(diagnostics), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
