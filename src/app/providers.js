"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { AuthPromptProvider } from "@/components/AuthPromptContext";
import { AuthProvider } from "@/components/AuthProvider";

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthPromptProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </AuthPromptProvider>
    </ChakraProvider>
  );
}
