"use client";

import { Box, IconButton, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartButton() {
  const cart = useCart();
  const totalQty = (cart.items || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 1),
    0
  );
  return (
    <Box position="relative" display="inline-block">
      <IconButton
        aria-label="Open cart"
        icon={<ShoppingBag size={20} />}
        variant="ghost"
        onClick={cart.open}
      />
      <AnimatePresence>
        {totalQty > 0 && (
          <Box
            as={motion.div}
            initial={{ scale: 0, opacity: 0, y: -6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            position="absolute"
            top={0}
            right={0}
            transform="translate(25%, -25%)"
            bg="#bc0930"
            color="#fff"
            borderRadius="full"
            minW="18px"
            h="18px"
            px={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" lineHeight={1}>
              {totalQty}
            </Text>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
