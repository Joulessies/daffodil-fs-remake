export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter required" }),
        {
          status: 400,
        }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceRole) {
      return new Response(
        JSON.stringify({
          error: "Database not configured",
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceRole: !!serviceRole,
            url: supabaseUrl ? "present" : "missing",
            serviceRole: serviceRole ? "present" : "missing",
          },
        }),
        {
          status: 500,
        }
      );
    }

    const admin = createClient(supabaseUrl, serviceRole);

    // First, check if the orders table exists
    let tableExists = false;
    let tableError = null;

    try {
      const { data: tableCheck, error: tableCheckError } = await admin
        .from("orders")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        tableError = tableCheckError.message;
        if (
          tableCheckError.message.includes("relation") &&
          tableCheckError.message.includes("does not exist")
        ) {
          tableExists = false;
        } else {
          throw tableCheckError;
        }
      } else {
        tableExists = true;
      }
    } catch (err) {
      tableError = err.message;
      if (
        err.message.includes("relation") &&
        err.message.includes("does not exist")
      ) {
        tableExists = false;
      } else {
        throw err;
      }
    }

    if (!tableExists) {
      return new Response(
        JSON.stringify({
          error: "Orders table does not exist",
          email,
          userOrders: [],
          recentOrders: [],
          totalUserOrders: 0,
          tableError,
          instructions: "Please run the SQL schema to create the orders table",
        }),
        {
          status: 200, // Return 200 but with empty data
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get all orders for debugging
    const { data: allOrders, error: allError } = await admin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get orders for specific email
    const { data: userOrders, error: userError } = await admin
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("Error fetching all orders:", allError);
      return new Response(
        JSON.stringify({
          error: "Database query error",
          details: allError.message,
          email,
          userOrders: [],
          recentOrders: [],
          totalUserOrders: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (userError) {
      console.error("Error fetching user orders:", userError);
      return new Response(
        JSON.stringify({
          error: "Database query error for user orders",
          details: userError.message,
          email,
          userOrders: [],
          recentOrders: allOrders || [],
          totalUserOrders: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        email,
        userOrders: userOrders || [],
        recentOrders: allOrders || [],
        totalUserOrders: userOrders?.length || 0,
        tableExists: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
        type: err.constructor.name,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
