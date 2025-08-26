export const runtime = "nodejs";

// Generates an AI preview image using Hugging Face Inference API when HUGGINGFACE_API_KEY is set.
// Falls back to a placeholder image URL if the key is missing.
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
    const GUIDANCE = Number(process.env.HF_GUIDANCE) || 8.0;
    const NEGATIVE_PROMPT =
      process.env.HF_NEGATIVE_PROMPT ||
      [
        "sneaker",
        "sneakers",
        "shoe",
        "shoes",
        "trainers",
        "boots",
        "heels",
        "sandals",
        "slippers",
        "cleats",
        "laces",
        "sports shoe",
        "footwear",
        "foot",
        "feet",
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
        "cropped",
        "cut off",
        "out of frame",
        "missing items",
        "extra items",
        "duplicates",
        "multiple teddy",
        "multiple chocolate boxes",
        "top-down view",
      ].join(", ");

    // Sanitize note to a reasonable length without line breaks for image prompt
    const safeNote = String(note || "")
      .replace(/\n|\r/g, " ")
      .slice(0, 180);

    // Single-stem path: attempt photorealistic via HF (if available),
    // otherwise Pollinations; fall back to SVG composite.
    const numericStems = Math.max(1, Math.min(50, Number(stems) || 12));
    if (numericStems === 1) {
      const singlePrompt = [
        "High-quality studio photo of ONE single stem flower on a white seamless product background.",
        `Flower: ${flowerType || "rose"}.`,
        `Color: ${color || "red"}.`,
        Array.isArray(addons) && addons.includes("vase")
          ? "Place the single stem in a small clear glass bud vase."
          : "",
        Array.isArray(addons) && addons.includes("teddy")
          ? "A small plush teddy bear to the right of the flower."
          : "",
        Array.isArray(addons) && addons.includes("chocolate")
          ? "A small box of chocolates on the left near the base."
          : "",
        Array.isArray(addons) && addons.includes("card")
          ? "A standing folded blank greeting card in front."
          : "",
        "Exactly ONE visible stem and bloom. Centered composition, natural shadows, crisp focus.",
      ]
        .filter(Boolean)
        .join(" ");

      // Try HF if a key is present
      if (hfKey) {
        const genOnce = async (whichModel) => {
          const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(
            whichModel
          )}`;
          const r = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfKey}`,
              "Content-Type": "application/json",
              Accept: "image/png,application/json;q=0.9,*/*;q=0.8",
            },
            body: JSON.stringify({
              inputs: singlePrompt,
              parameters: {
                width: WIDTH,
                height: HEIGHT,
                num_inference_steps: STEPS,
                guidance_scale: GUIDANCE,
                negative_prompt: NEGATIVE_PROMPT,
              },
              options: { wait_for_model: true, use_cache: false },
            }),
          });
          if (!r.ok) return null;
          const ct = r.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await r.json();
            const first = Array.isArray(data) ? data[0] : data;
            const maybe = first?.image || first?.images?.[0];
            if (maybe && typeof maybe === "string") {
              const url = !maybe.startsWith("data:")
                ? `data:image/png;base64,${maybe}`
                : maybe;
              return url;
            }
            return null;
          }
          const arr = await r.arrayBuffer();
          const b64 = Buffer.from(arr).toString("base64");
          const mime = ct.includes("image/") ? ct : "image/png";
          return `data:${mime};base64,${b64}`;
        };

        const models = [
          process.env.HUGGINGFACE_MODEL ||
            process.env.HUGGING_FACE_MODEL ||
            "stabilityai/stable-diffusion-2-1",
          process.env.HUGGINGFACE_FALLBACK_MODEL ||
            process.env.HUGGING_FACE_FALLBACK_MODEL ||
            "stabilityai/sd-turbo",
          "stabilityai/stable-diffusion-xl-base-1.0",
          "stabilityai/sdxl-turbo",
          "stabilityai/stable-diffusion-2-1",
        ];
        for (const m of Array.from(new Set(models))) {
          const url = await genOnce(m);
          if (url) {
            return new Response(
              JSON.stringify({
                imageUrl: url,
                note: `Single-stem generated with ${m}`,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }

      // Pollinations fallback for realism without HF
      try {
        const pollPrompt = encodeURIComponent(singlePrompt);
        const pollUrl = `https://image.pollinations.ai/prompt/${pollPrompt}?width=${WIDTH}&height=${HEIGHT}&model=flux&nologo=true`;
        return new Response(
          JSON.stringify({
            imageUrl: pollUrl,
            note: "Single-stem via Pollinations",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (_) {}

      // Final SVG fallback
      const wrapFill =
        wrap === "satin" ? "#e8d7f9" : wrap === "box" ? "#f1d6b8" : "#e7d1a7";
      const colorMap = {
        red: "#E11D48",
        white: "#F3F4F6",
        pink: "#F472B6",
        yellow: "#F59E0B",
      };
      const petal = colorMap[color] || "#E11D48";
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${WIDTH}\" height=\"${HEIGHT}\" viewBox=\"0 0 ${WIDTH} ${HEIGHT}\">\n  <rect width=\"100%\" height=\"100%\" fill=\"#FFFCF2\"/>\n  <g transform=\"translate(${
        WIDTH / 2 - 20
      },${
        HEIGHT / 2 + 30
      })\">\n    <rect x=\"-80\" y=\"60\" width=\"160\" height=\"90\" rx=\"10\" fill=\"${wrapFill}\"/>\n    <g stroke=\"#3a7d44\" stroke-width=\"4\">\n      <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"60\"/>\n    </g>\n    <g>\n      <circle cx=\"0\" cy=\"-10\" r=\"28\" fill=\"${petal}\"/>\n      <circle cx=\"-18\" cy=\"-6\" r=\"22\" fill=\"${petal}\"/>\n      <circle cx=\"18\" cy=\"-6\" r=\"22\" fill=\"${petal}\"/>\n      <circle cx=\"0\" cy=\"-22\" r=\"20\" fill=\"${petal}\"/>\n      <circle cx=\"0\" cy=\"-6\" r=\"10\" fill=\"#ffd166\"/>\n    </g>\n  </g>\n</svg>`;
      const base64 = Buffer.from(svg).toString("base64");
      return new Response(
        JSON.stringify({
          imageUrl: `data:image/svg+xml;base64,${base64}`,
          note: "Single-stem SVG fallback",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

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

    const exactStems = Math.max(1, Math.min(50, Number(stems) || 12));
    const stemDirective =
      exactStems === 1
        ? `Exactly 1 stem (a single ${
            flowerType || "flower"
          } bloom) with one visible stem; do not include additional flowers or stems.`
        : `Exactly ${exactStems} stems; stems should be countable and visible. Do not include extra flowers or stems beyond ${exactStems}.`;

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
        ? `Include ALL of the selected add-ons, clearly visible at the same time: ${addOnDirectives.join(
            ", "
          )}. ${
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

    // Optional: force Pollinations free generator via env flag
    const FORCE_POLLINATIONS =
      String(process.env.HF_USE_POLLINATIONS || "false").toLowerCase() ===
      "true";
    if (FORCE_POLLINATIONS) {
      try {
        const pollPrompt = encodeURIComponent(prompt);
        const pollUrl = `https://image.pollinations.ai/prompt/${pollPrompt}?width=${WIDTH}&height=${HEIGHT}&model=flux&nologo=true`;
        return new Response(
          JSON.stringify({
            imageUrl: pollUrl,
            note: "Generated via Pollinations (forced)",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      } catch (_) {
        const placeholder = `/images/home/bouquet-home.svg`;
        return new Response(
          JSON.stringify({
            imageUrl: placeholder,
            note: "Pollinations failed; local placeholder.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
    }

    // If no HF key, try Pollinations free generator; otherwise return placeholder
    if (!hfKey) {
      try {
        const pollPrompt = encodeURIComponent(prompt);
        const pollUrl = `https://image.pollinations.ai/prompt/${pollPrompt}?width=${WIDTH}&height=${HEIGHT}&model=flux&nologo=true`;
        return new Response(
          JSON.stringify({
            imageUrl: pollUrl,
            note: "Generated via Pollinations (no key)",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      } catch (_) {
        const placeholder = `/images/home/bouquet-home.svg`;
        return new Response(
          JSON.stringify({
            imageUrl: placeholder,
            note: "AI key missing; using local placeholder.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
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

    const FORCE_ONE =
      String(process.env.HF_USE_ONE_MODEL || "false").toLowerCase() === "true";
    const extraCandidates = (process.env.HF_CANDIDATE_MODELS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const candidateModels = FORCE_ONE
      ? [model]
      : Array.from(
          new Set([
            ...extraCandidates,
            model,
            fallbackModel,
            "stabilityai/stable-diffusion-xl-base-1.0",
          ])
        );

    let resp = null;
    let usedModel = null;
    let lastStatus = null;
    let lastDetail = null;
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
        // record and continue trying the next candidate model
        try {
          lastDetail = await r.text();
        } catch (_) {}
        lastStatus = r.status;
        continue;
      }
      lastStatus = r.status;
      try {
        lastDetail = await r.text();
      } catch (_) {
        lastDetail = null;
      }
    }
    if (!resp) {
      return new Response(
        JSON.stringify({
          error:
            "All Hugging Face models failed to generate. Check token permissions or model availability.",
          status: lastStatus,
          details: lastDetail,
          tried: candidateModels,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      const status = resp.status;
      const raw = await resp.text();
      const lower = raw.toLowerCase();
      const isOOM =
        status === 400 &&
        (lower.includes("out of memory") || lower.includes("cuda"));

      if (status === 404) {
        const resp2 = await requestImage(fallbackModel, {
          width: Math.min(WIDTH, 384),
          height: Math.min(HEIGHT, 384),
          steps: Math.min(STEPS, 20),
          guidance: Math.min(GUIDANCE, 5.0),
        });
        if (resp2.ok) {
          const ct2 = resp2.headers.get("content-type") || "";
          if (ct2.includes("application/json")) {
            const data2 = await resp2.json();
            const first2 = Array.isArray(data2) ? data2[0] : data2;
            const maybe2 = first2?.image || first2?.images?.[0];
            if (maybe2) {
              const url2 =
                typeof maybe2 === "string" && !maybe2.startsWith("data:")
                  ? `data:image/png;base64,${maybe2}`
                  : maybe2;
              return new Response(
                JSON.stringify({
                  imageUrl: url2,
                  note: `Model not found: ${model}. Used fallback: ${fallbackModel}`,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify({ error: `HF error: ${JSON.stringify(data2)}` }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }
          const arr2 = await resp2.arrayBuffer();
          const b642 = Buffer.from(arr2).toString("base64");
          const mime2 = ct2.includes("image/") ? ct2 : "image/png";
          const dataUrl2 = `data:${mime2};base64,${b642}`;
          return new Response(
            JSON.stringify({
              imageUrl: dataUrl2,
              note: `Model not found: ${model}. Used fallback: ${fallbackModel}`,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        const placeholder = `/images/home/bouquet-home.svg`;
        return new Response(
          JSON.stringify({
            imageUrl: placeholder,
            note: `HF 404 for model ${model}; returned placeholder. Check HUGGINGFACE_MODEL or token access`,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (isOOM) {
        const resp2 = await requestImage(fallbackModel, {
          width: Math.min(WIDTH, 384),
          height: Math.min(HEIGHT, 384),
          steps: Math.min(STEPS, 20),
          guidance: Math.min(GUIDANCE, 5.0),
        });
        if (resp2.ok) {
          const ct2 = resp2.headers.get("content-type") || "";
          if (ct2.includes("application/json")) {
            const data2 = await resp2.json();
            const first2 = Array.isArray(data2) ? data2[0] : data2;
            const maybe2 = first2?.image || first2?.images?.[0];
            if (maybe2) {
              const url2 =
                typeof maybe2 === "string" && !maybe2.startsWith("data:")
                  ? `data:image/png;base64,${maybe2}`
                  : maybe2;
              return new Response(
                JSON.stringify({
                  imageUrl: url2,
                  note: `Generated with fallback model: ${fallbackModel}`,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify({ error: `HF error: ${JSON.stringify(data2)}` }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }
          const arr2 = await resp2.arrayBuffer();
          const b642 = Buffer.from(arr2).toString("base64");
          const mime2 = ct2.includes("image/") ? ct2 : "image/png";
          const dataUrl2 = `data:${mime2};base64,${b642}`;
          return new Response(
            JSON.stringify({
              imageUrl: dataUrl2,
              note: `Generated with fallback model: ${fallbackModel}`,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        // Final graceful fallback to placeholder image
        const placeholder = `/images/home/bouquet-home.svg`;
        return new Response(
          JSON.stringify({
            imageUrl: placeholder,
            note: "HF GPU out of memory; returned placeholder. Consider a lighter model or smaller dimensions.",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      let message = `HF error (${status}): ${raw}`;
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
        note: `Generated with ${usedModel}`,
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
