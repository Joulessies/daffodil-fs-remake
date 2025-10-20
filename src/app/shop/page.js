"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Divider,
  List,
  ListItem,
  Badge,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useCart } from "@/components/CartContext";
import NavigationBar from "@/components/navigationbar";
import { Image as ChakraImage, Grid, GridItem, Tag } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const FloralSwiper = dynamic(() => import("@/components/FloralSwiper"), {
  ssr: false,
});

const CATALOG = [
  {
    title: "Floral Arrangements",
    sections: [
      {
        subtitle: "Bouquets",
        items: [
          "Classic Rose Bouquet",
          "Mixed Seasonal Bouquet",
          "Elegant Lilies and Orchids",
          "Rustic Sunflower Bouquet",
          "Hand-Tied Lavender Bouquet",
        ],
      },
      {
        subtitle: "Wedding Flowers",
        items: [
          "Bridal Bouquet (Custom)",
          "Bridesmaid Bouquets",
          "Floral Wedding Arch",
          "Centerpieces (Custom)",
          "Boutonnieres & Corsages",
        ],
      },
      {
        subtitle: "Sympathy Flowers",
        items: [
          "Funeral Wreath",
          "Memorial Centerpiece",
          "Standing Spray",
          "Sympathy Bouquets",
          "Heart-Shaped Arrangement",
        ],
      },
    ],
  },
  {
    title: "Seasonal Flowers",
    sections: [
      {
        subtitle: "Spring Flowers",
        items: [
          "Tulip and Daffodil Mix",
          "Peony & Lilac Bouquet",
          "Potted Crocus",
          "Spring Garden Planter",
          "Hyacinth Vase Arrangement",
        ],
      },
      {
        subtitle: "Summer Flowers",
        items: [
          "Sunflower Bunch",
          "Dahlias in Bloom",
          "Wildflower Bouquet",
          "Hydrangea Basket",
          "Tropical Hibiscus Arrangement",
        ],
      },
      {
        subtitle: "Autumn Flowers",
        items: [
          "Chrysanthemum & Marigold Mix",
          "Fall Centerpiece with Pumpkins",
          "Autumn Orchid Arrangement",
          "Sunflower and Berry Bouquet",
          "Rustic Maple Leaf Wreath",
        ],
      },
    ],
  },
  {
    title: "Gift Collections",
    sections: [
      {
        subtitle: "For Her",
        items: [
          "Rose & Chocolate Combo",
          "Lavender Scented Candle Set",
          "Floral Bath Bombs and Flowers Basket",
          "Spa Day Gift Box",
          "Luxury Floral Soap Collection",
        ],
      },
      {
        subtitle: "For Him",
        items: [
          "Orchid & Succulent Planter",
          "Men’s Grooming Kit with Floral Touch",
          "Rustic Wood Vase with Wildflowers",
          "Coffee & Flowers Combo",
          "Beer & Bouquet Bundle",
        ],
      },
      {
        subtitle: "Special Occasions",
        items: [
          "Anniversary Floral Arrangement",
          "Birthday Flower Surprise Box",
          "Valentine's Day Bouquet",
          "Get Well Soon Gift Basket",
          "New Baby Floral Welcome Set",
        ],
      },
    ],
  },
];

