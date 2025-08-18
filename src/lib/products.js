// Simple in-memory product catalog for demo/search/filtering

export const PRODUCTS = [
  {
    id: "classic-rose-bouquet",
    title: "Classic Rose Bouquet",
    description:
      "A timeless bouquet of premium long-stemmed roses arranged with lush greenery.",
    price: 1899,
    images: [
      "/images/products/floral-arrangements/bouquets/classic-rose-bouquet.png",
    ],
    category: "bouquets",
    colors: ["red"],
    popularity: 88,
    createdAt: 1714600000000,
  },
  {
    id: "mixed-seasonal-bouquet",
    title: "Mixed Seasonal Bouquet",
    description:
      "A cheerful mix of seasonal blooms, hand-tied for everyday celebrations.",
    price: 1299,
    images: [
      "/images/products/floral-arrangements/bouquets/mixed-seasonal-bouquet.png",
    ],
    category: "bouquets",
    colors: ["yellow", "pink", "white"],
    popularity: 74,
    createdAt: 1717200000000,
  },
  {
    id: "hand-tied-lavender-bouquet",
    title: "Hand-Tied Lavender Bouquet",
    description:
      "Calming lavender stems tied with rustic twine for a fragrant gift.",
    price: 999,
    images: [
      "/images/products/floral-arrangements/bouquets/hand-tied-lavender-bouquet.png",
    ],
    category: "bouquets",
    colors: ["purple"],
    popularity: 63,
    createdAt: 1718000000000,
  },
  {
    id: "rustic-sunflower-bouquet",
    title: "Rustic Sunflower Bouquet",
    description: "Bright sunflowers with field greens in a rustic wrap.",
    price: 1199,
    images: [
      "/images/products/floral-arrangements/bouquets/rustic-sunflower-bouquet.png",
    ],
    category: "bouquets",
    colors: ["yellow"],
    popularity: 92,
    createdAt: 1719000000000,
  },
  {
    id: "elegant-lilies-and-orchids",
    title: "Elegant Lilies and Orchids",
    description:
      "An elegant arrangement of lilies and orchids in a glass vase.",
    price: 2499,
    images: [
      "/images/products/floral-arrangements/bouquets/elegant-lillies-and-orchids.png",
    ],
    category: "bouquets",
    colors: ["white"],
    popularity: 81,
    createdAt: 1716800000000,
  },
  {
    id: "bridal-bouquet",
    title: "Bridal Bouquet",
    description: "Hand-crafted bridal bouquet tailored for your special day.",
    price: 4499,
    images: [
      "/images/products/floral-arrangements/wedding-flowers/bridal-bouquet.png",
    ],
    category: "wedding",
    colors: ["white", "blush"],
    popularity: 70,
    createdAt: 1715600000000,
  },
  {
    id: "bridesmaid-bouquet",
    title: "Bridesmaid Bouquet",
    description:
      "Coordinated bouquet for your bridal party in complementary tones.",
    price: 2499,
    images: [
      "/images/products/floral-arrangements/wedding-flowers/bridesmaid-bouquet.png",
    ],
    category: "wedding",
    colors: ["pink", "white"],
    popularity: 58,
    createdAt: 1717600000000,
  },
  {
    id: "centerpiece-wedding",
    title: "Wedding Centerpiece",
    description:
      "Elegant floral centerpiece perfect for receptions and head tables.",
    price: 2999,
    images: [
      "/images/products/floral-arrangements/wedding-flowers/centerpiece.jpg",
    ],
    category: "wedding",
    colors: ["white", "green"],
    popularity: 61,
    createdAt: 1718400000000,
  },
  {
    id: "memorial-centerpiece",
    title: "Memorial Centerpiece",
    description: "A respectful design for remembrance services and gatherings.",
    price: 2799,
    images: [
      "/images/products/floral-arrangements/sympathy-flowers/memorial-centerpiece.jpg",
    ],
    category: "sympathy",
    colors: ["white"],
    popularity: 46,
    createdAt: 1716000000000,
  },
  {
    id: "standing-spray",
    title: "Standing Spray",
    description: "A traditional standing spray to honor a loved one.",
    price: 3599,
    images: [
      "/images/products/floral-arrangements/sympathy-flowers/standing-spray.png",
    ],
    category: "sympathy",
    colors: ["white", "green"],
    popularity: 50,
    createdAt: 1715000000000,
  },
  {
    id: "lavender-candle-set",
    title: "Lavender Scented Candle Set",
    description: "Gift set with soothing lavender candles.",
    price: 899,
    images: [
      "/images/products/gift-collections/for-her/Lavender Scented Candle Set.png",
    ],
    category: "gifts",
    colors: ["purple"],
    popularity: 77,
    createdAt: 1719300000000,
  },
  {
    id: "coffee-flowers-combo",
    title: "Coffee & Flowers Combo",
    description: "A cozy combo of artisanal coffee and fresh flowers.",
    price: 1499,
    images: [
      "/images/products/gift-collections/for-him/Coffee & Flowers Combo.png",
    ],
    category: "gifts",
    colors: ["brown", "green"],
    popularity: 64,
    createdAt: 1716500000000,
  },
  // Sympathy flowers
  {
    id: "funeral-wreath",
    title: "Funeral Wreath",
    description: "A respectful wreath to honor and remember.",
    price: 3499,
    images: [
      "/images/products/floral-arrangements/sympathy-flowers/funeral-wreath.png",
    ],
    category: "sympathy",
    colors: ["white", "green"],
    popularity: 55,
    createdAt: 1716100000000,
  },
  {
    id: "heart-shaped-bouquet",
    title: "Heart-Shaped Bouquet",
    description: "A heart-shaped floral tribute crafted with care.",
    price: 3299,
    images: [
      "/images/products/floral-arrangements/sympathy-flowers/heart-shaped-bouquet.png",
    ],
    category: "sympathy",
    colors: ["white", "pink"],
    popularity: 48,
    createdAt: 1716050000000,
  },
  {
    id: "sympathy-bouquet",
    title: "Sympathy Bouquet",
    description: "A gentle bouquet to convey comfort and support.",
    price: 1999,
    images: [
      "/images/products/floral-arrangements/sympathy-flowers/symphaty-bouquet.png",
    ],
    category: "sympathy",
    colors: ["white"],
    popularity: 52,
    createdAt: 1716150000000,
  },
  // Wedding flowers
  {
    id: "boutonnieres",
    title: "Boutonnieres",
    description: "Classic boutonnieres for the wedding party.",
    price: 399,
    images: [
      "/images/products/floral-arrangements/wedding-flowers/boutonneires.jpg",
    ],
    category: "wedding",
    colors: ["white", "green"],
    popularity: 40,
    createdAt: 1715450000000,
  },
  {
    id: "floral-wedding-arch",
    title: "Floral Wedding Arch",
    description: "A stunning floral arch to frame your ceremony.",
    price: 11999,
    images: [
      "/images/products/floral-arrangements/wedding-flowers/floral-wedding-arch.jpg",
    ],
    category: "wedding",
    colors: ["white", "green"],
    popularity: 75,
    createdAt: 1715700000000,
  },
  // Gifts - For Her
  {
    id: "floral-bath-bombs-basket",
    title: "Floral Bath Bombs and Flowers Basket",
    description:
      "Relaxing floral bath bombs paired with a petite flower basket.",
    price: 1299,
    images: [
      "/images/products/gift-collections/for-her/Floral Bath Bombs and Flowers Basket.png",
    ],
    category: "gifts",
    colors: ["pink"],
    popularity: 60,
    createdAt: 1719400000000,
  },
  {
    id: "luxury-floral-soap",
    title: "Luxury Floral Soap Collection",
    description: "A set of artisanal soaps with delicate floral scents.",
    price: 999,
    images: [
      "/images/products/gift-collections/for-her/Luxury Floral Soap Collection.png",
    ],
    category: "gifts",
    colors: ["pink", "white"],
    popularity: 58,
    createdAt: 1719350000000,
  },
  {
    id: "rose-chocolate-combo",
    title: "Rose & Chocolate Combo",
    description: "A romantic combo of fresh roses and fine chocolates.",
    price: 1699,
    images: [
      "/images/products/gift-collections/for-her/Rose & Chocolate Combo.png",
    ],
    category: "gifts",
    colors: ["red"],
    popularity: 83,
    createdAt: 1719250000000,
  },
  {
    id: "spa-day-gift-box",
    title: "Spa Day Gift Box",
    description: "Pampering spa essentials with a floral touch.",
    price: 1399,
    images: ["/images/products/gift-collections/for-her/Spa Day Gift Box.png"],
    category: "gifts",
    colors: ["pink"],
    popularity: 62,
    createdAt: 1719200000000,
  },
  // Gifts - For Him
  {
    id: "beer-bouquet-bundle",
    title: "Beer & Bouquet Bundle",
    description: "A fun pairing of craft beers and fresh blooms.",
    price: 1799,
    images: [
      "/images/products/gift-collections/for-him/Beer & Bouquet Bundle.png",
    ],
    category: "gifts",
    colors: ["amber", "green"],
    popularity: 57,
    createdAt: 1716550000000,
  },
  {
    id: "mens-grooming-kit",
    title: "Men’s Grooming Kit with Floral Touch",
    description: "A curated grooming set complemented by a floral accent.",
    price: 1599,
    images: [
      "/images/products/gift-collections/for-him/Men’s Grooming Kit with Floral Touch.png",
    ],
    category: "gifts",
    colors: ["black"],
    popularity: 53,
    createdAt: 1716600000000,
  },
  {
    id: "orchid-succulent-planter",
    title: "Orchid & Succulent Planter",
    description: "A long-lasting planter featuring an orchid and succulents.",
    price: 1899,
    images: [
      "/images/products/gift-collections/for-him/Orchid & Succulent Planter.png",
    ],
    category: "gifts",
    colors: ["green", "white"],
    popularity: 66,
    createdAt: 1716650000000,
  },
  {
    id: "rustic-wood-vase-wildflowers",
    title: "Rustic Wood Vase with Wildflowers",
    description: "A rustic wooden vase filled with seasonal wildflowers.",
    price: 1299,
    images: [
      "/images/products/gift-collections/for-him/Rustic Wood Vase with Wildflowers.png",
    ],
    category: "gifts",
    colors: ["yellow", "green"],
    popularity: 59,
    createdAt: 1716700000000,
  },
  // Gifts - Special occasions
  {
    id: "anniversary-floral-arrangement",
    title: "Anniversary Floral Arrangement",
    description: "Celebrate love with a thoughtfully designed arrangement.",
    price: 2299,
    images: [
      "/images/products/gift-collections/special-occasions/Anniversary Floral Arrangement.png",
    ],
    category: "gifts",
    colors: ["red", "white"],
    popularity: 72,
    createdAt: 1719100000000,
  },
  {
    id: "birthday-flower-surprise",
    title: "Birthday Flower Surprise Box",
    description: "A festive flower box to brighten any birthday.",
    price: 1499,
    images: [
      "/images/products/gift-collections/special-occasions/Birthday Flower Surprise Box.png",
    ],
    category: "gifts",
    colors: ["multicolor"],
    popularity: 69,
    createdAt: 1719150000000,
  },
  {
    id: "get-well-soon-basket",
    title: "Get Well Soon Gift Basket",
    description: "A comforting gift basket to wish a speedy recovery.",
    price: 1399,
    images: [
      "/images/products/gift-collections/special-occasions/Get Well Soon Gift Basket.png",
    ],
    category: "gifts",
    colors: ["yellow", "green"],
    popularity: 54,
    createdAt: 1719050000000,
  },
  {
    id: "new-baby-welcome-set",
    title: "New Baby Floral Welcome Set",
    description: "A sweet welcome set to celebrate a new arrival.",
    price: 1599,
    images: [
      "/images/products/gift-collections/special-occasions/New Baby Floral Welcome Set.png",
    ],
    category: "gifts",
    colors: ["pink", "blue"],
    popularity: 56,
    createdAt: 1719000000000,
  },
  {
    id: "valentines-day-bouquet",
    title: "Valentine's Day Bouquet",
    description: "A romantic bouquet designed for Valentine's Day.",
    price: 1999,
    images: [
      "/images/products/gift-collections/special-occasions/Valentine's Day Bouquet.png",
    ],
    category: "gifts",
    colors: ["red"],
    popularity: 85,
    createdAt: 1718950000000,
  },
];

export function getAllProducts() {
  return PRODUCTS;
}

export function findProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function searchProducts({
  q = "",
  category = "all",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  colors = [],
  sort = "relevance",
} = {}) {
  const query = (q || "").toLowerCase();
  let list = PRODUCTS.filter((p) => {
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    const inCategory = category === "all" || p.category === category;
    const inPrice = p.price >= minPrice && p.price <= maxPrice;
    const colorMatch =
      colors.length === 0 || colors.some((c) => p.colors?.includes(c));
    return matchesQuery && inCategory && inPrice && colorMatch;
  });

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "name-asc")
    list.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "name-desc")
    list.sort((a, b) => b.title.localeCompare(a.title));
  else if (sort === "popularity")
    list.sort((a, b) => b.popularity - a.popularity);
  else if (sort === "newest") list.sort((a, b) => b.createdAt - a.createdAt);

  return list;
}
