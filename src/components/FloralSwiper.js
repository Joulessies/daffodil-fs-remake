"use client";

import { Box, Text } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import { PRODUCTS } from "@/lib/products";
import ProductCardMinimal from "./ProductCardMinimal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FloralSwiper({
  sections = [],
  randomizePrice = false,
  randomPriceRange = { min: 499, max: 1999, step: 50 },
  showSwipeHint = true,
}) {
  const toSlug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  let items = sections
    .flatMap((sec) => sec.items || [])
    .map((title) => {
      const slug = toSlug(title);
      const prod =
        PRODUCTS.find((p) => p.id === slug) ||
        PRODUCTS.find(
          (p) => p.title.toLowerCase() === String(title).toLowerCase()
        );
      return (
        prod || {
          id: slug,
          title,
          price: 0,
          images: [],
        }
      );
    });

  const keywordImageMap = [
    {
      k: "tulip",
      img: "/images/products/seasonal-flowers/spring-flowers/fire-tulips.jpg",
    },
    {
      k: "peony",
      img: "/images/products/seasonal-flowers/spring-flowers/peony.jpg",
    },
    {
      k: "crocus",
      img: "/images/products/seasonal-flowers/spring-flowers/potted-crocus.png",
    },
    {
      k: "hyacinth",
      img: "/images/products/seasonal-flowers/spring-flowers/hyacinth-vase-arrangement.jpg",
    },
    {
      k: "spring garden",
      img: "/images/products/seasonal-flowers/spring-flowers/spring-garden-planter.png",
    },
    {
      k: "sunflower bunch",
      img: "/images/products/seasonal-flowers/summer-flowers/sunflower-bunch.jpg",
    },
    {
      k: "dahlia",
      img: "/images/products/seasonal-flowers/summer-flowers/dahlias-bloom.jpg",
    },
    {
      k: "wildflower",
      img: "/images/products/seasonal-flowers/summer-flowers/wild-flower.jpg",
    },
    {
      k: "hydrangea",
      img: "/images/products/seasonal-flowers/summer-flowers/hydrangea.png",
    },
    {
      k: "hibiscus",
      img: "/images/products/seasonal-flowers/summer-flowers/hibiscus-flower.jpg",
    },
    {
      k: "chrysanthemum",
      img: "/images/products/seasonal-flowers/autumn-flowers/Chrysanthemum & Marigold Mix.png",
    },
    {
      k: "fall centerpiece",
      img: "/images/products/seasonal-flowers/autumn-flowers/Fall Centerpiece with Pumpkins.png",
    },
    {
      k: "autumn orchid",
      img: "/images/products/seasonal-flowers/autumn-flowers/Autumn Orchid Arrangement.png",
    },
    {
      k: "sunflower and berry",
      img: "/images/products/seasonal-flowers/autumn-flowers/Sunflower and Berry Bouquet.png",
    },
    {
      k: "maple leaf",
      img: "/images/products/seasonal-flowers/autumn-flowers/Rustic Maple Leaf Wreath.png",
    },
    {
      k: "sympathy bouquet",
      img: "/images/products/floral-arrangements/sympathy-flowers/symphaty-bouquet.png",
    },
    {
      k: "heart-shaped",
      img: "/images/products/floral-arrangements/sympathy-flowers/heart-shaped-bouquet.png",
    },
  ];

  const keywordProductMap = [
    { k: "bridesmaid", id: "bridesmaid-bouquet" },
    { k: "bridal", id: "bridal-bouquet" },
    { k: "centerpiece", id: "centerpiece-wedding" },
    { k: "arch", id: "floral-wedding-arch" },
    { k: "boutonniere", id: "boutonnieres" },
    { k: "corsage", id: "boutonnieres" },
    { k: "funeral wreath", id: "funeral-wreath" },
  ];

  items = items.map((p) => {
    if (p.images && p.images.length) return p;
    const lower = p.title.toLowerCase();

    const slug = toSlug(p.title);
    const slugVariants = [slug, slug.replace(/s$/, "")];
    const loose = PRODUCTS.find(
      (prd) =>
        slugVariants.some((sv) => sv === prd.id || prd.id.includes(sv)) ||
        lower.includes(prd.title.toLowerCase())
    );
    if (loose) return loose;

    const kp = keywordProductMap.find((m) => lower.includes(m.k));
    if (kp) {
      const match = PRODUCTS.find((prd) => prd.id === kp.id);
      if (match) return match;
    }

    const hit = keywordImageMap.find((m) => lower.includes(m.k));
    if (hit) return { ...p, images: [hit.img] };

    return p;
  });

  if (randomizePrice) {
    const { min = 499, max = 1999, step = 50 } = randomPriceRange || {};
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const steps = Math.max(1, Math.floor((max - min) / step));
    const seededPriceFor = (seedStr) => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash * 31 + seedStr.charCodeAt(i)) | 0;
      }
      const idx = Math.abs(hash) % (steps + 1);
      const value = min + idx * step;
      return clamp(value, min, max);
    };
    items = items.map((p) => {
      if (p && (!p.price || Number(p.price) <= 0)) {
        const seed = p.id || toSlug(p.title || "");
        return { ...p, price: seededPriceFor(String(seed)) };
      }
      return p;
    });
  }

  const [hintVisible, setHintVisible] = useState(false);
  useEffect(() => {
    if (!showSwipeHint) return;
    setHintVisible(true);
    const t = setTimeout(() => setHintVisible(false), 3500);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  return (
    <Box position="relative">
      {/* Right fade overlay (mobile) */}
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="56px"
        pointerEvents="none"
        display={{ base: "block", md: "none" }}
        bgGradient="linear(to-l, rgba(255,255,255,0.95), rgba(255,255,255,0))"
        zIndex={1}
      />

      {/* Swipe hint (mobile) */}
      {hintVisible && (
        <Box
          position="absolute"
          right={3}
          bottom={2}
          zIndex={2}
          bg="rgba(0,0,0,0.55)"
          color="#fff"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          pointerEvents="none"
          display={{ base: "inline-block", md: "none" }}
        >
          <Text fontSize="xs">Swipe for more →</Text>
        </Box>
      )}

      <Swiper
        modules={[A11y]}
        spaceBetween={16}
        slidesPerView={1}
        grabCursor
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        style={{ paddingBottom: 24 }}
      >
        {items.map((p) => (
          <SwiperSlide key={p.id}>
            <Box
              as={motion.div}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <ProductCardMinimal
                id={p.id}
                title={p.title}
                image={p.images?.[0]}
                price={p.price}
                showAddToCart
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
