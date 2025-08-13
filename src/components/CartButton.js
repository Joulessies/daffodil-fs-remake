"use client";

import { IconButton } from "@chakra-ui/react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartButton() {
  const cart = useCart();
  return (
    <IconButton
      aria-label="Open cart"
      icon={<ShoppingBag size={20} />}
      variant="ghost"
      onClick={cart.open}
    />
  );
}
