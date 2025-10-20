"use client";

import { Box, Text, useDisclosure, IconButton } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { PRODUCTS } from "@/lib/products";
import ProductCardMinimal from "./ProductCardMinimal";
import ProductDetailsModal from "./ProductDetailsModal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FloralSwiper({
  sections = [],
  products = null,
  randomizePrice = false,
  randomPriceRange = { min: 499, max: 1999, step: 50 },
  showSwipeHint = true,
}) {
  const toSlug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [dbProducts, setDbProducts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data } = await supabase
          .from("products")
          .select(
            "id, title, description, price, category, status, stock, images"
          )
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (mounted) setDbProducts(data || []);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  let items =
    Array.isArray(products) && products.length
      ? products.slice()
      : sections
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

  // Use app-relative seasonal images (public/seasonal-flowers/...)
  const keywordImageMap = [
    {
      k: "tulip",
      img: "/images/seasonal-flowers/spring-flowers/fire-tulips.jpg",
    },
    {
      k: "peony",
      img: "/images/seasonal-flowers/spring-flowers/peony.jpg",
    },
    {
      k: "crocus",
      img: "/images/seasonal-flowers/spring-flowers/potted-crocus.png",
    },
    {
      k: "hyacinth",
      img: "/images/seasonal-flowers/spring-flowers/hyacinth-vase-arrangement.jpg",
    },
    {
      k: "spring garden",
      img: "/images/seasonal-flowers/spring-flowers/spring-garden-planter.png",
    },
    {
      k: "sunflower bunch",
      img: "/images/seasonal-flowers/summer-flowers/sunflower-bunch.jpg",
    },
    {
      k: "dahlia",
      img: "/images/seasonal-flowers/summer-flowers/dahlias-bloom.jpg",
    },
    {
      k: "wildflower",
      img: "/images/seasonal-flowers/summer-flowers/wild-flower.jpg",
    },
    {
      k: "hydrangea",
      img: "/images/seasonal-flowers/summer-flowers/hydrangea.png",
    },
    {
      k: "hibiscus",
      img: "/images/seasonal-flowers/summer-flowers/hibiscus-flower.jpg",
    },
    {
      k: "chrysanthemum",
      img: "/images/seasonal-flowers/autumn-flowers/Chrysanthemum & Marigold Mix.png",
    },
    {
      k: "fall centerpiece",
      img: "/images/seasonal-flowers/autumn-flowers/Fall Centerpiece with Pumpkins.png",
    },
    {
      k: "autumn orchid",
      img: "/images/seasonal-flowers/autumn-flowers/Autumn Orchid Arrangement.png",
    },
    {
      k: "sunflower and berry",
      img: "/images/seasonal-flowers/autumn-flowers/Sunflower and Berry Bouquet.png",
    },
    {
      k: "maple leaf",
      img: "/images/seasonal-flowers/autumn-flowers/Rustic Maple Leaf Wreath.png",
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

  // Prefer Supabase data when available
  const byId = (dbProducts || []).reduce((acc, x) => {
    acc[x.id] = x;
    return acc;
  }, {});
  const displayItems = items.map((p) => {
    const match = byId[p.id];
    if (match) return { ...p, ...match };
    const titleMatch = (dbProducts || []).find(
      (x) =>
        String(x.title || "").toLowerCase() ===
        String(p.title || "").toLowerCase()
    );
    return titleMatch ? { ...p, ...titleMatch } : p;
  });

  const [hintVisible, setHintVisible] = useState(false);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    if (!showSwipeHint) return;
    setHintVisible(true);
    const t = setTimeout(() => setHintVisible(false), 3500);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  return (
    <Box position="relative" role="group">
      {/* Navigation Buttons - Desktop */}
      <IconButton
        aria-label="Previous slide"
        icon={<ChevronLeft size={24} />}
        position="absolute"
        left={-4}
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={() => swiper?.slidePrev()}
        bg="white"
        color="#bc0930"
        border="2px solid"
        borderColor="#F5C7CF"
        borderRadius="full"
        boxShadow="lg"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        _hover={{
          bg: "#bc0930",
          color: "white",
          transform: "translateY(-50%) scale(1.1)",
        }}
        transition="all 0.3s"
        display={{ base: "none", md: "flex" }}
        size="lg"
      />

      <IconButton
        aria-label="Next slide"
        icon={<ChevronRight size={24} />}
        position="absolute"
        right={-4}
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={() => swiper?.slideNext()}
        bg="white"
        color="#bc0930"
        border="2px solid"
        borderColor="#F5C7CF"
        borderRadius="full"
        boxShadow="lg"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        _hover={{
          bg: "#bc0930",
          color: "white",
          transform: "translateY(-50%) scale(1.1)",
        }}
        transition="all 0.3s"
        display={{ base: "none", md: "flex" }}
        size="lg"
      />

      {/* Navigation Buttons - Mobile */}
      <IconButton
        aria-label="Previous slide"
        icon={<ChevronLeft size={20} />}
        position="absolute"
        left={2}
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={() => swiper?.slidePrev()}
        bg="white"
        color="#bc0930"
        border="2px solid"
        borderColor="#F5C7CF"
        borderRadius="full"
        boxShadow="md"
        _hover={{
          bg: "#bc0930",
          color: "white",
        }}
        transition="all 0.3s"
        display={{ base: "flex", md: "none" }}
        size="sm"
      />

      <IconButton
        aria-label="Next slide"
        icon={<ChevronRight size={20} />}
        position="absolute"
        right={2}
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        onClick={() => swiper?.slideNext()}
        bg="white"
        color="#bc0930"
        border="2px solid"
        borderColor="#F5C7CF"
        borderRadius="full"
        boxShadow="md"
        _hover={{
          bg: "#bc0930",
          color: "white",
        }}
        transition="all 0.3s"
        display={{ base: "flex", md: "none" }}
        size="sm"
      />

      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={16}
        slidesPerView={1}
        grabCursor
        onSwiper={setSwiper}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        style={{ paddingBottom: 24 }}
      >
        {displayItems.map((p) => (
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
                sku={p.sku}
                categories={p.categories || [p.category].filter(Boolean)}
                availability={p.availability}
                stock={p.stock}
                description={p.description}
                showAddToCart
                onCardClick={() => handleProductClick(p)}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      <ProductDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
      />
    </Box>
  );
}
