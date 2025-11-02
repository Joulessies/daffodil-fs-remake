"use client";

import { useEffect, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Heading,
  Stack,
  Text,
  HStack,
  Divider,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  Spinner,
  Center,
  Image,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";

export default function OrderDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Don't load order if user is not authenticated
        if (!user?.email || !orderId) {
          if (mounted) {
            setOrder(null);
            setLoading(false);
          }
          return;
        }

        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;

        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_number, total, status, created_at, tracking_url, items, customer_email, customer_name, customer_phone, shipping_address"
          )
          .eq("id", orderId)
          .eq("customer_email", user.email)
          .single();

        if (error) throw error;
        if (mounted) setOrder(data || null);
      } catch (error) {
        console.error("Error loading order:", error);
        if (mounted) setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId, user?.email]);

  const items = Array.isArray(order?.items) ? order.items : [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "green";
      case "pending":
        return "yellow";
      case "processing":
      case "shipped":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <>
      <NavigationBar />
      <Box minH="100vh" bg="#fffcf2" p={{ base: 4, md: 6 }}>
        <Box maxW={1100} mx="auto">
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Link href="/profile/orders">
                    <Button
                      variant="ghost"
                      leftIcon={<ArrowLeft size={16} />}
                      color="#5B6B73"
                      _hover={{ bg: "#fff8f3" }}
                    >
                      Back to Orders
                    </Button>
                  </Link>
                </HStack>
                <Heading
                  size="xl"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Order Details
                </Heading>
                <Text color="#5B6B73">
                  Order #{order?.order_number} •{" "}
                  {order && new Date(order.created_at).toLocaleDateString()}
                </Text>
              </VStack>
              {order && (
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {order.status || "Paid"}
                </Badge>
              )}
            </HStack>

            {authLoading || loading ? (
              <Center py={12}>
                <VStack spacing={4}>
                  <Spinner size="lg" color="#bc0930" />
                  <Text color="#5B6B73">
                    {authLoading ? "Loading..." : "Loading order details..."}
                  </Text>
                </VStack>
              </Center>
            ) : !user ? (
              <Box
                border="1px solid #F5C7CF"
                p={8}
                borderRadius="16px"
                bg="white"
                textAlign="center"
              >
                <Package
                  size={48}
                  color="#5B6B73"
                  style={{ margin: "0 auto 16px" }}
                />
                <Text color="#5B6B73" fontSize="lg" mb={4}>
                  Please log in to view order details
                </Text>
                <Text color="#5B6B73" mb={6}>
                  You need to be logged in to see your order information
                </Text>
              </Box>
            ) : !order ? (
              <Box
                border="1px solid #F5C7CF"
                p={8}
                borderRadius="16px"
                bg="white"
                textAlign="center"
              >
                <Package
                  size={48}
                  color="#5B6B73"
                  style={{ margin: "0 auto 16px" }}
                />
                <Text color="#5B6B73" fontSize="lg">
                  Order not found
                </Text>
              </Box>
            ) : (
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                {/* Main Content */}
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Order Items */}
                    <Box
                      border="1px solid #F5C7CF"
                      borderRadius="16px"
                      bg="white"
                      p={6}
                    >
                      <HStack mb={4}>
                        <Package size={20} color="#bc0930" />
                        <Heading
                          size="md"
                          color="#bc0930"
                          style={{ fontFamily: "var(--font-rothek)" }}
                        >
                          Order Items
                        </Heading>
                      </HStack>
                      <Divider mb={4} borderColor="#F5C7CF" />
                      {items.length === 0 ? (
                        <Text color="#5B6B73" textAlign="center" py={4}>
                          No items recorded for this order
                        </Text>
                      ) : (
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Product</Th>
                              <Th isNumeric>Quantity</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Subtotal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {items.map((item, index) => (
                              <Tr key={index}>
                                <Td>
                                  <HStack>
                                    {item.image && (
                                      <Image
                                        src={item.image}
                                        alt={
                                          item.title ||
                                          item.flowerType ||
                                          "Item"
                                        }
                                        boxSize="40px"
                                        objectFit="cover"
                                        borderRadius="8px"
                                      />
                                    )}
                                    <Text fontSize="sm">
                                      {item.title || item.flowerType || "Item"}
                                    </Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>{item.quantity || 1}</Td>
                                <Td isNumeric>
                                  ₱{Number(item.price || 0).toFixed(2)}
                                </Td>
                                <Td isNumeric fontWeight="600">
                                  ₱
                                  {(
                                    (item.quantity || 1) *
                                    Number(item.price || 0)
                                  ).toFixed(2)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                      <Divider my={4} borderColor="#F5C7CF" />
                      <HStack justify="space-between" align="center">
                        <Text fontWeight="600" fontSize="lg">
                          Total
                        </Text>
                        <Text
                          fontWeight="bold"
                          fontSize="2xl"
                          color="#bc0930"
                          style={{ fontFamily: "var(--font-rothek)" }}
                        >
                          ₱{Number(order.total || 0).toFixed(2)}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Order Tracking */}
                    {order.tracking_url && (
                      <Box
                        border="1px solid #F5C7CF"
                        borderRadius="16px"
                        bg="white"
                        p={6}
                      >
                        <HStack mb={4}>
                          <Truck size={20} color="#bc0930" />
                          <Heading
                            size="md"
                            color="#bc0930"
                            style={{ fontFamily: "var(--font-rothek)" }}
                          >
                            Track Your Package
                          </Heading>
                        </HStack>
                        <Divider mb={4} borderColor="#F5C7CF" />
                        <VStack spacing={3} align="stretch">
                          <Text color="#5B6B73">
                            Your package is on its way! Click the button below
                            to track your shipment.
                          </Text>
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              leftIcon={<Truck size={16} />}
                              colorScheme="blue"
                              size="lg"
                              w="full"
                            >
                              Track Package
                            </Button>
                          </a>
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </GridItem>

                {/* Sidebar */}
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Order Summary */}
                    <Box
                      border="1px solid #F5C7CF"
                      borderRadius="16px"
                      bg="white"
                      p={6}
                    >
                      <HStack mb={4}>
                        <Calendar size={20} color="#bc0930" />
                        <Heading
                          size="md"
                          color="#bc0930"
                          style={{ fontFamily: "var(--font-rothek)" }}
                        >
                          Order Summary
                        </Heading>
                      </HStack>
                      <Divider mb={4} borderColor="#F5C7CF" />
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text color="#5B6B73">Order Number:</Text>
                          <Text fontWeight="500">{order.order_number}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#5B6B73">Order Date:</Text>
                          <Text fontWeight="500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#5B6B73">Order Time:</Text>
                          <Text fontWeight="500">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#5B6B73">Status:</Text>
                          <Badge
                            colorScheme={getStatusColor(order.status)}
                            fontSize="sm"
                          >
                            {order.status || "Paid"}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="#5B6B73">Total Amount:</Text>
                          <Text fontWeight="600" color="#bc0930">
                            ₱{Number(order.total || 0).toFixed(2)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Customer Information */}
                    {(order.customer_name ||
                      order.customer_email ||
                      order.shipping_address) && (
                      <Box
                        border="1px solid #F5C7CF"
                        borderRadius="16px"
                        bg="white"
                        p={6}
                      >
                        <HStack mb={4}>
                          <User size={20} color="#bc0930" />
                          <Heading
                            size="md"
                            color="#bc0930"
                            style={{ fontFamily: "var(--font-rothek)" }}
                          >
                            Customer Info
                          </Heading>
                        </HStack>
                        <Divider mb={4} borderColor="#F5C7CF" />
                        <VStack spacing={3} align="stretch">
                          {order.customer_name && (
                            <HStack>
                              <User size={16} color="#5B6B73" />
                              <Text color="#5B6B73" w="80px">
                                Name:
                              </Text>
                              <Text fontWeight="500">
                                {order.customer_name}
                              </Text>
                            </HStack>
                          )}
                          {order.customer_email && (
                            <HStack>
                              <Text color="#5B6B73" w="80px">
                                Email:
                              </Text>
                              <Text fontWeight="500">
                                {order.customer_email}
                              </Text>
                            </HStack>
                          )}
                          {order.shipping_address && (
                            <HStack align="start">
                              <MapPin
                                size={16}
                                color="#5B6B73"
                                style={{ marginTop: 4 }}
                              />
                              <Text color="#5B6B73" w="80px">
                                Address:
                              </Text>
                              <Text fontWeight="500" flex={1}>
                                {order.shipping_address}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </VStack>
        </Box>
      </Box>
    </>
  );
}
