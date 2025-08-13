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
import ProductCardMinimal from "@/components/ProductCardMinimal";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <>
      <NavigationBar />
      <Box maxW="1240px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        {/* Top categories */}
        <HStack spacing={3} mb={6} wrap="wrap">
          {["Bouquets", "Arrangements", "Wedding", "Gift", "Seasonal"].map(
            (label) => (
              <Tag
                key={label}
                size="md"
                px={3}
                py={2}
                borderRadius="full"
                bg="#fff"
                border="1px solid #EFEFEF"
              >
                {label}
              </Tag>
            )
          )}
        </HStack>

        <Grid
          templateColumns={{ base: "1fr", lg: "1.1fr 1fr" }}
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
                src="https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop"
                alt="Red roses and white flowers"
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

          {/* Right: Product grid derived from CATALOG */}
          <GridItem>
            <SimpleGrid
              as={motion.div}
              columns={{ base: 2, md: 3 }}
              gap={4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {CATALOG.flatMap((c) =>
                c.sections.flatMap((s) => s.items.map((title) => ({ title })))
              )
                .slice(0, 9)
                .map((p, idx) => (
                  <ProductCardMinimal key={p.title + idx} title={p.title} />
                ))}
            </SimpleGrid>
          </GridItem>
        </Grid>

        <Stack spacing={14} mt={10}>
          {CATALOG.map((category) => (
            <Box key={category.title}>
              <Heading as="h2" size="md" mb={3}>
                {category.title}
              </Heading>
              <Divider mb={4} />
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {category.sections.map((sec) => (
                  <Box
                    key={sec.subtitle}
                    bg="white"
                    border="1px solid #EFEFEF"
                    p={4}
                    borderRadius="10"
                  >
                    <Heading
                      as="h3"
                      size="sm"
                      mb={2}
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      {sec.subtitle}
                      <Badge colorScheme="pink">{sec.items.length}</Badge>
                    </Heading>
                    <List
                      spacing={1}
                      style={{ listStyleType: "disc", paddingLeft: 18 }}
                    >
                      {sec.items.map((item) => (
                        <ListItem key={item}>
                          <HStack justify="space-between">
                            <Text fontSize="sm">{item}</Text>
                            <Button
                              size="xs"
                              onClick={() =>
                                cart.addItem({
                                  id: item,
                                  title: item,
                                  price: 0,
                                })
                              }
                            >
                              Add to cart
                            </Button>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
}
