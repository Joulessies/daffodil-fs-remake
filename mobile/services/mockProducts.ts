import { Product } from '@/types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'tulip-and-daffodil-mix',
    title: 'Tulip & Daffodil Sunshine Mix',
    description: 'Bright cheerful yellow daffodils paired with vibrant spring tulips, hand-tied with a silk gold ribbon. Ideal for celebrations and bringing warmth into any home.',
    price: 899,
    category: 'seasonal',
    colors: ['yellow', 'pink', 'white'],
    popularity: 98,
    status: 'active',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 42,
  },
  {
    id: 'peony-lilac-romance',
    title: 'Peony & Lilac Romance Bouquet',
    description: 'Soft lush blush peonies blended with fragrant purple lilacs and eucalyptus foliage. Handcrafted for anniversaries, birthdays, or romantic surprises.',
    price: 1499,
    category: 'bouquets',
    colors: ['pink', 'purple'],
    popularity: 95,
    status: 'active',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviews_count: 58,
  },
  {
    id: 'scarlet-velvet-roses',
    title: 'Grand Scarlet Velvet Roses (Dozen)',
    description: 'Twelve long-stem premium Ecuadorian red roses wrapped in matte black designer paper, accompanied by baby breath and greenery.',
    price: 1899,
    category: 'roses',
    colors: ['red'],
    popularity: 99,
    status: 'active',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 76,
  },
  {
    id: 'sunset-sunflower-harvest',
    title: 'Golden Sunset Sunflower Trio',
    description: 'Vibrant blooming sunflowers accented with golden solidago, chamomile daisies, and rustic twine wrap. Emitting pure joy and positivity.',
    price: 1199,
    category: 'seasonal',
    colors: ['yellow', 'orange'],
    popularity: 91,
    status: 'active',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviews_count: 34,
  },
  {
    id: 'casablanca-white-lilies',
    title: 'Casablanca Pure White Lilies',
    description: 'Exquisite oriental lilies in pristine white with intoxicating fragrance, complemented with lush monstera leaves in an elegant presentation vase.',
    price: 1650,
    category: 'luxury',
    colors: ['white', 'green'],
    popularity: 88,
    status: 'active',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 27,
  },
  {
    id: 'pastel-dream-hydrangeas',
    title: 'Pastel Dream Cloud Hydrangeas',
    description: 'Gigantic dreamy cloud of baby blue and lilac hydrangeas with spray roses. Soft, ethereal, and majestic.',
    price: 1799,
    category: 'bouquets',
    colors: ['blue', 'pink', 'purple'],
    popularity: 92,
    status: 'active',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviews_count: 19,
  },
  {
    id: 'peaceful-sympathy-wreath',
    title: 'Peaceful Serenity Sympathy Wreath',
    description: 'Gentle white chrysanthemums, white carnations, and silver dollar eucalyptus thoughtfully arranged on an easel stand with condolence ribbon.',
    price: 2499,
    category: 'sympathy',
    colors: ['white', 'green'],
    popularity: 80,
    status: 'active',
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviews_count: 15,
  },
  {
    id: 'royal-phalaenopsis-orchid',
    title: 'Royal Double-Stem White Orchid',
    description: 'Living double-spike Phalaenopsis orchid in a premium ceramic planter, with moss lining and bamboo support stakes. Long-lasting natural beauty.',
    price: 2899,
    category: 'plants',
    colors: ['white', 'yellow'],
    popularity: 87,
    status: 'active',
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1566977776052-6e61e358a9e4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviews_count: 31,
  },
  {
    id: 'botanical-dried-flower-dome',
    title: 'Everlasting Botanical Bell Glass Dome',
    description: 'Preserved eternal roses, dried lavender, bunny tails, and baby breath encased in a handcrafted wooden base glass cloche.',
    price: 1950,
    category: 'luxury',
    colors: ['pink', 'purple', 'yellow'],
    popularity: 94,
    status: 'active',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviews_count: 48,
  },
  {
    id: 'spring-blossom-basket',
    title: 'Spring Country Garden Flower Basket',
    description: 'Woven wicker basket overflowing with cheerful daisies, ranunculus, pink snapdragons, and sweet green filler stems.',
    price: 1350,
    category: 'occasions',
    colors: ['multicolor', 'pink', 'yellow'],
    popularity: 89,
    status: 'active',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviews_count: 22,
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Flowers', icon: 'flower' },
  { id: 'seasonal', name: 'Seasonal', icon: 'sunny' },
  { id: 'bouquets', name: 'Bouquets', icon: 'gift' },
  { id: 'roses', name: 'Roses', icon: 'heart' },
  { id: 'luxury', name: 'Luxury & Domes', icon: 'sparkles' },
  { id: 'plants', name: 'Live Plants', icon: 'leaf' },
  { id: 'sympathy', name: 'Sympathy', icon: 'ribbon' },
];

export const PROMO_CODES = [
  { code: 'DAFFODIL10', discountPercent: 10, minSpend: 1000, description: '10% off on orders over ₱1,000' },
  { code: 'BLOOM15', discountPercent: 15, minSpend: 2000, description: '15% off on orders over ₱2,000' },
  { code: 'SPRINGFREESHIP', discountPercent: 0, minSpend: 800, description: 'Free Express Shipping' },
];
