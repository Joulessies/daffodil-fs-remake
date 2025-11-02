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

    const aboutPage = {
      slug: "about",
      title: "About Us",
      content: `
<h2>Our Story</h2>
<p>Daffodil was born from a simple belief: flowers have the power to transform moments into memories.</p>
<p>This project began as a school assignment for our Web Systems course, where we were challenged to create a comprehensive e-commerce platform. What started as an academic exercise has evolved into a fully-featured floral marketplace, showcasing modern web development techniques and technologies.</p>
<p>Our team has remade and enhanced this system with better architecture, improved APIs, and a more intuitive user experience. This project demonstrates our commitment to learning cutting-edge web development while creating something beautiful and functional.</p>
      `.trim(),
      image_url: "/images/shoppage.jpg",
      philosophy_data: {
        title: "More Than Flowers — We Create Emotions",
        cards: [
          {
            icon: "🎨",
            title: "Artistry",
            description:
              "Each arrangement is a unique masterpiece, designed with an artist's eye and a craftsman's precision. We blend colors, textures, and forms to create visual poetry.",
          },
          {
            icon: "💚",
            title: "Sustainability",
            description:
              "We partner with local growers and use eco-friendly practices. Every stem is sourced responsibly, ensuring beauty that doesn't cost the earth.",
          },
          {
            icon: "✨",
            title: "Excellence",
            description:
              "From water temperature to stem cutting angles, we obsess over details others overlook. This dedication ensures your flowers stay fresh longer.",
          },
        ],
      },
      team_data: {
        title: "Meet Our Passionate Team",
        subtitle:
          "The creative minds and caring hearts behind every Daffodil arrangement",
        members: [
          {
            image_url: "/images/about-us-pictures-members/agres.png",
            name: "Shawn Agres",
            role: "Admin Frontend Developer",
            bio: "Shawn develops and maintains our administrative systems, ensuring smooth backend operations.",
          },
          {
            image_url: "/images/about-us-pictures-members/kim.png",
            name: "Kimberly Bombita",
            role: "Home Page Developer & Assets",
            bio: "Kimberly crafts our home page experience and manages digital assets, bringing our floral vision to life online.",
          },
          {
            image_url: "/images/about-us-pictures-members/julius.png",
            name: "Julius San Jose",
            role: "Owner & Website Operations",
            bio: "Julius is the owner of Daffodil and operates the entire website, overseeing our digital presence.",
          },
          {
            image_url: "/images/about-us-pictures-members/catapang.png",
            name: "Sean Rikcel Catapang",
            role: "Home Page Developer & Assets",
            bio: "Sean Rikcel focuses on home page development and asset management, ensuring our website showcases our offerings beautifully.",
          },
          {
            image_url: "/images/about-us-pictures-members/sumayod.png",
            name: "Lee Andre Sumayod",
            role: "Home Page Developer & Assets",
            bio: "Lee Andre develops our home page functionality and manages visual assets, creating an engaging user experience.",
          },
        ],
      },
      testimonials_data: {
        title: "What Our Customers Say",
        testimonials: [
          {
            text: "Daffodil transformed our wedding into a fairytale. Every arrangement was beyond our dreams. They truly understood our vision and brought it to life!",
            name: "Sarah & Michael",
            client_type: "Wedding Clients",
          },
          {
            text: "I've been ordering from Daffodil for 3 years. The quality and creativity never cease to amaze me. They're my go-to for every special occasion.",
            name: "Jennifer Liu",
            client_type: "Regular Customer",
          },
          {
            text: "The corporate arrangements for our office are always stunning. Daffodil understands our brand and delivers consistency with creativity.",
            name: "Robert Thompson",
            client_type: "Corporate Client",
          },
        ],
      },
      values_data: {
        title: "Our Core Values",
        values: [
          {
            icon: "/images/home/home3.svg",
            title: "Love",
            description: "In every petal we place",
          },
          {
            icon: "✨",
            title: "Beauty",
            description: "In every design we create",
          },
          {
            icon: "🌿",
            title: "Freshness",
            description: "In every bloom we deliver",
          },
          {
            icon: "🎨",
            title: "Creativity",
            description: "In every arrangement we craft",
          },
        ],
      },
      meta_title: "About Us - Daffodil Floral",
      meta_description:
        "Learn about Daffodil's story, mission, and passionate team dedicated to creating beautiful floral arrangements.",
      status: "published",
    };

    // Check if page already exists
    const { data: existing } = await admin
      .from("cms_pages")
      .select("id")
      .eq("slug", "about")
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing page
      const updateResult = await admin
        .from("cms_pages")
        .update({
          ...aboutPage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new page
      const insertResult = await admin
        .from("cms_pages")
        .insert(aboutPage)
        .select()
        .single();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) throw error;

    // Write audit log
    await writeAudit({
      action: "seed_cms",
      entity: "cms_pages",
      data: { slug: "about", title: "About Us" },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: existing
          ? "Successfully updated About page"
          : "Successfully created About page",
        data,
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
        success: false,
        error: err.message || "Failed to seed CMS data",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
