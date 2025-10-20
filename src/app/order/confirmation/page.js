"use client";

import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image as ChakraImage,
  Stack,
  Text,
  VStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NavigationBar from "@/components/navigationbar";
import { useCart } from "@/components/CartContext";
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Gift,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(null);
  const [mounted, setMounted] = useState(false);
  const cart = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        // If session_id present, confirm with backend to fetch and persist
        const { supabase } = await import("@/lib/supabase");
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const pmRef = params.get("pm_ref");
        if (sessionId) {
          let userId = null;
          if (supabase) {
            const userRes = await supabase.auth.getUser();
            userId = userRes?.data?.user?.id || null;
          }
          const res = await fetch("/api/payments/stripe/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, user_id: userId }),
          });
          const data = await res.json();
          if (res.ok && data?.order) {
            setOrder(data.order);
            try {
              localStorage.setItem("lastOrder", JSON.stringify(data.order));
            } catch {}
            if (data.dbError) {
              // eslint-disable-next-line no-console
              console.warn("Order save warning:", data.dbError);
            }
            return;
          }
        }
        if (pmRef) {
          let userId = null;
          if (supabase) {
            const userRes = await supabase.auth.getUser();
            userId = userRes?.data?.user?.id || null;
          }
          const res = await fetch("/api/payments/paymongo/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: pmRef, user_id: userId }),
          });
          const data = await res.json();
          if (res.ok && data?.order) {
            setOrder(data.order);
            try {
              localStorage.setItem("lastOrder", JSON.stringify(data.order));
            } catch {}
            if (data.dbError) {
              // eslint-disable-next-line no-console
              console.warn("Order save warning:", data.dbError);
            }
            return;
          }
        }
        // Fallback: read last order
        // Fallback to localStorage if present
        const raw = localStorage.getItem("lastOrder");
        if (raw) setOrder(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // Clear the shopping cart once when we have a confirmed order loaded
  useEffect(() => {
    try {
      if (order && !clearedRef.current) {
        clearedRef.current = true;
        cart.clearCart();
      }
    } catch {}
  }, [order, cart]);

  if (!mounted) return null;

  const format = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);

  return (
    <>
      <NavigationBar />
      <Box bg="#fffcf2" minH="100vh" py={8}>
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          {/* Success Header */}
          <VStack spacing={6} mb={8} textAlign="center">
            <Box
              p={6}
              bg="#fffcf2"
              borderRadius="full"
              border="3px solid"
              borderColor="#F5C7CF"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CheckCircle size={64} color="#bc0930" />
            </Box>
            <VStack spacing={3}>
              <Heading
                as="h1"
                fontSize="4xl"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Order Confirmed!
              </Heading>
              <Text fontSize="lg" color="#5B6B73" maxW="600px">
                Thank you for your purchase! We've received your order and will
                start preparing it right away.
              </Text>
              <Badge
                bg="#2f855a"
                color="white"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
              >
                Payment Successful
              </Badge>
            </VStack>
          </VStack>

          {!order ? (
            <Box
              textAlign="center"
              border="2px solid"
              borderColor="#F5C7CF"
              p={12}
              borderRadius="16px"
              bg="white"
              boxShadow="lg"
            >
              <VStack spacing={4}>
                <Box
                  p={4}
                  bg="#fffcf2"
                  borderRadius="full"
                  border="2px dashed"
                  borderColor="#F5C7CF"
                >
                  <Package size={48} color="#bc0930" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="600" color="#2B2B2B">
                    Order Not Found
                  </Text>
                  <Text color="#5B6B73">
                    We couldn't find an order to display.
                  </Text>
                </VStack>
                <Link href="/">
                  <Button
                    bg="#bc0930"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    _hover={{
                      bg: "#a10828",
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    fontWeight="600"
                    transition="all 0.2s"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </VStack>
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
              <GridItem>
                <Stack spacing={6}>
                  {/* Order Summary Card */}
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <Calendar size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Order Summary
                      </Heading>
                    </HStack>
                    <Grid
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={6}
                    >
                      <VStack align="start" spacing={2}>
                        <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                          Order Number
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="700"
                          color="#bc0930"
                          wordBreak="break-all"
                          overflowWrap="break-word"
                          maxW="100%"
                        >
                          {order.orderNumber}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                          Order Date
                        </Text>
                        <Text fontSize="lg" fontWeight="600" color="#2B2B2B">
                          {new Date(order.date).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Grid>
                    <Box
                      mt={4}
                      p={3}
                      bg="#fffcf2"
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <HStack spacing={2}>
                        <Truck size={18} color="#2f855a" />
                        <Text color="#2f855a" fontWeight="600" fontSize="sm">
                          Estimated delivery:{" "}
                          {order.deliveryEstimate
                            ? new Date(
                                order.deliveryEstimate
                              ).toLocaleDateString()
                            : "3-5 business days"}
                        </Text>
                      </HStack>
                    </Box>
                  </Box>

                  {/* Items */}
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <Package size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Items Ordered
                      </Heading>
                    </HStack>
                    <Stack spacing={4}>
                      {order.items.map((it, idx) => (
                        <Box
                          key={
                            it?.id ||
                            `${it?.title || it?.flowerType || "item"}-${idx}`
                          }
                          p={4}
                          bg="#fffcf2"
                          borderRadius="12px"
                          border="1px solid"
                          borderColor="#F5C7CF"
                        >
                          <HStack align="start" gap={4}>
                            <ChakraImage
                              src={it.image || "/images/placeholder.png"}
                              alt={it.title || "Item"}
                              boxSize="80px"
                              borderRadius="12px"
                              objectFit="cover"
                              border="2px solid"
                              borderColor="#F5C7CF"
                            />
                            <Box flex="1">
                              <Text
                                fontWeight={700}
                                fontSize="md"
                                color="#2B2B2B"
                                mb={1}
                              >
                                {it.title || it.flowerType || "Item"}
                              </Text>
                              <HStack spacing={3} mb={2}>
                                <Text fontSize="sm" color="#5B6B73">
                                  Qty: {it.quantity || 1}
                                </Text>
                                <Text fontSize="sm" color="#5B6B73">
                                  •
                                </Text>
                                <Text fontSize="sm" color="#5B6B73">
                                  {format(it.price)} each
                                </Text>
                              </HStack>
                              <Text
                                fontSize="lg"
                                fontWeight="700"
                                color="#bc0930"
                              >
                                {format(
                                  (Number(it.price) || 0) * (it.quantity || 1)
                                )}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                    </Stack>
                    <Divider my={5} borderColor="#F5C7CF" />
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                          Subtotal
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                          {format(order.totals?.subtotal)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                          Taxes & Fees
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                          {format(order.totals?.taxes)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                          Shipping
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                          {format(order.totals?.shipping)}
                        </Text>
                      </HStack>
                      <Divider borderColor="#F5C7CF" />
                      <HStack justify="space-between" pt={2}>
                        <Text fontSize="lg" fontWeight="700" color="#2B2B2B">
                          Total
                        </Text>
                        <Text fontSize="xl" fontWeight="700" color="#bc0930">
                          {format(order.totals?.total)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Customer info */}
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <User size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Customer Information
                      </Heading>
                    </HStack>
                    <Grid
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={6}
                    >
                      <Box>
                        <HStack spacing={2} mb={3}>
                          <User size={16} color="#5B6B73" />
                          <Text fontWeight={600} color="#2B2B2B">
                            Contact
                          </Text>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text color="#2B2B2B" fontWeight="500">
                            {order.customer?.name}
                          </Text>
                          <Text color="#5B6B73" fontSize="sm">
                            {order.customer?.email}
                          </Text>
                          {order.customer?.phone && (
                            <Text color="#5B6B73" fontSize="sm">
                              {order.customer.phone}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                      <Box>
                        <HStack spacing={2} mb={3}>
                          <MapPin size={16} color="#5B6B73" />
                          <Text fontWeight={600} color="#2B2B2B">
                            Shipping Address
                          </Text>
                        </HStack>
                        <Text color="#5B6B73" fontSize="sm" lineHeight="1.5">
                          {formatAddress(order.customer?.shipping)}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Payment info */}
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <CreditCard size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Payment Information
                      </Heading>
                    </HStack>
                    <VStack align="start" spacing={3}>
                      <HStack spacing={2}>
                        <Text color="#5B6B73" fontSize="sm">
                          Method:
                        </Text>
                        <Text fontWeight="600" color="#2B2B2B">
                          {order.payment?.method || "Card"}
                        </Text>
                      </HStack>
                      {order.payment?.cardLast4 && (
                        <HStack spacing={2}>
                          <Text color="#5B6B73" fontSize="sm">
                            Card:
                          </Text>
                          <Text fontWeight="600" color="#2B2B2B">
                            **** **** **** {order.payment.cardLast4}
                          </Text>
                        </HStack>
                      )}
                      {order.payment?.transactionId && (
                        <HStack spacing={2}>
                          <Text color="#5B6B73" fontSize="sm">
                            Transaction ID:
                          </Text>
                          <Text fontWeight="600" color="#2B2B2B">
                            {order.payment.transactionId}
                          </Text>
                        </HStack>
                      )}
                      <Box
                        p={3}
                        bg="#fffcf2"
                        borderRadius="12px"
                        border="1px solid"
                        borderColor="#F5C7CF"
                        w="100%"
                      >
                        <HStack spacing={2}>
                          <CheckCircle size={18} color="#2f855a" />
                          <Text color="#2f855a" fontWeight="600" fontSize="sm">
                            Status: {order.payment?.status || "Paid"}
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>

                  {/* Next steps */}
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <Truck size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        What happens next?
                      </Heading>
                    </HStack>
                    <VStack align="start" spacing={4}>
                      <Text color="#5B6B73" fontSize="sm">
                        We'll send you updates when your order ships.
                      </Text>
                      {order.trackingUrl ? (
                        <Button
                          as="a"
                          href={order.trackingUrl}
                          variant="outline"
                          borderColor="#F5C7CF"
                          color="#bc0930"
                          _hover={{
                            bg: "#fffcf2",
                            borderColor: "#bc0930",
                          }}
                          size="sm"
                          borderRadius="full"
                        >
                          Track your package
                        </Button>
                      ) : (
                        <Text color="#5B6B73" fontSize="sm">
                          Tracking link will appear when available.
                        </Text>
                      )}
                      <Button
                        as="a"
                        href="/refund"
                        variant="outline"
                        borderColor="#F5C7CF"
                        color="#bc0930"
                        _hover={{
                          bg: "#fffcf2",
                          borderColor: "#bc0930",
                        }}
                        size="sm"
                        borderRadius="full"
                      >
                        Read our return policy
                      </Button>
                      <Link href="/">
                        <Button
                          bg="#bc0930"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          _hover={{
                            bg: "#a10828",
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          fontWeight="600"
                          transition="all 0.2s"
                          mt={4}
                        >
                          Continue Shopping
                        </Button>
                      </Link>
                    </VStack>
                  </Box>

                  {/* Discount banner */}
                  <Box
                    p={6}
                    borderRadius="16px"
                    bg="#fffcf2"
                    border="2px dashed"
                    borderColor="#F5C7CF"
                    textAlign="center"
                  >
                    <HStack spacing={3} justify="center" mb={3}>
                      <Gift size={24} color="#bc0930" />
                      <Text fontWeight={700} color="#bc0930" fontSize="lg">
                        Special Offer
                      </Text>
                    </HStack>
                    <Text fontWeight={600} color="#2B2B2B" fontSize="md">
                      Enjoy 10% off your next purchase with code
                    </Text>
                    <Badge
                      bg="#bc0930"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="md"
                      fontWeight="700"
                      mt={2}
                    >
                      THANKYOU10
                    </Badge>
                  </Box>
                </Stack>
              </GridItem>

              {/* Right column for highlights */}
              <GridItem>
                <Box
                  border="2px solid"
                  borderColor="#F5C7CF"
                  p={6}
                  borderRadius="16px"
                  bg="white"
                  boxShadow="lg"
                  position="sticky"
                  top={16}
                >
                  <HStack spacing={3} mb={5}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <CheckCircle size={20} color="#bc0930" />
                    </Box>
                    <Heading
                      size="md"
                      color="#2B2B2B"
                      style={{ fontFamily: "var(--font-rothek)" }}
                    >
                      Order Highlights
                    </Heading>
                  </HStack>
                  <VStack spacing={4} align="stretch">
                    <Box
                      p={3}
                      bg="#fffcf2"
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <VStack spacing={2} align="start">
                        <Text fontSize="sm" color="#5B6B73" fontWeight="500">
                          Order Number
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="700"
                          color="#bc0930"
                          wordBreak="break-all"
                          overflowWrap="break-word"
                          maxW="100%"
                        >
                          {order.orderNumber}
                        </Text>
                      </VStack>
                    </Box>
                    <Box
                      p={3}
                      bg="#fffcf2"
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <VStack spacing={2} align="start">
                        <Text fontSize="sm" color="#5B6B73" fontWeight="500">
                          Order Date
                        </Text>
                        <Text fontSize="md" fontWeight="600" color="#2B2B2B">
                          {new Date(order.date).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Box>
                    <Box
                      p={3}
                      bg="#fffcf2"
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <VStack spacing={2} align="start">
                        <Text fontSize="sm" color="#5B6B73" fontWeight="500">
                          Delivery
                        </Text>
                        <Text fontSize="md" fontWeight="600" color="#2B2B2B">
                          {order.deliveryEstimate
                            ? new Date(
                                order.deliveryEstimate
                              ).toLocaleDateString()
                            : "3-5 business days"}
                        </Text>
                      </VStack>
                    </Box>
                    <Divider borderColor="#F5C7CF" />
                    <Box
                      p={4}
                      bg="#fffcf2"
                      borderRadius="12px"
                      border="2px solid"
                      borderColor="#F5C7CF"
                      textAlign="center"
                    >
                      <Text
                        fontSize="sm"
                        color="#5B6B73"
                        fontWeight="500"
                        mb={1}
                      >
                        Total Paid
                      </Text>
                      <Text fontSize="2xl" fontWeight="700" color="#bc0930">
                        {format(order.totals?.total)}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </GridItem>
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
}

function formatAddress(addr) {
  if (!addr) return "-";
  const parts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.state,
    addr.zip,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}
