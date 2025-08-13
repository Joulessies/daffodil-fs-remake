"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { CartProvider } from "@/components/CartContext";

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <CartProvider>{children}</CartProvider>
    </ChakraProvider>
  );
}
