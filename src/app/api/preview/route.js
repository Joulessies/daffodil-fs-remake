export const dynamic = "force-dynamic";

// If HUGGING_FACE_API_KEY is present, use Hugging Face Inference API to generate an image.
// Otherwise, fall back to an on-the-fly SVG composition.

export async function POST(request) {
  const body = await request.json();
  const { flowerType, color, stems, wrap, addons } = body || {};

  const hfKey = process.env.HUGGING_FACE_API_KEY;
  const model =
    process.env.HUGGING_FACE_MODEL || "stabilityai/stable-diffusion-2-1";

  // Build a descriptive prompt from the selections
  const prompt = `high quality photo of a ${color} ${flowerType} bouquet, ${stems} stems, ${wrap} wrapping, ${
    (addons || []).join(", ") || "no add-ons"
  }, soft studio light, 4k, detailed, product shot, centered`;

  if (hfKey) {
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true },
          }),
        }
      );

      if (!res.ok) throw new Error(`HF ${res.status}`);

      // HF Inference may return raw image bytes or JSON array of images
      const contentType = res.headers.get("content-type") || "";
      let dataUrl;
      if (contentType.startsWith("image/")) {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        dataUrl = `data:${contentType};base64,${base64}`;
      } else {
        const data = await res.json();
        // Some pipelines return an array of base64 images
        const first = Array.isArray(data) ? data[0] : data;
        if (first?.image) dataUrl = first.image;
        else throw new Error("Unexpected HF response");
      }

      return new Response(JSON.stringify({ image: dataUrl }), {
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      // fall through to SVG fallback
    }
  }

  // ----- Fallback SVG (no key or HF error) -----
  const width = 600;
  const height = 420;
  const bg = "#FFFCF2";
  const colorMap = {
    red: "#d21f3c",
    white: "#e9e9e9",
    pink: "#ff6fa4",
    yellow: "#ffce33",
  };
  const flowerColor = colorMap[color] || "#d21f3c";
  const size = Math.min(170, 80 + Math.log2(Math.max(8, stems || 12)) * 28);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <g opacity="0.9">
      <path d="M260,360 L340,360 L360,410 L240,410 Z" fill="${
        wrap === "satin" ? "#e8d7f9" : wrap === "box" ? "#f1d6b8" : "#e7d1a7"
      }"/>
    </g>
    <g stroke="#3a7d44" stroke-width="3">
      ${Array.from({ length: 6 })
        .map(
          (_, i) =>
            `<line x1="300" y1="320" x2="${250 + i * 20}" y2="${
              260 + i * 6
            }" />`
        )
        .join("")}
    </g>
    <circle cx="300" cy="260" r="${size}" fill="${flowerColor}" opacity="0.92"/>
    ${
      addons?.includes("teddy")
        ? `<circle cx="420" cy="340" r="22" fill="#f3b87f"/>`
        : ""
    }
    ${
      addons?.includes("chocolate")
        ? `<rect x="170" y="340" width="40" height="26" rx="4" fill="#7b4a2a"/>`
        : ""
    }
    ${
      addons?.includes("vase")
        ? `<ellipse cx="300" cy="400" rx="50" ry="18" fill="#bfe8ff" opacity="0.7"/>`
        : ""
    }
    <text x="20" y="28" font-size="16" fill="#5b6b73" font-family="sans-serif">${flowerType} • ${color} • ${stems} stems • ${wrap}</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  return new Response(JSON.stringify({ image: dataUrl }), {
    headers: { "content-type": "application/json" },
  });
}
