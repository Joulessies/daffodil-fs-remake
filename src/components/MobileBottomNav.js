"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import { Home, Grid2x2, Palette, Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore, useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.open);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const wishlistCount = mounted ? wishlistItems?.length || 0 : 0;
  const cartCount = mounted
    ? cartItems?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0
    : 0;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/" || pathname === "/home",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: Grid2x2,
      isActive: pathname?.startsWith("/shop") || pathname?.startsWith("/product"),
    },
    {
      label: "Customize",
      href: "/customize",
      icon: Palette,
      isActive: pathname?.startsWith("/customize"),
      isSpecial: true,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname?.startsWith("/wishlist"),
      badge: wishlistCount,
    },
    {
      label: "Cart",
      action: () => openCart(),
      icon: ShoppingBag,
      isActive: false,
      badge: cartCount,
    },
  ];

  return (
    <Box
      display={{ base: "block", md: "none" }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="rgba(255, 252, 242, 0.96)"
      backdropFilter="blur(16px) saturate(180%)"
      borderTop="1px solid rgba(232, 226, 214, 0.9)"
      boxShadow="0 -4px 16px rgba(0, 0, 0, 0.05)"
      px={2}
      py={2}
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
      }}
    >
      <HStack justify="space-around" align="center" spacing={1} maxW="500px" mx="auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = item.isActive;

          const content = (
            <VStack
              as="button"
              onClick={item.action}
              spacing={1}
              py={1}
              px={2}
              borderRadius="12px"
              position="relative"
              color={active ? "#bc0930" : "#5B6B73"}
              transition="all 0.2s ease"
              _active={{ transform: "scale(0.92)" }}
              minW="56px"
            >
              <Box position="relative">
                {item.isSpecial ? (
                  <Box
                    p={1.5}
                    borderRadius="full"
                    bg={active ? "#bc0930" : "#fff8f3"}
                    color={active ? "white" : "#bc0930"}
                    border="1.5px solid #F5C7CF"
                    boxShadow="sm"
                    transition="all 0.2s"
                  >
                    <IconComponent size={20} />
                  </Box>
                ) : (
                  <IconComponent size={20} strokeWidth={active ? 2.3 : 1.8} />
                )}

                {item.badge > 0 && (
                  <Badge
                    position="absolute"
                    top="-4px"
                    right="-8px"
                    bg="#bc0930"
                    color="white"
                    borderRadius="full"
                    fontSize="10px"
                    fontWeight="700"
                    lineHeight="1"
                    fontFamily="var(--font-sans)"
                    px="5px"
                    h="16px"
                    minW="16px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px solid #fffcf2"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </Box>

              <Text
                fontSize="11px"
                fontWeight={active ? "700" : "500"}
                letterSpacing="0.2px"
                lineHeight="1"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                {item.label}
              </Text>

              {active && !item.isSpecial && (
                <Box
                  position="absolute"
                  bottom="0px"
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg="#bc0930"
                />
              )}
            </VStack>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                {content}
              </Link>
            );
          }

          return <Box key={item.label}>{content}</Box>;
        })}
      </HStack>
    </Box>
  );
}