export default function ShopPage() {
  const cart = useCart();
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setDbProducts(data.items || []);
          return;
        }
      } catch {}
      // Fallback to anon Supabase client
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data } = await supabase
          .from("products")
          .select(
            "id, title, description, price, category, status, stock, images"
          )
          .eq("status", "active");
        if (mounted) setDbProducts(data || []);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Realtime: refresh products on any product change so stock updates are reflected
  useEffect(() => {
    let channel;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        channel = supabase
          .channel("rt-products")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            async () => {
              try {
                const res = await fetch("/api/products", { cache: "no-store" });
                if (res.ok) {
                  const data = await res.json();
                  setDbProducts(data.items || []);
                }
              } catch {}
            }
          )
          .subscribe();
      } catch {}
    })();
    return () => {
      try {
        channel && channel.unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <>
      <NavigationBar />
      <Box bg="#fffcf2" minH="100vh">
        <Box maxW="1240px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
          <Box textAlign="center" mb={8} position="relative">
            {(() => {
              const titleText = "Flower Shop";
              const titleContainer = {
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.045 },
                },
              };
              const titleChar = {
                hidden: { y: 16, opacity: 0 },
                show: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 260, damping: 20 },
                },
              };
              return (
                <Heading
                  as={motion.h1}
                  variants={titleContainer}
                  initial="hidden"
                  animate="show"
                  size={{ base: "2xl", md: "3xl" }}
                  bgGradient="linear(to-r, #bc0930, #ff6b9e)"
                  bgClip="text"
                  letterSpacing="-0.02em"
                  className="font-santa-katarina"
                >
                  {titleText.split("").map((ch, i) => (
                    <Box
                      as={motion.span}
                      key={`t-${i}`}
                      display="inline-block"
                      variants={titleChar}
                    >
                      {ch === " " ? "\u00A0" : ch}
                    </Box>
                  ))}
                </Heading>
              );
            })()}
            {/* Floating petals (desktop only) */}
            {[
              { e: "🌸", l: "8%", t: -6, d: 0, dx: 24, dur: 9.5 },
              { e: "🌼", l: "88%", t: 4, d: 0.2, dx: -28, dur: 10.5 },
              { e: "🌷", l: "-2%", t: 26, d: 0.35, dx: 20, dur: 11.2 },
            ].map((p, i) => (
              <Box
                key={i}
                position="absolute"
                left={p.l}
                top={`${p.t}px`}
                display={{ base: "none", md: "block" }}
                opacity={0.95}
                pointerEvents="none"
              >
                <Box
                  as={motion.div}
                  initial={{ y: 0, rotateX: -12, rotateY: 16, opacity: 0.95 }}
                  animate={{
                    x: [0, p.dx, p.dx * -0.6, 0],
                    y: [0, -16, -6, 0],
                    rotateZ: [0, 6, -5, 0],
                    rotateX: [-12, -8, -12],
                    rotateY: [16, 10, 16],
                    opacity: [0.95, 1, 0.92, 0.95],
                  }}
                  whileHover={{ rotateX: -18, rotateY: 24, scale: 1.08 }}
                  transition={{
                    duration: p.dur || 10,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: p.d,
                    ease: "easeInOut",
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.20))",
                  }}
                >
                  <Box
                    as={motion.span}
                    fontSize={{ md: "2xl" }}
                    style={{
                      transform: "translateZ(24px)",
                      textShadow:
                        "0 2px 0 rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.18)",
                    }}
                  >
                    {p.e}
                  </Box>
                </Box>
              </Box>
            ))}
            <Box
              as={motion.div}
              h="3px"
              w="180px"
              mx="auto"
              mt={2}
              borderRadius="full"
              bgGradient="linear(to-r, #ff8abf, #bc0930)"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "center" }}
            />
            <Text mt={3} color="#5B6B73" fontStyle="italic">
              With us, you will find the perfect bouquet for any occasion, which
              will leave unforgettable impressions and bring joy to your loved
              ones and friends.
            </Text>
            <HStack spacing={4} justify="center" mt={4} flexWrap="wrap">
              {["Fresh daily", "Custom notes", "Fast delivery"].map((label) => (
                <Box
                  as={motion.div}
                  key={label}
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                >
                  <Tag
                    borderRadius="full"
                    px={3}
                    py={1}
                    bg="rgba(255,255,255,0.9)"
                    border="1px solid #EAEAEA"
                    boxShadow="0 6px 16px rgba(0,0,0,0.06)"
                    backdropFilter="saturate(160%) blur(4px)"
                  >
                    {label}
                  </Tag>
                </Box>
              ))}
            </HStack>
          </Box>

          <Grid
            templateColumns={{ base: "1fr", lg: "1fr" }}
            gap={8}
            alignItems="stretch"
          >
            {/* Left: Hero */}
            <GridItem>
              <Box
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                position="relative"
                overflow="hidden"
                borderRadius="16"
                height={{ base: "360px", md: "520px" }}
                border="1px solid #EFEFEF"
                bg="#ffffff"
              >
                <ChakraImage
                  src="/images/shoppage.jpg"
                  alt="Daffodil flower shop display"
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
                <Box
                  position="absolute"
                  left={{ base: 4, md: 6 }}
                  bottom={{ base: 4, md: 6 }}
                  maxW={{ base: "90%", md: "70%" }}
                >
                  <Heading
                    size={{ base: "lg", md: "xl" }}
                    color="#fff"
                    textShadow="0 2px 8px rgba(0,0,0,0.35)"
                    style={{ fontFamily: "var(--font-rothek)" }}
                  >
                    Daffodil & Co.
                  </Heading>
                  <Text
                    mt={2}
                    fontSize={{ base: "sm", md: "md" }}
                    color="#fff"
                    textShadow="0 2px 8px rgba(0,0,0,0.35)"
                  >
                    Premium floral compositions and bouquets for every occasion
                  </Text>
                  <HStack mt={4} spacing={3}>
                    <Link href="/shop">
                      <Button
                        colorScheme="red"
                        bg="#bc0930"
                        _hover={{ bg: "#a10828" }}
                      >
                        Bouquets
                      </Button>
                    </Link>
                    <Link href="/customize">
                      <Button
                        variant="outline"
                        color="#fff"
                        borderColor="#fff"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      >
                        Build a bouquet
                      </Button>
                    </Link>
                  </HStack>
                </Box>
              </Box>
            </GridItem>
          </Grid>

          <Stack spacing={14} mt={10}>
            {/* Newest products */}
            <Box
              as={motion.div}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4 }}
            >
              <Heading as="h2" size="md" mb={3}>
                New Arrivals
              </Heading>
              <Divider mb={4} />
              {(() => {
                const newest = (dbProducts || [])
                  .slice()
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .slice(0, 12);
                return (
                  <FloralSwiper
                    products={newest}
                    sections={[]}
                    randomizePrice={false}
                  />
                );
              })()}
            </Box>

            {CATALOG.map((category, idx) => (
              <Box
                key={category.title}
                as={motion.div}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Heading as="h2" size="md" mb={3}>
                  {category.title}
                </Heading>
                <Divider mb={4} />
                {/* Prefer DB products for this top-level category */}
                {(() => {
                  const top = category.title;
                  const key =
                    top === "Floral Arrangements"
                      ? "floral"
                      : top === "Seasonal Flowers"
                      ? "seasonal"
                      : top === "Gift Collections"
                      ? "gifts"
                      : null;
                  const filtered = key
                    ? (dbProducts || []).filter(
                        (p) => (p.category || "") === key
                      )
                    : [];
                  return (
                    <FloralSwiper
                      products={filtered}
                      sections={category.sections}
                      randomizePrice={category.title === "Seasonal Flowers"}
                      randomPriceRange={{ min: 599, max: 2499, step: 50 }}
                    />
                  );
                })()}
              </Box>
            ))}
          </Stack>

          {/* Floating cart button removed per request */}
        </Box>
      </Box>
    </>
  );
}
