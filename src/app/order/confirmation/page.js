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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavigationBar from "@/components/navigationbar";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        // Try to find the latest order for the signed-in user
        const { supabase } = await import("@/lib/supabase");
        if (supabase) {
          const params = new URLSearchParams(window.location.search);
          const sessionId = params.get("session_id");
          const userRes = await supabase.auth.getUser();
          const email = userRes?.data?.user?.email;
          if (email) {
            const { data } = await supabase
              .from("orders")
              .select("*")
              .eq("customer_email", email)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (data) {
              setOrder({
                orderNumber: data.order_number || sessionId || "-",
                date: data.created_at,
                items: data.items || [],
                totals: {
                  subtotal: data.total || 0,
                  taxes: (data.total || 0) * 0.12,
                  shipping: (data.total || 0) > 0 ? 150 : 0,
                  total:
                    (data.total || 0) * 1.12 +
                    ((data.total || 0) > 0 ? 150 : 0),
                },
                customer: {
                  name: data.customer_name,
                  email: data.customer_email,
                  shipping: data.shipping_address,
                  billing: data.billing_address || data.shipping_address,
                },
                payment: { method: "card", status: data.status || "Paid" },
                trackingUrl: data.tracking_url || null,
              });
              return;
            }
          }
        }
        // Fallback to localStorage if present
        const raw = localStorage.getItem("lastOrder");
        if (raw) setOrder(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  if (!mounted) return null;

  const format = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(n) || 0);

  return (
    <>
      <NavigationBar />
      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Heading
          as="h1"
          size="lg"
          textAlign="center"
          mb={2}
          style={{ fontFamily: "var(--font-rothek)", color: "#bc0930" }}
        >
          Thank you for your purchase!
        </Heading>
        <Text textAlign="center" color="#5B6B73" mb={8}>
          Your order has been received and is being processed.
        </Text>

        {!order ? (
          <Box
            textAlign="center"
            border="1px solid #EFEFEF"
            p={8}
            borderRadius="12"
            bg="white"
          >
            <Text color="#5B6B73" mb={4}>
              We couldn't find an order to display.
            </Text>
            <Link href="/">
              <Button colorScheme="red">Continue Shopping</Button>
            </Link>
          </Box>
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            <GridItem>
              <Stack spacing={6}>
                {/* Order meta */}
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text color="#5B6B73">Order Number</Text>
                      <Heading size="md">{order.orderNumber}</Heading>
                    </Box>
                    <Box textAlign="right">
                      <Text color="#5B6B73">Order Date</Text>
                      <Text>{new Date(order.date).toLocaleString()}</Text>
                    </Box>
                  </HStack>
                  <Text mt={3} color="#2f855a" fontWeight={600}>
                    Estimated delivery:{" "}
                    {order.deliveryEstimate
                      ? new Date(order.deliveryEstimate).toLocaleDateString()
                      : "3-5 business days"}
                  </Text>
                </Box>

                {/* Items */}
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <Heading size="md" mb={4}>
                    Items
                  </Heading>
                  <Stack spacing={4}>
                    {order.items.map((it) => (
                      <HStack key={it.id} align="center" gap={3}>
                        <ChakraImage
                          src={it.image || "/images/placeholder.png"}
                          alt={it.title || "Item"}
                          boxSize="56px"
                          borderRadius="8"
                          objectFit="cover"
                        />
                        <Box flex="1">
                          <Text fontWeight={600}>
                            {it.title || it.flowerType || "Item"}
                          </Text>
                          <Text fontSize="sm" color="#5B6B73">
                            Qty: {it.quantity || 1}
                          </Text>
                        </Box>
                        <Text>{format(it.price)}</Text>
                      </HStack>
                    ))}
                  </Stack>
                  <Divider my={4} />
                  <Stack spacing={1} fontSize="sm">
                    <HStack justify="space-between">
                      <Text color="#5B6B73">Subtotal</Text>
                      <Text>{format(order.totals?.subtotal)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#5B6B73">Taxes & Fees</Text>
                      <Text>{format(order.totals?.taxes)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="#5B6B73">Shipping</Text>
                      <Text>{format(order.totals?.shipping)}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" fontWeight={700}>
                      <Text>Total</Text>
                      <Text>{format(order.totals?.total)}</Text>
                    </HStack>
                  </Stack>
                </Box>

                {/* Customer info */}
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <Heading size="md" mb={4}>
                    Customer Information
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={6}
                  >
                    <Box>
                      <Text fontWeight={600}>Contact</Text>
                      <Text color="#5B6B73">{order.customer?.name}</Text>
                      <Text color="#5B6B73">{order.customer?.email}</Text>
                      {order.customer?.phone && (
                        <Text color="#5B6B73">{order.customer.phone}</Text>
                      )}
                    </Box>
                    <Box>
                      <Text fontWeight={600}>Shipping Address</Text>
                      <Text color="#5B6B73">
                        {formatAddress(order.customer?.shipping)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight={600}>Billing Address</Text>
                      <Text color="#5B6B73">
                        {formatAddress(order.customer?.billing)}
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Payment info */}
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <Heading size="md" mb={4}>
                    Payment
                  </Heading>
                  <Text color="#5B6B73">
                    Method: {order.payment?.method || "Card"}
                  </Text>
                  {order.payment?.cardLast4 && (
                    <Text color="#5B6B73">
                      Card: **** **** **** {order.payment.cardLast4}
                    </Text>
                  )}
                  {order.payment?.transactionId && (
                    <Text color="#5B6B73">
                      Transaction ID: {order.payment.transactionId}
                    </Text>
                  )}
                  <Text mt={2} color="#2f855a" fontWeight={600}>
                    Status: {order.payment?.status || "Paid"}
                  </Text>
                </Box>

                {/* Next steps */}
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <Heading size="md" mb={4}>
                    What happens next?
                  </Heading>
                  <Stack spacing={2} color="#5B6B73">
                    <Text>We'll send you updates when your order ships.</Text>
                    {order.trackingUrl ? (
                      <a href={order.trackingUrl} style={{ color: "#3b5bfd" }}>
                        Track your package
                      </a>
                    ) : (
                      <Text>Tracking link will appear when available.</Text>
                    )}
                    <a href="/refund" style={{ color: "#3b5bfd" }}>
                      Read our return policy
                    </a>
                  </Stack>
                  <Link href="/">
                    <Button mt={4} colorScheme="red">
                      Continue Shopping
                    </Button>
                  </Link>
                </Box>

                {/* Discount banner */}
                <Box
                  p={5}
                  borderRadius="12"
                  bg="#fff5f5"
                  border="1px dashed #fed7d7"
                >
                  <Text fontWeight={700} color="#bc0930">
                    Enjoy 10% off your next purchase with code THANKYOU10
                  </Text>
                </Box>
              </Stack>
            </GridItem>

            {/* Right column for highlights */}
            <GridItem>
              <Box
                border="1px solid #EFEFEF"
                p={5}
                borderRadius="12"
                bg="white"
                position="sticky"
                top={16}
              >
                <Heading size="md" mb={4}>
                  Order Highlights
                </Heading>
                <Stack spacing={2}>
                  <Text>
                    <strong>Order:</strong> {order.orderNumber}
                  </Text>
                  <Text>
                    <strong>Date:</strong>{" "}
                    {new Date(order.date).toLocaleDateString()}
                  </Text>
                  <Text>
                    <strong>Delivery:</strong>{" "}
                    {order.deliveryEstimate
                      ? new Date(order.deliveryEstimate).toLocaleDateString()
                      : "3-5 business days"}
                  </Text>
                  <Divider />
                  <Text>
                    <strong>Total Paid:</strong> {format(order.totals?.total)}
                  </Text>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        )}
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
