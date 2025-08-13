"use client";

import {
  Box,
  HStack,
  Image as ChakraImage,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCardMinimal({
  title = "Colorful Dreams",
  image = "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop",
  onFavorite,
}) {
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
          src={image}
          alt={title}
          objectFit="contain"
          maxH="200px"
          borderRadius="12"
          filter="drop-shadow(0 6px 16px rgba(0,0,0,0.08))"
        />
      </Box>

      <HStack justify="space-between" align="center" px={4} py={3}>
        <Text
          fontWeight={300}
          letterSpacing={0.3}
          fontSize="sm"
          color="#5B6B73"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          {title}
        </Text>
        <IconButton
          aria-label="favorite"
          icon={<Heart size={16} />}
          variant="ghost"
          onClick={onFavorite}
        />
      </HStack>
    </Box>
  );
}
