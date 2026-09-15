"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartButton() {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.open);

  const totalQty = (items || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 1),
    0
  );

  return (
    <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
      <IconButton
        aria-label="Open cart"
        icon={<ShoppingBag size={20} />}
        variant="ghost"
        color="#2d3748"
        _hover={{
          bg: "#fff8f3",
          color: "#bc0930",
        }}
        onClick={openCart}
      />
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              backgroundColor: "#bc0930",
              color: "#ffffff",
              borderRadius: "9999px",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 0 0 2px #fffcf2",
              pointerEvents: "none",
              userSelect: "none",
              textAlign: "center",
              margin: 0,
              zIndex: 3,
            }}
          >
            {totalQty > 99 ? "99+" : totalQty}
          </motion.span>
        )}
      </AnimatePresence>
    </Box>
  );
}
