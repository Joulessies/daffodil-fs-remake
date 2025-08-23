export const runtime = "nodejs";

// Generates an AI preview image using Hugging Face Inference API when HUGGINGFACE_API_KEY is set.
// Falls back to a placeholder image URL if the key is missing.
export async function POST(request) {
  try {
    const body = await request.json();
    const { flowerType, color, stems, wrap, addons, note } = body || {};

    const hfKey = process.env.HUGGINGFACE_API_KEY;
    const model =
      process.env.HUGGINGFACE_MODEL || "stabilityai/stable-diffusion-2-1";

    // Sanitize note to a reasonable length without line breaks for image prompt
    const safeNote = String(note || "")
      .replace(/\n|\r/g, " ")
      .slice(0, 180);

    const prompt = [
      "High-quality studio photo of a beautiful flower bouquet for an e-commerce product page.",
      `Primary flower type: ${flowerType || "roses"}.`,
      `Color theme: ${color || "red"}.`,
      `Approximate stem count: ${Math.max(
        1,
        Math.min(50, Number(stems) || 12)
      )}.`,
      `Wrap style: ${wrap || "kraft"}.`,
      addons && Array.isArray(addons) && addons.length
        ? `Include add-ons: ${addons.join(", ")}.`
        : "",
      safeNote
        ? `Include a small attached gift tag or card with legible printed text: \"${safeNote}\".`
        : "",
      "Soft diffused lighting, white seamless background, natural shadows, realistic textures.",
      "Product photography, no watermark, centered composition.",
    ]
      .filter(Boolean)
      .join(" ");

    // If no HF key, return a generic placeholder so UI keeps working
    if (!hfKey) {
      const placeholder = `https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1024&auto=format&fit=crop`;
      return new Response(
        JSON.stringify({
          imageUrl: placeholder,
          note: "HUGGINGFACE_API_KEY not set; returning placeholder.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(
      model
    )}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
      }),
    });

    // HF may return JSON error payloads; detect by content-type
    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      const errText = await resp.text();
      const status = resp.status;
      let message = `HF error (${status}): ${errText}`;
      if (status === 401 || status === 403) {
        message =
          "Unauthorized: Invalid/missing HUGGINGFACE_API_KEY or insufficient 'Inference' scope.";
      }
      if (status === 503) {
        message =
          "Model is loading or busy. Please retry in a few seconds (HF 503).";
      }
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (contentType.includes("application/json")) {
      const errJson = await resp.json();
      return new Response(
        JSON.stringify({ error: `HF error: ${JSON.stringify(errJson)}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = contentType.includes("image/") ? contentType : "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    return new Response(JSON.stringify({ imageUrl: dataUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
