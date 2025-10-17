export const runtime = "nodejs";
import { getAdminClient, writeAudit } from "@/lib/admin";

export async function POST() {
  try {
    const admin = getAdminClient();
    if (!admin) {
      return new Response(JSON.stringify({ error: "Missing admin key" }), {
        status: 500,
      });
    }

    const lowStockProducts = [
      {
        title: "Midnight Rose Bouquet",
        description:
          "Elegant dark red roses with eucalyptus leaves, perfect for romantic occasions",
        price: 899.0,
        category: "floral",
        status: "active",
        stock: 2,
        images: [
          "/images/products/floral-arrangements/bouquets/classic-rose-bouquet.png",
        ],
      },
      {
        title: "Sunset Tulip Bundle",
        description:
          "Beautiful orange and yellow tulips arranged in a classic vase",
        price: 599.0,
        category: "seasonal",
        status: "active",
        stock: 3,
        images: [
          "/images/products/seasonal-flowers/spring-flowers/fire-tulips.jpg",
        ],
      },
      {
        title: "White Lily Sympathy Arrangement",
        description:
          "Peaceful white lilies with delicate baby's breath for memorial services",
        price: 1299.0,
        category: "floral",
        status: "active",
        stock: 1,
        images: [
          "/images/products/floral-arrangements/sympathy-flowers/symphaty-bouquet.png",
        ],
      },
      {
        title: "Lavender Dreams Bouquet",
        description: "Soothing lavender stems hand-tied with silk ribbon",
        price: 749.0,
        category: "floral",
        status: "active",
        stock: 4,
        images: [
          "/images/products/floral-arrangements/bouquets/hand-tied-lavender-bouquet.png",
        ],
      },
      {
        title: "Autumn Harvest Centerpiece",
        description:
          "Warm fall colors with chrysanthemums, sunflowers, and seasonal foliage",
        price: 899.0,
        category: "seasonal",
        status: "active",
        stock: 2,
        images: [
          "/images/products/seasonal-flowers/autumn-flowers/Chrysanthemum & Marigold Mix.png",
        ],
      },
      {
        title: "Petite Peony Bouquet",
        description:
          "Delicate pink peonies in a charming arrangement, perfect for small spaces",
        price: 1099.0,
        category: "seasonal",
        status: "active",
        stock: 5,
        images: ["/images/products/seasonal-flowers/spring-flowers/peony.jpg"],
      },
      {
        title: "Valentine's Day Special",
        description:
          "Premium red roses with chocolates and a personalized card",
        price: 1499.0,
        category: "gifts",
        status: "active",
        stock: 3,
        images: [
          "/images/products/gift-collections/special-occasions/Valentine's Day Bouquet.png",
        ],
      },
      {
        title: "Spa Day Gift Set",
        description:
          "Luxurious spa products with a beautiful floral arrangement",
        price: 1299.0,
        category: "gifts",
        status: "active",
        stock: 2,
        images: [
          "/images/products/gift-collections/for-her/Spa Day Gift Box.png",
        ],
      },
      {
        title: "Rustic Sunflower Bundle",
        description:
          "Bright sunflowers with burlap wrapping for a country feel",
        price: 699.0,
        category: "floral",
        status: "active",
        stock: 4,
        images: [
          "/images/products/floral-arrangements/bouquets/rustic-sunflower-bouquet.png",
        ],
      },
      {
        title: "Orchid & Succulent Garden",
        description:
          "Modern arrangement with exotic orchids and hardy succulents",
        price: 999.0,
        category: "gifts",
        status: "active",
        stock: 1,
        images: [
          "/images/products/gift-collections/for-him/Orchid & Succulent Planter.png",
        ],
      },
    ];

    // Insert products one by one to avoid conflicts
    let inserted = 0;
    let errors = 0;

    for (const product of lowStockProducts) {
      try {
        // Check if product with same title already exists
        const { data: existing } = await admin
          .from("products")
          .select("id")
          .eq("title", product.title)
          .maybeSingle();

        if (existing) {
          console.log(`Product "${product.title}" already exists, skipping...`);
          continue;
        }

        const { error } = await admin.from("products").insert(product);

        if (error) {
          console.error(`Error inserting "${product.title}":`, error);
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Exception inserting "${product.title}":`, err);
        errors++;
      }
    }

    // Write audit log
    await writeAudit({
      action: "seed_products",
      entity: "products",
      data: { inserted, errors, total: lowStockProducts.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${inserted} products`,
        inserted,
        errors,
        total: lowStockProducts.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to seed products",
      }),
      { status: 500 }
    );
  }
}
