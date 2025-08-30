"use client";

import {
  Box,
  HStack,
  Image as ChakraImage,
  Text,
  IconButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";

export default function ProductCardMinimal({
  id,
  title = "Colorful Dreams",
  image = "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop",
  price,
  onFavorite,
  showAddToCart = false,
  sku,
  categories,
  availability,
  stock,
  description,
  features,
  specifications,
  benefits,
}) {
  const wishlist = useWishlist();
  const cart = useCart();
  const toast = useToast();
  const itemId = (id || title).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const isSaved = wishlist.contains(itemId);
  const computedSku = useMemo(() => {
    let base = (sku || id || title || "ITEM").toString();
    base = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    base = base.toUpperCase();
    return base.startsWith("SKU-") ? base : `SKU-${base}`;
  }, [sku, id, title]);
  const categoryList = useMemo(() => {
    if (Array.isArray(categories)) return categories.filter(Boolean);
    if (typeof categories === "string" && categories) return [categories];
    return [];
  }, [categories]);
  const normalizedAvailability = (availability || "").toLowerCase();
  const stockCount = typeof stock === "number" ? stock : undefined;
  const isOutOfStock =
    normalizedAvailability.includes("out") ||
    (stockCount != null ? stockCount <= 0 : false);
  const encodePathSegments = (path) => {
    if (!path || typeof path !== "string") return "";
    const parts = path.split("/");
    const encoded = parts
      .map((seg, idx) =>
        idx === 0 && seg === "" ? "" : encodeURIComponent(seg)
      )
      .join("/");
    return encoded;
  };

  const resolvedImage = useMemo(() => {
    const fallback =
      "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop";
    if (typeof image !== "string" || image.trim().length === 0) return fallback;
    // Encode segments to handle spaces and special characters like &
    try {
      const encoded = encodePathSegments(image);
      return encoded || fallback;
    } catch {
      return image;
    }
  }, [image]);

  const [imgSrc, setImgSrc] = useState(resolvedImage);

  const tryAlternateSeasonalPath = (current) => {
    if (typeof current !== "string") return "";
    if (current.startsWith("/images/seasonal-flowers/")) {
      return current.replace(
        "/images/seasonal-flowers/",
        "/images/products/seasonal-flowers/"
      );
    }
    if (current.startsWith("/images/products/seasonal-flowers/")) {
      return current.replace(
        "/images/products/seasonal-flowers/",
        "/images/seasonal-flowers/"
      );
    }
    return "";
  };
  return (
    <Box
      as={motion.div}
      whileHover={{ y: -3, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      borderRadius="18"
      overflow="hidden"
      border="1px solid #F5C7CF" /* thin pink border */
      bg="#FFF8F3" /* soft cream/blush background */
      position="relative"
    >
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="220px"
      >
        <ChakraImage
          src={imgSrc}
          alt={title}
          objectFit="contain"
          maxH="200px"
          borderRadius="12"
          filter="drop-shadow(0 6px 16px rgba(0,0,0,0.08))"
          fallbackSrc={"/images/logo.png"}
          onError={() => {
            const alt = tryAlternateSeasonalPath(imgSrc);
            if (alt && alt !== imgSrc) setImgSrc(alt);
            else setImgSrc("/images/logo.png");
          }}
        />
      </Box>

      <HStack justify="space-between" align="center" px={4} py={3}>
        <Box>
          <Text
            fontWeight={300}
            letterSpacing={0.3}
            fontSize="sm"
            color="#5B6B73"
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            {title}
          </Text>
          {price != null && (
            <Text fontSize="sm" color="#2B2B2B" mt={1}>
              PHP {Number(price).toFixed(2)}
            </Text>
          )}
          <Text fontSize="xs" color="#8A9AA3" mt={1}>
            SKU: {computedSku}
          </Text>
          {!!categoryList.length && (
            <Text fontSize="xs" color="#8A9AA3" mt={0.5} noOfLines={1}>
              Categories: {categoryList.join(", ")}
            </Text>
          )}
          {description && (
            <Text fontSize="xs" color="#6B7C85" mt={1} noOfLines={2}>
              {description}
            </Text>
          )}
          <Text
            fontSize="xs"
            mt={1}
            color={isOutOfStock ? "#bc0930" : "#0f8f4d"}
          >
            Availability:{" "}
            {isOutOfStock
              ? "Out of stock"
              : stockCount != null
              ? `In stock (${stockCount})`
              : "In stock"}
          </Text>
        </Box>
        <HStack spacing={1}>
          {showAddToCart && (
            <Button
              size="xs"
              colorScheme="red"
              isDisabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) {
                  toast({
                    title: "Unavailable",
                    description: "This item is currently out of stock",
                    status: "warning",
                    duration: 1500,
                    isClosable: true,
                    position: "top",
                  });
                  return;
                }
                const ok = cart.addItem({
                  id: id || itemId,
                  title,
                  image: imgSrc || resolvedImage || image,
                  price,
                  quantity: 1,
                });
                if (ok) {
                  toast({
                    title: "Added to cart",
                    description: `${title} × 1`,
                    status: "success",
                    duration: 1500,
                    isClosable: true,
                    position: "top",
                  });
                }
              }}
            >
              {isOutOfStock ? "Out" : "Add"}
            </Button>
          )}
          <IconButton
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            icon={<Heart size={16} color={isSaved ? "#bc0930" : undefined} />}
            variant="ghost"
            onClick={() => wishlist.toggle({ id: itemId, title, image, price })}
          />
        </HStack>
      </HStack>
    </Box>
  );
}
