export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdOrNum = (
      searchParams.get("id") ||
      searchParams.get("order_number") ||
      searchParams.get("query") ||
      ""
    ).trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!orderIdOrNum && !email) {
      return new Response(
        JSON.stringify({ error: "Order Number, Order ID, or Email required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceRole) {
      return new Response(
        JSON.stringify({ error: "Database not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(supabaseUrl, serviceRole);

    let order = null;

    // 1. Try finding by order_number or id
    if (orderIdOrNum) {
      // First try exact match on order_number
      const { data: byOrderNum } = await admin
        .from("orders")
        .select("*")
        .eq("order_number", orderIdOrNum)
        .maybeSingle();

      if (byOrderNum) {
        order = byOrderNum;
      } else {
        // Try UUID match if valid UUID format
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            orderIdOrNum
          );
        if (isUUID) {
          const { data: byId } = await admin
            .from("orders")
            .select("*")
            .eq("id", orderIdOrNum)
            .maybeSingle();
          if (byId) order = byId;
        }

        // Try case-insensitive order_number match
        if (!order) {
          const { data: byIlike } = await admin
            .from("orders")
            .select("*")
            .ilike("order_number", `%${orderIdOrNum}%`)
            .order("created_at", { ascending: false })
            .limit(1);
          if (byIlike && byIlike.length > 0) order = byIlike[0];
        }
      }
    }

    // 2. If not found by ID/number, or only email was provided, search by customer_email
    if (!order && email) {
      const { data: byEmail } = await admin
        .from("orders")
        .select("*")
        .ilike("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (byEmail && byEmail.length > 0) {
        order = byEmail[0];
      }
    }

    if (!order) {
      return new Response(
        JSON.stringify({
          error: "Order not found. Please verify your order number or email.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine tracking stage
    const rawStatus = (order.status || "pending").toLowerCase();
    let currentStageIndex = 0;

    if (rawStatus === "pending") {
      currentStageIndex = 0;
    } else if (rawStatus === "paid" || rawStatus === "processing") {
      currentStageIndex = 1;
    } else if (rawStatus === "shipped" || rawStatus === "out_for_delivery") {
      currentStageIndex = 2;
    } else if (rawStatus === "delivered" || rawStatus === "completed") {
      currentStageIndex = 3;
    } else if (rawStatus === "cancelled") {
      currentStageIndex = -1;
    }

    const stages = [
      {
        step: 1,
        key: "placed",
        title: "Order Placed",
        description: "Order received and registered",
        isCompleted: currentStageIndex >= 0,
        isCurrent: currentStageIndex === 0,
      },
      {
        step: 2,
        key: "processing",
        title: "Arranging Flowers",
        description: "Our florists are handcrafting your floral arrangement",
        isCompleted: currentStageIndex >= 1,
        isCurrent: currentStageIndex === 1,
      },
      {
        step: 3,
        key: "shipped",
        title: "Out for Delivery",
        description: "Package is on the vehicle heading to recipient",
        isCompleted: currentStageIndex >= 2,
        isCurrent: currentStageIndex === 2,
      },
      {
        step: 4,
        key: "delivered",
        title: "Delivered",
        description: "Bouquet delivered to recipient",
        isCompleted: currentStageIndex >= 3,
        isCurrent: currentStageIndex === 3,
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        order,
        stages,
        isCancelled: rawStatus === "cancelled",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Order track API error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to track order" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
