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
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

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
    <Modal isOpen={isOpen} onClose={cart.close} isCentered size="xl">
      <ModalOverlay />
      <ModalContent
        borderRadius="20"
        boxShadow="lg"
        bg="#FFF8F3"
        border="1px solid #F5C7CF"
      >
        <ModalHeader
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Your Cart
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            {cart.items.length === 0 && (
              <Text color="#5B6B73">Your cart is empty.</Text>
            )}
            {cart.items.map((item) => {
              const prod = PRODUCTS.find((p) => p.id === item.id);
              // Normalize spaces and special chars in internal asset paths
              const normalize = (src) => {
                if (!src || typeof src !== "string") return "";
                try {
                  const parts = src.split("/");
                  return parts
                    .map((seg, idx) =>
                      idx === 0 && seg === "" ? "" : encodeURIComponent(seg)
                    )
                    .join("/");
                } catch {
                  return src;
                }
              };
              // Prefer app-relative seasonal paths without leading /images
              const seasonal = (src) =>
                typeof src === "string" && src.startsWith("/seasonal-flowers/")
                  ? src
                  : "";
              const imageSrc =
                seasonal(item.image) ||
                seasonal(prod?.images?.[0]) ||
                normalize(item.image) ||
                normalize(prod?.images?.[0]) ||
                "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop";
              const lineTotal =
                (Number(item.price) || 0) * (item.quantity || 1);
              return (
                <Box
                  key={item.id}
                  border="1px solid #EFEFEF"
                  p={3}
                  borderRadius="16"
                  bg="#fff"
                >
                  <HStack align="start" spacing={3}>
                    <ChakraImage
                      src={imageSrc}
                      alt={item.title || item.flowerType || "Item"}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="12"
                      border="1px solid #EFEFEF"
                    />
                    <Box flex={1} minW={0}>
                      <Text fontWeight={600} noOfLines={1}>
                        {item.title || item.flowerType || "Item"}
                      </Text>
                      {item.description && (
                        <Text fontSize="sm" color="#5B6B73" noOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                      <HStack spacing={2} mt={1} wrap="wrap">
                        {item.color && (
                          <Badge colorScheme="pink">{item.color}</Badge>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <Badge colorScheme="gray">
                            Add-ons: {item.addons.join(", ")}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                    <Box textAlign="right" minW="160px">
                      <HStack justify="flex-end" spacing={2}>
                        <NumberInput
                          size="sm"
                          value={item.quantity || 1}
                          min={1}
                          max={99}
                          w="88px"
                          focusBorderColor="#bc0930"
                          onChange={(_vStr, vNum) => {
                            const safe = Math.max(
                              1,
                              Math.min(99, Number(vNum) || 1)
                            );
                            cart.updateQuantity(item.id, safe);
                          }}
                        >
                          <NumberInputField borderRadius="10" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => cart.removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </HStack>
                      <Text mt={2} fontWeight={700}>
                        {formatPeso(lineTotal)}
                      </Text>
                      <Text fontSize="xs" color="#5B6B73">
                        {formatPeso(item.price)} each
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              );
            })}
          </Stack>
          <Divider my={4} borderColor="#F5C7CF" />
          <Stack spacing={1}>
            <HStack justify="space-between">
              <Text color="#5B6B73">Subtotal</Text>
              <Text>{formatPeso(cart.total)}</Text>
            </HStack>
            <Text fontSize="xs" color="#5B6B73">
              Taxes and shipping calculated at checkout
            </Text>
          </Stack>
        </ModalBody>
        <ModalFooter
          position="sticky"
          bottom={0}
          bg="#FFF8F3"
          borderTop="1px solid #F5C7CF"
        >
          <HStack spacing={3}>
            <Button
              variant="outline"
              borderRadius="9999px"
              color="#bc0930"
              borderColor="#bc0930"
              _hover={{ bg: "rgba(188,9,48,0.06)" }}
              onClick={cart.clearCart}
              isDisabled={cart.items.length === 0}
            >
              Clear
            </Button>
            <Link href="/checkout">
              <Button
                borderRadius="9999px"
                colorScheme="red"
                bg="#bc0930"
                _hover={{ bg: "#a10828" }}
                isDisabled={cart.items.length === 0}
                onClick={cart.close}
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
