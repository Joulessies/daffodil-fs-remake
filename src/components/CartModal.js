"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Image as ChakraImage,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";

export default function CartModal() {
  const cart = useCart();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Bridge CartContext open/close to Chakra's Modal
  useEffect(() => {
    if (cart.isOpen) onOpen();
    else onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.isOpen]);

  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(n || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={cart.close}
      isCentered
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="16px"
        boxShadow="2xl"
        bg="white"
        border="2px solid"
        borderColor="#F5C7CF"
        maxH="90vh"
      >
        <ModalHeader
          bg="#fffcf2"
          borderTopRadius="14px"
          borderBottom="2px solid"
          borderColor="#F5C7CF"
          py={4}
        >
          <HStack spacing={3}>
            <Box
              p={2}
              bg="#bc0930"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <ShoppingBag size={20} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text
                fontSize="xl"
                fontWeight="700"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Your Cart
              </Text>
              <Text fontSize="sm" color="#5B6B73" fontWeight="400">
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="#bc0930" _hover={{ bg: "#fff8f3" }} top={4} />
        <ModalBody py={6} px={6}>
          {cart.items.length === 0 ? (
            <VStack spacing={4} py={12} textAlign="center">
              <Box
                p={6}
                bg="#fffcf2"
                borderRadius="full"
                border="2px dashed"
                borderColor="#F5C7CF"
              >
                <ShoppingBag size={48} color="#bc0930" />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="#2B2B2B">
                  Your cart is empty
                </Text>
                <Text fontSize="sm" color="#5B6B73">
                  Add some beautiful flowers to get started
                </Text>
              </VStack>
              <Link href="/shop">
                <Button
                  bg="#bc0930"
                  color="white"
                  size="lg"
                  borderRadius="full"
                  onClick={cart.close}
                  _hover={{
                    bg: "#a10828",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                  px={8}
                >
                  Browse Shop
                </Button>
              </Link>
            </VStack>
          ) : (
            <Stack spacing={3}>
              {cart.items.map((item, index) => {
                const prod = PRODUCTS.find((p) => p.id === item.id);
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
                  return parts
                    .map((seg, idx) =>
                      idx === 0 && seg === "" ? "" : encodeURIComponent(seg)
                    )
                    .join("/");
                };
                const sanitize = (src) => {
                  if (!src || typeof src !== "string") return "";
                  let s = src.trim();
                  if (s.startsWith("/https%3A") || s.startsWith("https%3A")) {
                    try {
                      s = decodeURIComponent(s.replace(/^\//, ""));
                    } catch {}
                  }
                  if (
                    /^https?:\/\//i.test(s) ||
                    s.startsWith("data:") ||
                    s.startsWith("blob:")
                  )
                    return s;
                  return encodePathSegments(s);
                };
                const seasonal = (src) =>
                  typeof src === "string" &&
                  src.startsWith("/seasonal-flowers/")
                    ? src
                    : "";
                const imageSrc =
                  seasonal(item.image) ||
                  seasonal(prod?.images?.[0]) ||
                  sanitize(item.image) ||
                  sanitize(prod?.images?.[0]) ||
                  "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop";
                const lineTotal =
                  (Number(item.price) || 0) * (item.quantity || 1);
                // Generate a unique key using item.id, index, and other unique properties
                const uniqueKey =
                  item.id ||
                  `${item.title || item.flowerType || "item"}-${index}-${
                    item.price || 0
                  }`;
                return (
                  <Box
                    key={uniqueKey}
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={4}
                    borderRadius="12px"
                    bg="#fffcf2"
                    _hover={{
                      borderColor: "#bc0930",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    <HStack align="start" spacing={4}>
                      <Box
                        position="relative"
                        borderRadius="12px"
                        overflow="hidden"
                        border="2px solid"
                        borderColor="#F5C7CF"
                      >
                        <ChakraImage
                          src={imageSrc}
                          alt={item.title || item.flowerType || "Item"}
                          boxSize="80px"
                          objectFit="cover"
                        />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Text
                          fontWeight={700}
                          fontSize="md"
                          noOfLines={1}
                          color="#2B2B2B"
                        >
                          {item.title || item.flowerType || "Item"}
                        </Text>
                        {item.description && (
                          <Text
                            fontSize="sm"
                            color="#5B6B73"
                            noOfLines={2}
                            mt={1}
                          >
                            {item.description}
                          </Text>
                        )}
                        <HStack spacing={2} mt={2} wrap="wrap">
                          {item.color && (
                            <Badge
                              bg="#bc0930"
                              color="white"
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                            >
                              {item.color}
                            </Badge>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <Badge
                              bg="#5B6B73"
                              color="white"
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                            >
                              +{item.addons.length} add-ons
                            </Badge>
                          )}
                        </HStack>
                        <HStack spacing={2} mt={3}>
                          <HStack spacing={1}>
                            <IconButton
                              size="sm"
                              icon={<Minus size={14} />}
                              onClick={() =>
                                cart.updateQuantity(
                                  item.id,
                                  Math.max(1, (item.quantity || 1) - 1)
                                )
                              }
                              variant="outline"
                              borderColor="#F5C7CF"
                              color="#bc0930"
                              _hover={{
                                bg: "#fff8f3",
                                borderColor: "#bc0930",
                              }}
                              aria-label="Decrease quantity"
                            />
                            <Text
                              fontSize="sm"
                              fontWeight="600"
                              minW="32px"
                              textAlign="center"
                              color="#2B2B2B"
                            >
                              {item.quantity || 1}
                            </Text>
                            <IconButton
                              size="sm"
                              icon={<Plus size={14} />}
                              onClick={() =>
                                cart.updateQuantity(
                                  item.id,
                                  Math.min(99, (item.quantity || 1) + 1)
                                )
                              }
                              variant="outline"
                              borderColor="#F5C7CF"
                              color="#bc0930"
                              _hover={{
                                bg: "#fff8f3",
                                borderColor: "#bc0930",
                              }}
                              aria-label="Increase quantity"
                            />
                          </HStack>
                          <Tooltip label="Remove from cart" hasArrow>
                            <IconButton
                              size="sm"
                              icon={<Trash2 size={14} />}
                              onClick={() => cart.removeItem(item.id)}
                              variant="ghost"
                              colorScheme="red"
                              _hover={{
                                bg: "#fee",
                              }}
                              aria-label="Remove item"
                            />
                          </Tooltip>
                        </HStack>
                      </Box>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight={700} fontSize="lg" color="#bc0930">
                          {formatPeso(lineTotal)}
                        </Text>
                        <Text fontSize="xs" color="#5B6B73">
                          {formatPeso(item.price)} each
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter
          bg="#fffcf2"
          borderTop="2px solid"
          borderColor="#F5C7CF"
          borderBottomRadius="14px"
          flexDirection="column"
          alignItems="stretch"
          gap={4}
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text color="#2B2B2B" fontSize="sm" fontWeight="600">
                Subtotal
              </Text>
              <Text fontWeight="700" fontSize="xl" color="#bc0930">
                {formatPeso(cart.total)}
              </Text>
            </HStack>
            <Text fontSize="sm" color="#2B2B2B" fontWeight="500">
              Taxes and shipping calculated at checkout
            </Text>
            {cart.total < 20 && cart.total > 0 && (
              <Box
                p={3}
                bg="#fff3cd"
                borderRadius="8px"
                border="1px solid"
                borderColor="#ffc107"
              >
                <Text fontSize="xs" color="#856404" fontWeight="600">
                  ⚠️ Minimum order: ₱20.00 (₱{(20 - cart.total).toFixed(2)} more
                  needed)
                </Text>
              </Box>
            )}
          </VStack>
          <HStack spacing={3} w="100%">
            <Button
              flex={1}
              variant="outline"
              borderRadius="full"
              borderWidth="2px"
              color="#bc0930"
              borderColor="#bc0930"
              _hover={{ bg: "#fff8f3" }}
              onClick={cart.clearCart}
              isDisabled={cart.items.length === 0}
              fontWeight="600"
            >
              Clear Cart
            </Button>
            <Link href="/checkout" style={{ flex: 1 }}>
              <Button
                w="100%"
                borderRadius="full"
                bg="#bc0930"
                color="white"
                size="lg"
                _hover={{
                  bg: "#a10828",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                isDisabled={cart.items.length === 0 || cart.total < 20}
                onClick={cart.close}
                fontWeight="600"
                transition="all 0.2s"
              >
                Go to Checkout
              </Button>
            </Link>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
