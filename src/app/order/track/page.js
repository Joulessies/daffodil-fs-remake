"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavigationBar from "@/components/navigationbar";
import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  Grid,
  GridItem,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
} from "@chakra-ui/react";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  Phone,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams?.get("id") || searchParams?.get("order") || "";
  const urlEmail = searchParams?.get("email") || "";

  const { user } = useAuth();
  const [orderQuery, setOrderQuery] = useState(urlId);
  const [emailQuery, setEmailQuery] = useState(urlEmail || user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Auto-search if URL query has order id
  useEffect(() => {
    if (urlId) {
      setOrderQuery(urlId);
      performTrack(urlId, urlEmail || user?.email || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  // Load user's recent orders if authenticated for quick tracking
  useEffect(() => {
    if (user?.email) {
      if (!emailQuery) setEmailQuery(user.email);
      (async () => {
        try {
          const res = await fetch(
            `/api/profile/orders?email=${encodeURIComponent(
              user.email
            )}&user_id=${user.id || ""}`
          );
          const data = await res.json();
          if (res.ok && Array.isArray(data.userOrders)) {
            setRecentOrders(data.userOrders.slice(0, 5));
          }
        } catch {}
      })();
    }
  }, [user]);

  const performTrack = async (idToSearch, emailToSearch) => {
    const q = (idToSearch || orderQuery || "").trim();
    const em = (emailToSearch || emailQuery || "").trim();

    if (!q && !em) {
      setError("Please enter your Order Number or your Email Address.");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const url = `/api/order/track?query=${encodeURIComponent(
        q
      )}&email=${encodeURIComponent(em)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(
          data.error ||
            "Order not found. Please verify your order number or email."
        );
      }

      setTrackingData(data);
    } catch (err) {
      setError(err.message || "Unable to find order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    performTrack();
  };

  const order = trackingData?.order;
  const stages = trackingData?.stages || [];
  const items = Array.isArray(order?.items) ? order.items : [];

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered" || s === "completed") {
      return <Badge colorScheme="green" px={3} py={1} borderRadius="full">Delivered</Badge>;
    }
    if (s === "shipped" || s === "out_for_delivery") {
      return <Badge colorScheme="blue" px={3} py={1} borderRadius="full">Out for Delivery</Badge>;
    }
    if (s === "processing" || s === "paid") {
      return <Badge colorScheme="purple" px={3} py={1} borderRadius="full">Arranging Bouquet</Badge>;
    }
    if (s === "cancelled") {
      return <Badge colorScheme="red" px={3} py={1} borderRadius="full">Cancelled</Badge>;
    }
    return <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">Order Placed</Badge>;
  };

  return (
    <Box minH="100vh" bg="#fffcf2" pb={20}>
      <NavigationBar />

      {/* Header Banner */}
      <Box
        bg="linear-gradient(135deg, #bc0930 0%, #80001f 100%)"
        color="white"
        py={{ base: 10, md: 14 }}
        px={4}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.md" position="relative" zIndex={2} color="white">
          <HStack justify="center" spacing={2} mb={2} color="white">
            <Truck size={24} color="white" />
            <Text fontSize="sm" letterSpacing="2px" textTransform="uppercase" fontWeight="700" color="whiteAlpha.900">
              Real-Time Tracking
            </Text>
          </HStack>
          <Heading
            as="h1"
            size="2xl"
            mb={3}
            color="white"
            fontWeight="700"
          >
            Track Your Order
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} maxW="540px" mx="auto" color="whiteAlpha.900">
            Follow your handcrafted bouquet from our floral workshop all the way to your recipient's doorstep.
          </Text>
        </Container>
      </Box>

      <Container maxW="container.lg" mt={-8} position="relative" zIndex={3}>
        {/* Search Card */}
        <Box
          bg="white"
          borderRadius="20px"
          boxShadow="0 10px 30px rgba(188, 9, 48, 0.08)"
          border="2px solid #F5C7CF"
          p={{ base: 5, md: 8 }}
          mb={8}
        >
          <form onSubmit={handleSearchSubmit}>
            <VStack spacing={4} align="stretch">
              <Grid templateColumns={{ base: "1fr", md: "2fr 2fr auto" }} gap={4} alignItems="end">
                <GridItem>
                  <Text fontSize="xs" fontWeight="700" color="#2B2B2B" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                    Order Number / ID
                  </Text>
                  <Input
                    placeholder="e.g. cs_test_... or DF-10023"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    size="lg"
                    borderRadius="12px"
                    focusBorderColor="#bc0930"
                    bg="#fffcf2"
                  />
                </GridItem>

                <GridItem>
                  <Text fontSize="xs" fontWeight="700" color="#2B2B2B" mb={1} textTransform="uppercase" letterSpacing="0.5px">
                    Customer Email (Optional)
                  </Text>
                  <Input
                    placeholder="customer@example.com"
                    type="email"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    size="lg"
                    borderRadius="12px"
                    focusBorderColor="#bc0930"
                    bg="#fffcf2"
                  />
                </GridItem>

                <GridItem>
                  <Button
                    type="submit"
                    bg="#bc0930"
                    color="white"
                    size="lg"
                    borderRadius="12px"
                    w={{ base: "100%", md: "auto" }}
                    minW="140px"
                    isLoading={loading}
                    leftIcon={<Search size={18} />}
                    _hover={{ bg: "#a10828", transform: "translateY(-1px)", boxShadow: "md" }}
                    transition="all 0.2s"
                  >
                    Track
                  </Button>
                </GridItem>
              </Grid>

              {/* Quick links for logged in users */}
              {recentOrders.length > 0 && (
                <Box pt={2}>
                  <Text fontSize="xs" color="#5B6B73" fontWeight="600" mb={2}>
                    Your Recent Orders:
                  </Text>
                  <HStack spacing={2} flexWrap="wrap" gap={2}>
                    {recentOrders.map((ro) => (
                      <Button
                        key={ro.id}
                        size="xs"
                        variant="outline"
                        borderRadius="full"
                        borderColor="#F5C7CF"
                        color="#bc0930"
                        _hover={{ bg: "#fff8f3", borderColor: "#bc0930" }}
                        onClick={() => {
                          const idVal = ro.order_number || ro.id;
                          setOrderQuery(idVal);
                          performTrack(idVal, ro.customer_email || user?.email);
                        }}
                      >
                        #{ro.order_number?.slice(0, 14) || ro.id.slice(0, 8)} • ₱{Number(ro.total || 0).toFixed(0)}
                      </Button>
                    ))}
                  </HStack>
                </Box>
              )}
            </VStack>
          </form>

          {error && (
            <Alert status="error" mt={4} borderRadius="12px" bg="#fff5f5" color="#c53030">
              <AlertIcon color="#bc0930" />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}
        </Box>

        {/* Loading Spinner */}
        {loading && (
          <Box textAlign="center" py={12}>
            <Spinner size="xl" color="#bc0930" thickness="4px" />
            <Text mt={4} color="#5B6B73" fontWeight="500">
              Retrieving live tracking status...
            </Text>
          </Box>
        )}

        {/* Tracking Details View */}
        {order && !loading && (
          <VStack spacing={8} align="stretch">
            {/* Status & Visual Timeline Card */}
            <Box
              bg="white"
              borderRadius="20px"
              border="2px solid #F5C7CF"
              p={{ base: 6, md: 8 }}
              boxShadow="0 6px 24px rgba(0,0,0,0.04)"
            >
              <HStack justify="space-between" align={{ base: "start", sm: "center" }} flexWrap="wrap" gap={3} mb={6}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="700" color="#5B6B73" textTransform="uppercase" letterSpacing="1px">
                    Order Identification
                  </Text>
                  <Heading size="lg" color="#bc0930" style={{ fontFamily: "var(--font-rothek)" }}>
                    #{order.order_number}
                  </Heading>
                  <Text fontSize="xs" color="#5B6B73">
                    Placed on {new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  {getStatusBadge(order.status)}
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#5B6B73"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={() => performTrack()}
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>

              <Divider borderColor="#F5C7CF" mb={8} />

              {/* Interactive Timeline Stepper */}
              {trackingData.isCancelled ? (
                <Alert status="error" borderRadius="12px" mb={4}>
                  <AlertCircle size={20} />
                  <Box ml={3}>
                    <Text fontWeight="700">Order Cancelled</Text>
                    <Text fontSize="sm">This order was cancelled. If you believe this was in error, please contact our support team.</Text>
                  </Box>
                </Alert>
              ) : (
                <Box mb={4} px={{ base: 2, md: 6 }}>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                    gap={{ base: 6, md: 2 }}
                    position="relative"
                  >
                    {stages.map((stage, idx) => {
                      const isComplete = stage.isCompleted;
                      const isCurrent = stage.isCurrent;

                      return (
                        <VStack
                          key={stage.key}
                          align={{ base: "start", md: "center" }}
                          textAlign={{ base: "left", md: "center" }}
                          position="relative"
                          zIndex={2}
                          spacing={3}
                        >
                          {/* Step Icon Circle */}
                          <Box
                            w="48px"
                            h="48px"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg={isComplete ? "#bc0930" : "#F5C7CF"}
                            color="white"
                            boxShadow={isCurrent ? "0 0 0 4px rgba(188, 9, 48, 0.25)" : "none"}
                            transition="all 0.3s"
                          >
                            {isComplete ? (
                              <CheckCircle size={24} />
                            ) : stage.key === "processing" ? (
                              <Clock size={22} />
                            ) : stage.key === "shipped" ? (
                              <Truck size={22} />
                            ) : (
                              <Package size={22} />
                            )}
                          </Box>

                          <VStack spacing={1}>
                            <Text
                              fontSize="sm"
                              fontWeight={isCurrent ? "800" : isComplete ? "700" : "500"}
                              color={isComplete ? "#bc0930" : "#5B6B73"}
                              fontFamily="var(--font-rothek)"
                            >
                              {stage.title}
                            </Text>
                            <Text fontSize="xs" color="#5B6B73" maxW="180px">
                              {stage.description}
                            </Text>
                          </VStack>
                        </VStack>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* External Courier Tracking Banner if available */}
              {order.tracking_url && (
                <Box mt={6} p={4} bg="#f0f9ff" borderRadius="12px" border="1px solid #bae6fd">
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <HStack spacing={3}>
                      <Truck size={20} color="#0284c7" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="700" color="#0369a1">
                          External Courier Link Available
                        </Text>
                        <Text fontSize="xs" color="#0284c7">
                          Track your delivery live with our courier partner.
                        </Text>
                      </VStack>
                    </HStack>
                    <a href={order.tracking_url} target="_blank" rel="noreferrer">
                      <Button size="sm" colorScheme="blue" rightIcon={<ExternalLink size={14} />}>
                        Open Courier Live Map
                      </Button>
                    </a>
                  </HStack>
                </Box>
              )}
            </Box>

            {/* Two Column Breakdown: Items & Delivery Info */}
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              {/* Left Column: Bouquet Items */}
              <GridItem>
                <Box
                  bg="white"
                  borderRadius="20px"
                  border="2px solid #F5C7CF"
                  p={{ base: 5, md: 7 }}
                >
                  <HStack mb={4}>
                    <Package size={20} color="#bc0930" />
                    <Heading size="md" color="#bc0930" fontFamily="var(--font-rothek)">
                      Items in this Order
                    </Heading>
                  </HStack>
                  <Divider borderColor="#F5C7CF" mb={4} />

                  {items.length === 0 ? (
                    <Text color="#5B6B73" fontSize="sm">
                      Custom flower arrangement.
                    </Text>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="#5B6B73">Product</Th>
                          <Th isNumeric color="#5B6B73">Qty</Th>
                          <Th isNumeric color="#5B6B73">Price</Th>
                          <Th isNumeric color="#5B6B73">Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {items.map((it, idx) => (
                          <Tr key={idx}>
                            <Td py={3}>
                              <HStack spacing={3}>
                                {it.image && (
                                  <Image
                                    src={it.image}
                                    alt={it.title || "Bouquet"}
                                    boxSize="44px"
                                    objectFit="cover"
                                    borderRadius="8px"
                                    border="1px solid #F5C7CF"
                                  />
                                )}
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                                    {it.title || it.flowerType || "Handcrafted Bouquet"}
                                  </Text>
                                  {it.stems && (
                                    <Text fontSize="xs" color="#5B6B73">
                                      {it.stems} stems • {it.color}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Td>
                            <Td isNumeric fontWeight="600">
                              {it.quantity || 1}
                            </Td>
                            <Td isNumeric color="#5B6B73">
                              ₱{Number(it.price || 0).toFixed(2)}
                            </Td>
                            <Td isNumeric fontWeight="700" color="#bc0930">
                              ₱{((it.quantity || 1) * Number(it.price || 0)).toFixed(2)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}

                  <Divider my={4} borderColor="#F5C7CF" />

                  {/* Summary Totals */}
                  <VStack align="stretch" spacing={2} pt={2}>
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="#5B6B73">Subtotal</Text>
                      <Text fontWeight="600">₱{Number(order.total || 0).toFixed(2)}</Text>
                    </HStack>
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="#5B6B73">Standard Floral Delivery</Text>
                      <Text color="#38a169" fontWeight="600">Included</Text>
                    </HStack>
                    <Divider borderColor="#F5C7CF" />
                    <HStack justify="space-between" fontSize="lg" fontWeight="800">
                      <Text color="#2B2B2B">Order Total</Text>
                      <Text color="#bc0930" fontFamily="var(--font-rothek)">
                        ₱{Number(order.total || 0).toFixed(2)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </GridItem>

              {/* Right Column: Recipient & Delivery Information */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  <Box
                    bg="white"
                    borderRadius="20px"
                    border="2px solid #F5C7CF"
                    p={{ base: 5, md: 6 }}
                  >
                    <HStack mb={4}>
                      <MapPin size={20} color="#bc0930" />
                      <Heading size="sm" color="#bc0930" fontFamily="var(--font-rothek)">
                        Delivery Information
                      </Heading>
                    </HStack>
                    <Divider borderColor="#F5C7CF" mb={4} />

                    <VStack align="start" spacing={3} fontSize="sm">
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="#5B6B73" textTransform="uppercase">
                          Recipient
                        </Text>
                        <Text fontWeight="600" color="#2B2B2B">
                          {order.customer_name || "Valued Customer"}
                        </Text>
                        <Text color="#5B6B73">{order.customer_email || "No email on file"}</Text>
                        {order.customer_phone && (
                          <Text color="#5B6B73">{order.customer_phone}</Text>
                        )}
                      </Box>

                      {order.shipping_address && (
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="#5B6B73" textTransform="uppercase">
                            Destination Address
                          </Text>
                          <Text color="#2B2B2B">
                            {typeof order.shipping_address === "string"
                              ? order.shipping_address
                              : [
                                  order.shipping_address.address1,
                                  order.shipping_address.address2,
                                  order.shipping_address.city,
                                  order.shipping_address.state,
                                  order.shipping_address.zip,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                          </Text>
                        </Box>
                      )}

                      {order.notes && (
                        <Box p={3} bg="#fffcf2" borderRadius="8px" border="1px solid #F5C7CF" w="full">
                          <Text fontSize="xs" fontWeight="700" color="#bc0930" textTransform="uppercase" mb={1}>
                            Courier & Florist Notes:
                          </Text>
                          <Text fontSize="xs" color="#2B2B2B">
                            {order.notes}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>

                  {/* Customer Care Contact */}
                  <Box
                    bg="#fff8f3"
                    borderRadius="20px"
                    border="1px solid #F5C7CF"
                    p={5}
                    textAlign="center"
                  >
                    <Phone size={24} color="#bc0930" style={{ margin: "0 auto 8px" }} />
                    <Text fontWeight="700" color="#bc0930" fontSize="sm" mb={1}>
                      Questions About Your Delivery?
                    </Text>
                    <Text fontSize="xs" color="#5B6B73" mb={3}>
                      Our customer care florists are ready to assist with delivery instructions or changes.
                    </Text>
                    <Link href="/contact">
                      <Button size="sm" variant="outline" borderColor="#bc0930" color="#bc0930" _hover={{ bg: "#fff" }} w="full">
                        Contact Florist Team
                      </Button>
                    </Link>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>
        )}
      </Container>
    </Box>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <Box minH="100vh" bg="#fffcf2" p={12} textAlign="center">
          <Spinner size="xl" color="#bc0930" />
        </Box>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
