export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
      });
    }

    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE
    ) {
      return new Response(
        JSON.stringify({
          valid: true,
          message: "Stock validation not configured",
        }),
        { status: 200 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE
    );

    const validationResults = [];
    let allValid = true;

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let productId = item.id;

      // Try to find product by ID first, then by title
      if (!productId && item.title) {
        const { data: prodByTitle } = await admin
          .from("products")
          .select("id, title, stock")
          .eq("title", item.title)
          .maybeSingle();
        if (prodByTitle) productId = prodByTitle.id;
      }

      if (productId) {
        const { data: product } = await admin
          .from("products")
          .select("id, title, stock")
          .eq("id", productId)
          .maybeSingle();

        if (product) {
          const currentStock = Number(product.stock) || 0;
          const isValid = currentStock >= qty;

          validationResults.push({
            productId: product.id,
            title: product.title,
            requestedQty: qty,
            availableStock: currentStock,
            valid: isValid,
            message: isValid
              ? `Available: ${currentStock}`
              : `Insufficient stock. Available: ${currentStock}, Requested: ${qty}`,
          });

          if (!isValid) allValid = false;
        } else {
          validationResults.push({
            productId,
            title: item.title || "Unknown",
            requestedQty: qty,
            availableStock: 0,
            valid: false,
            message: "Product not found",
          });
          allValid = false;
        }
      } else {
        validationResults.push({
          productId: null,
          title: item.title || "Unknown",
          requestedQty: qty,
          availableStock: 0,
          valid: false,
          message: "Product ID not found",
        });
        allValid = false;
      }
    }

    return new Response(
      JSON.stringify({
        valid: allValid,
        results: validationResults,
        message: allValid
          ? "All items are available in stock"
          : "Some items are out of stock or unavailable",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Stock validation error:", err);
    return new Response(
      JSON.stringify({
        error: err.message,
        valid: false,
      }),
      { status: 500 }
    );
  }
}
