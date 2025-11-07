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
  onCardClick,
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
    if (
      /^https?:\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }
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
    let src = String(image).trim();
    // Fix cases where a full URL was percent-encoded and/or prefixed with '/'
    if (src.startsWith("/https%3A") || src.startsWith("https%3A")) {
      try {
        src = decodeURIComponent(src.replace(/^\//, ""));
      } catch {}
    }
    if (
      /^https?:\/\//i.test(src) ||
      src.startsWith("data:") ||
      src.startsWith("blob:")
    ) {
      return src;
    }
    try {
      return encodePathSegments(src) || fallback;
    } catch {
      return src || fallback;
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
      whileHover={{
        y: -4,
        boxShadow: "0 16px 32px rgba(188, 9, 48, 0.12)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      borderRadius="16"
      overflow="hidden"
      border="1px solid #F5C7CF"
      bg="white"
      position="relative"
      boxShadow="0 4px 12px rgba(0,0,0,0.04)"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box
        p={5}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="240px"
        bg="#fffcf2"
        cursor={onCardClick ? "pointer" : "default"}
        onClick={onCardClick}
        transition="all 0.3s ease"
        _hover={
          onCardClick
            ? {
                bg: "#fff8f3",
              }
            : {}
        }
        position="relative"
      >
        {isOutOfStock && (
          <Box
            position="absolute"
            top={3}
            right={3}
            bg="#bc0930"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="600"
            boxShadow="0 2px 8px rgba(188, 9, 48, 0.3)"
          >
            Out of Stock
          </Box>
        )}
        <ChakraImage
          src={imgSrc}
          alt={title}
          objectFit="contain"
          maxH="220px"
          borderRadius="12"
          filter="drop-shadow(0 8px 20px rgba(0,0,0,0.12))"
          fallbackSrc={"/images/logo.png"}
          onError={() => {
            const alt = tryAlternateSeasonalPath(imgSrc);
            if (alt && alt !== imgSrc) setImgSrc(alt);
            else setImgSrc("/images/logo.png");
          }}
        />
      </Box>

      <Box p={4} flex="1" display="flex" flexDirection="column">
        <Box flex="1">
          <Text
            fontWeight={600}
            fontSize="md"
            color="#2B2B2B"
            mb={2}
            noOfLines={2}
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            {title}
          </Text>
          {price != null && (
            <Text fontSize="lg" color="#bc0930" fontWeight="700" mb={2}>
              ₱{Number(price).toFixed(2)}
            </Text>
          )}
          {description && (
            <Text fontSize="xs" color="#5B6B73" mt={2} noOfLines={2}>
              {description}
            </Text>
          )}
        </Box>

        <Box pt={3} mt={3} borderTop="1px solid" borderColor="#f5e6e8">
          <HStack justify="space-between" align="center" mb={2}>
            <Text
              fontSize="xs"
              color={isOutOfStock ? "#E53E3E" : "#38A169"}
              fontWeight="600"
            >
              {isOutOfStock
                ? "Unavailable"
                : stockCount != null
                ? `Stock: ${stockCount}`
                : "In Stock"}
            </Text>
            <IconButton
              aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
              icon={
                <Heart
                  size={18}
                  fill={isSaved ? "#bc0930" : "none"}
                  color={isSaved ? "#bc0930" : "#5B6B73"}
                />
              }
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                const wasSaved = wishlist.contains(itemId);
                wishlist.toggle({ id: itemId, title, image, price });
                const nowSaved = !wasSaved;
                toast({
                  title: nowSaved
                    ? "Added to wishlist"
                    : "Removed from wishlist",
                  description: nowSaved
                    ? `${title} saved to your wishlist`
                    : `${title} removed from your wishlist`,
                  status: nowSaved ? "success" : "info",
                  duration: 1500,
                  isClosable: true,
                  position: "top",
                });
              }}
              _hover={{
                bg: "#fff8f3",
                color: "#bc0930",
              }}
            />
          </HStack>

          {showAddToCart && (
            <Button
              w="100%"
              size="md"
              bg="#bc0930"
              color="white"
              isDisabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (isOutOfStock) {
                  toast({
                    title: "Unavailable",
                    description: "This item is currently out of stock",
                    status: "warning",
                    duration: 2000,
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
                    description: `${title} added to your cart`,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                    position: "top",
                  });
                }
              }}
              _hover={{
                bg: "#a10828",
                transform: "translateY(-1px)",
                boxShadow: "md",
              }}
              _disabled={{
                bg: "#E2E8F0",
                color: "#A0AEC0",
                cursor: "not-allowed",
              }}
              borderRadius="md"
              fontWeight="600"
              transition="all 0.2s"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
