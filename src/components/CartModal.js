"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
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
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useCart } from "./CartContext";
import Link from "next/link";

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
    <Modal isOpen={isOpen} onClose={cart.close} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Your Cart</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            {cart.items.length === 0 && (
              <Text color="#5B6B73">Your cart is empty.</Text>
            )}
            {cart.items.map((item) => (
              <Box
                key={item.id}
                border="1px solid #EFEFEF"
                p={3}
                borderRadius="8"
              >
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontWeight={600}>
                      {item.title || item.flowerType || "Item"}
                    </Text>
                    {item.description && (
                      <Text fontSize="sm" color="#5B6B73">
                        {item.description}
                      </Text>
                    )}
                    {item.color && (
                      <Badge mt={1} colorScheme="pink">
                        {item.color}
                      </Badge>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <Text mt={1} fontSize="sm">
                        Add-ons: {item.addons.join(", ")}
                      </Text>
                    )}
                  </Box>
                  <Box textAlign="right">
                    <Text>{formatPeso(item.price)}</Text>
                    <Text fontSize="sm" color="#5B6B73">
                      Qty: {item.quantity || 1}
                    </Text>
                    <Button
                      size="sm"
                      mt={2}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => cart.removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </HStack>
              </Box>
            ))}
          </Stack>
          <Divider my={4} />
          <HStack justify="space-between">
            <Text fontWeight={700}>Total</Text>
            <Text fontWeight={700}>{formatPeso(cart.total)}</Text>
          </HStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={cart.clearCart}
              isDisabled={cart.items.length === 0}
            >
              Clear
            </Button>
            <Link href="/checkout">
              <Button
                colorScheme="red"
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
