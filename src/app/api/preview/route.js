export const dynamic = "force-dynamic";

// Legacy AI preview endpoint. Now mirrors /api/ai/preview behavior for compatibility.
export async function POST(request) {
  try {
    const body = await request.json();
    const { flowerType, color, stems, wrap, addons, note } = body || {};

    const hfKey =
      process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
    const model =
      process.env.HUGGINGFACE_MODEL ||
      process.env.HUGGING_FACE_MODEL ||
      "stabilityai/stable-diffusion-2-1";
    const fallbackModel =
      process.env.HUGGINGFACE_FALLBACK_MODEL ||
      process.env.HUGGING_FACE_FALLBACK_MODEL ||
      "stabilityai/sd-turbo";

    const WIDTH = Number(process.env.HF_IMAGE_WIDTH) || 384;
    const HEIGHT = Number(process.env.HF_IMAGE_HEIGHT) || 384;
    const STEPS = Number(process.env.HF_STEPS) || 25;
    const GUIDANCE = Number(process.env.HF_GUIDANCE) || 6.5;
    const NEGATIVE_PROMPT =
      process.env.HF_NEGATIVE_PROMPT ||
      [
        "sneaker",
        "shoe",
        "footwear",
        "human",
        "person",
        "face",
        "hands",
        "animal",
        "car",
        "vehicle",
        "text",
        "logo",
        "watermark",
        "frame",
        "border",
        "low quality",
        "blurry",
        "deformed",
      ].join(", ");

    const safeNote = String(note || "")
      .replace(/\n|\r/g, " ")
      .slice(0, 180);

    const exactStems = Math.max(1, Math.min(50, Number(stems) || 12));
    const stemDirective =
      exactStems === 1
        ? `Exactly 1 stem (a single ${
            flowerType || "flower"
          } bloom) with one visible stem; do not include additional flowers or stems.`
        : `Exactly ${exactStems} stems; stems should be countable and visible. Do not include extra flowers or stems beyond ${exactStems}.`;

    const addOnDirectives = [];
    if (Array.isArray(addons)) {
      if (addons.includes("vase"))
        addOnDirectives.push(
          "place the bouquet in a clear glass vase (transparent), vase fully visible"
        );
      if (addons.includes("teddy"))
        addOnDirectives.push(
          "a small plush teddy bear positioned to the right of the bouquet"
        );
      if (addons.includes("chocolate"))
        addOnDirectives.push(
          "one box of chocolates on the left near the base (synonyms: chocolate box, pralines, truffles), about 10% of frame width; clearly recognizable as chocolates"
        );
      if (addons.includes("card"))
        addOnDirectives.push(
          "a standing folded greeting card (blank, no logo, no visible text) in front"
        );
    }

    const arrangement = [];
    if (Array.isArray(addons)) {
      if (addons.includes("chocolate"))
        arrangement.push("left: chocolates box near base");
      if (addons.includes("teddy"))
        arrangement.push("right: small plush teddy");
      if (addons.includes("card"))
        arrangement.push("front: standing blank greeting card");
    }

    const wrapDirective =
      wrap === "satin"
        ? "wrap the bouquet with satin ribbon wrap, ribbon clearly visible"
        : wrap === "box"
        ? "present the bouquet inside a gift box package (box visible)"
        : "wrap the bouquet with brown kraft paper, paper clearly visible";

    const countsDirective = Array.isArray(addons)
      ? [
          addons.includes("teddy") ? "exactly one teddy" : null,
          addons.includes("chocolate") ? "exactly one chocolate box" : null,
          addons.includes("card") ? "exactly one greeting card" : null,
          addons.includes("vase") ? "exactly one clear glass vase" : null,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    const prompt = [
      "High-quality studio photo of a beautiful flower bouquet for an e-commerce product page.",
      `Primary flower type: ${flowerType || "roses"}.`,
      `Color theme: ${color || "red"}.`,
      stemDirective,
      wrapDirective + ".",
      addOnDirectives.length
        ? `Ensure the scene includes: ${addOnDirectives.join(", ")}. ${
            arrangement.length
              ? `Arrange add-ons as follows: ${arrangement.join("; ")}.`
              : ""
          } ${
            countsDirective ? `Counts: ${countsDirective}.` : ""
          } Do not omit any selected add-on.`
        : "",
      safeNote
        ? `Include a small attached gift tag or card with legible printed text: \"${safeNote}\".`
        : "Include a small blank gift tag attached to the bouquet.",
      "Soft diffused lighting, white seamless background, natural shadows, realistic textures.",
      "Camera angle: straight-on product angle about chest height, lens 50mm equivalent.",
      "Composition: centered, full items in frame, bouquet occupies ~70% of frame height.",
      "Crisp focus, no motion blur, natural colors, subtle depth of field.",
      "E-commerce product photography focusing ONLY on the bouquet and the listed add-ons.",
      "No shoes, no sneakers, no people, no faces, no hands, no animals, no cars, no logos, no brand marks, no text overlay.",
    ]
      .filter(Boolean)
      .join(" ");

    if (!hfKey) {
      const placeholder = `/images/home/bouquet-home.svg`;
      return new Response(
        JSON.stringify({
          imageUrl: placeholder,
          note: "HUGGINGFACE_API_KEY not set; returning placeholder.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const requestImage = async (whichModel, dims) => {
      const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(
        whichModel
      )}`;
      const isTurbo =
        /(^|\/)(sdx?l?-?turbo|sd-?turbo|flux.*schnell)/i.test(whichModel) ||
        /sd-?turbo/i.test(whichModel);
      const effectiveSteps = isTurbo
        ? Math.min(4, dims.steps || 4)
        : dims.steps;
      const effectiveGuidance = isTurbo ? 0 : dims.guidance;
      return fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
          Accept: "image/png,application/json;q=0.9,*/*;q=0.8",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: dims.width,
            height: dims.height,
            num_inference_steps: effectiveSteps,
            guidance_scale: effectiveGuidance,
            negative_prompt: NEGATIVE_PROMPT,
          },
          options: { wait_for_model: true, use_cache: false },
        }),
      });
    };

    const extraCandidates = (process.env.HF_CANDIDATE_MODELS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const candidateModels = Array.from(
      new Set([
        ...extraCandidates,
        model,
        fallbackModel,
        "stabilityai/stable-diffusion-xl-base-1.0",
      ])
    );

    let resp = null;
    let usedModel = null;
    for (const m of candidateModels) {
      const r = await requestImage(m, {
        width: WIDTH,
        height: HEIGHT,
        steps: STEPS,
        guidance: GUIDANCE,
      });
      if (r.ok) {
        resp = r;
        usedModel = m;
        break;
      }
      if (r.status === 401 || r.status === 403) {
        const raw = await r.text();
        return new Response(
          JSON.stringify({
            error:
              "Unauthorized: Invalid HUGGINGFACE_API_KEY or insufficient permissions for the model.",
            details: raw,
          }),
          { status: r.status, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!resp) {
      const placeholder = `/images/home/bouquet-home.svg`;
      return new Response(
        JSON.stringify({
          imageUrl: placeholder,
          note: "All HF models failed to generate. Returned placeholder. Verify your HF token and model access.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await resp.json();
      const first = Array.isArray(data) ? data[0] : data;
      const maybe = first?.image || first?.images?.[0];
      if (maybe && typeof maybe === "string") {
        const url = !maybe.startsWith("data:")
          ? `data:image/png;base64,${maybe}`
          : maybe;
        return new Response(
          JSON.stringify({
            imageUrl: url,
            note: `Generated with ${usedModel}`,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `HF error: ${JSON.stringify(data)}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = contentType.includes("image/") ? contentType : "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    return new Response(
      JSON.stringify({
        imageUrl: dataUrl,
        note: "Generated via legacy endpoint with hardened prompt",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
