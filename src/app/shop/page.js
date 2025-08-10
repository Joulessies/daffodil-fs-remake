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
} from "@chakra-ui/react";

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
  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
      <Heading
        as="h1"
        size="lg"
        textAlign="center"
        mb={6}
        style={{ fontFamily: "var(--font-rothek)", color: "#bc0930" }}
      >
        Floral Catalog
      </Heading>

      <Stack spacing={14}>
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
                        <Text fontSize="sm">{item}</Text>
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
  );
}
