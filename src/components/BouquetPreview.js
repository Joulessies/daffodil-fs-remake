"use client";

import { Box, Heading, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const IMAGE_BASE = "/images/products";

const flowerSprite = (flowerType, color) => {
  const map = {
    roses: `roses-${color}.png`,
    tulips: `tulips-${color}.png`,
    sunflowers: `sunflowers-yellow.png`,
    mixed: `mixed-${color}.png`,
  };
  return `${IMAGE_BASE}/${map[flowerType] || map.roses}`;
};

const wrapSprite = (wrap) => `${IMAGE_BASE}/wrap-${wrap}.png`;
const addonSprite = (key) => `${IMAGE_BASE}/addon-${key}.png`;

export default function BouquetPreview({
  flowerType,
  color,
  stems,
  wrap,
  addons,
}) {
  const scale = Math.min(1.2, 0.6 + Math.log10(Math.max(8, stems)) * 0.25);
  const [aiImage, setAiImage] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function generate() {
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flowerType, color, stems, wrap, addons }),
        });
        const data = await res.json();
        if (!ignore) setAiImage(data.image);
      } catch (e) {
        // ignore failures; fallback to layered assets
      }
    }
    generate();
    return () => {
      ignore = true;
    };
  }, [flowerType, color, stems, wrap, addons]);

  return (
    <Box bg="white" border="1px solid #EFEFEF" borderRadius="12" p={4}>
      <Heading size="md" mb={2}>
        Preview
      </Heading>
      <Box
        position="relative"
        w="full"
        h={{ base: 300, md: 360 }}
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ background: "#FFFCF2" }}
      >
        {aiImage && (
          <Image
            src={aiImage}
            alt="AI bouquet preview"
            position="absolute"
            inset={0}
            m="auto"
            maxW="100%"
            maxH="100%"
            zIndex={1}
          />
        )}
        <Image
          src={wrapSprite(wrap)}
          alt="wrap"
          position="absolute"
          bottom={0}
          w={{ base: 220, md: 260 }}
          opacity={0.95}
        />

        <Image
          src={flowerSprite(flowerType, color)}
          alt="bouquet"
          transform={`scale(${scale})`}
          transition="transform 200ms ease"
          position="relative"
          zIndex={2}
        />

        {addons?.includes("vase") && (
          <Image
            src={addonSprite("vase")}
            alt="vase"
            position="absolute"
            bottom={0}
            w={{ base: 120, md: 140 }}
            opacity={0.9}
          />
        )}
        {addons?.includes("teddy") && (
          <Image
            src={addonSprite("teddy")}
            alt="teddy"
            position="absolute"
            right={{ base: 6, md: 10 }}
            bottom={{ base: 8, md: 12 }}
            w={{ base: 64, md: 72 }}
            zIndex={3}
          />
        )}
        {addons?.includes("chocolate") && (
          <Image
            src={addonSprite("chocolate")}
            alt="chocolate"
            position="absolute"
            left={{ base: 6, md: 10 }}
            bottom={{ base: 10, md: 14 }}
            w={{ base: 64, md: 72 }}
            zIndex={3}
          />
        )}
      </Box>
      <Text mt={2} fontSize="xs" color="#5B6B73">
        Visual preview updates live based on your selections.
      </Text>
    </Box>
  );
}
