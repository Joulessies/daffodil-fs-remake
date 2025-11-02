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
  Badge,
  VStack,
  Spinner,
  Center,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  Package,
  Calendar,
  Truck,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [fixingOrders, setFixingOrders] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.email) {
          if (mounted) {
            setOrders([]);
            setLoading(false);
          }
          return;
        }

        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;

        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_number, total, status, created_at, tracking_url, customer_email"
          )
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted) {
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.email]);

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

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFixOrders = async () => {
    if (!user?.email) return;

    setFixingOrders(true);
    try {
      const response = await fetch("/api/profile/orders/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          orderNumber: "", // Will match any order
          customerName:
            user.user_metadata?.full_name || user.user_metadata?.name,
        }),
      });

      const result = await response.json();
      console.log("Fix result:", result);

      // Reload orders after fixing
      window.location.reload();
    } catch (error) {
      console.error("Error fixing orders:", error);
    } finally {
      setFixingOrders(false);
    }
  };

  const handleRunDiagnostics = async () => {
    if (!user?.email) return;

    setRunningDiagnostics(true);
    try {
      const response = await fetch(
        `/api/profile/orders/diagnose?email=${encodeURIComponent(user.email)}`
      );
      const result = await response.json();
      setDiagnostics(result);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDiagnostics({ error: error.message });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Box minH="100vh" bg="#fffcf2" p={{ base: 4, md: 6 }}>
        <Box maxW={1100} mx="auto">
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <Heading
                size="xl"
                color="#bc0930"
                mb={2}
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Order History & Tracking
              </Heading>
              <Text color="#5B6B73" fontSize="md">
                View your past orders, track shipments, and manage your
                purchases
              </Text>
            </Box>

            {/* Orders List */}
            {authLoading || loading ? (
              <Center py={12}>
                <VStack spacing={4}>
                  <Spinner size="lg" color="#bc0930" />
                  <Text color="#5B6B73">
                    {authLoading ? "Loading..." : "Loading your orders..."}
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
                  Please log in to view your orders
                </Text>
                <Text color="#5B6B73" mb={6}>
                  You need to be logged in to see your order history
                </Text>
              </Box>
            ) : orders.length === 0 ? (
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
                  No orders yet
                </Text>
                <Text color="#5B6B73" mb={6}>
                  Start shopping to see your order history here
                </Text>
                <Link href="/shop">
                  <Button
                    colorScheme="red"
                    bg="#bc0930"
                    _hover={{ bg: "#a10828" }}
                    size="lg"
                    leftIcon={<Package size={20} />}
                  >
                    Start Shopping
                  </Button>
                </Link>
              </Box>
            ) : (
              <Stack spacing={4}>
                {currentOrders.map((order) => (
                  <Box
                    key={order.id}
                    border="1px solid #F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    _hover={{
                      boxShadow: "0 4px 12px rgba(188, 9, 48, 0.1)",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" mb={4}>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={1} align="center">
                          <Package size={16} color="#bc0930" />
                          <Text fontWeight="600" fontSize="lg">
                            Order #{order.order_number}
                          </Text>
                        </HStack>
                        <HStack spacing={4} color="#5B6B73" fontSize="sm">
                          <HStack spacing={1} align="center">
                            <Calendar size={14} />
                            <Text>
                              {new Date(order.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <Text fontWeight="600">
                            ₱{Number(order.total || 0).toFixed(2)}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(order.status)}
                        fontSize="md"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {order.status || "Paid"}
                      </Badge>
                    </HStack>

                    <Divider borderColor="#F5C7CF" mb={4} />

                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Link href={`/profile/orders/${order.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye size={14} />}
                            borderColor="#bc0930"
                            color="#bc0930"
                            _hover={{
                              bg: "#fff8f3",
                              borderColor: "#a10828",
                            }}
                          >
                            View Details
                          </Button>
                        </Link>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<Truck size={14} />}
                            >
                              Track Package
                            </Button>
                          </a>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="#5B6B73">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Pagination Controls */}
            {orders.length > ordersPerPage && (
              <Box
                border="1px solid #F5C7CF"
                borderRadius="16px"
                bg="white"
                p={4}
                mt={6}
              >
                <Flex justify="space-between" align="center">
                  <Text color="#5B6B73" fontSize="sm">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, orders.length)} of {orders.length}{" "}
                    orders
                  </Text>

                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Previous page"
                      icon={<ChevronLeft size={16} />}
                      size="sm"
                      variant="outline"
                      borderColor="#bc0930"
                      color="#bc0930"
                      _hover={{
                        bg: "#fff8f3",
                        borderColor: "#a10828",
                      }}
                      isDisabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={page === currentPage ? "solid" : "outline"}
                          colorScheme={page === currentPage ? "red" : "gray"}
                          bg={page === currentPage ? "#bc0930" : "transparent"}
                          color={page === currentPage ? "white" : "#5B6B73"}
                          borderColor={
                            page === currentPage ? "#bc0930" : "#F5C7CF"
                          }
                          _hover={{
                            bg: page === currentPage ? "#a10828" : "#fff8f3",
                            borderColor:
                              page === currentPage ? "#a10828" : "#bc0930",
                          }}
                          onClick={() => handlePageChange(page)}
                          minW="40px"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <IconButton
                      aria-label="Next page"
                      icon={<ChevronRight size={16} />}
                      size="sm"
                      variant="outline"
                      borderColor="#bc0930"
                      color="#bc0930"
                      _hover={{
                        bg: "#fff8f3",
                        borderColor: "#a10828",
                      }}
                      isDisabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </HStack>
                </Flex>
              </Box>
            )}

            {/* Fix Orders Button */}
            {user && orders.length === 0 && (
              <Box
                border="1px solid #F5C7CF"
                borderRadius="16px"
                bg="white"
                p={4}
                mt={6}
                textAlign="center"
              >
                <Text fontSize="sm" fontWeight="600" color="#bc0930" mb={2}>
                  Can't find your orders?
                </Text>
                <Text fontSize="xs" color="#5B6B73" mb={4}>
                  If you've made purchases but don't see them here, try these
                  solutions:
                </Text>
                <HStack spacing={3} justify="center">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    isLoading={fixingOrders}
                    onClick={handleFixOrders}
                  >
                    Fix Existing Orders
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="gray"
                    isLoading={runningDiagnostics}
                    onClick={handleRunDiagnostics}
                  >
                    Run Diagnostics
                  </Button>
                </HStack>
              </Box>
            )}

            {/* Diagnostics Results */}
            {diagnostics && (
              <Box
                border="1px solid #F5C7CF"
                borderRadius="16px"
                bg="white"
                p={4}
                mt={6}
              >
                <Text fontSize="sm" fontWeight="600" color="#bc0930" mb={3}>
                  Diagnostic Results
                </Text>

                {diagnostics.error && (
                  <Text fontSize="xs" color="red" mb={2}>
                    Error: {diagnostics.error}
                  </Text>
                )}

                {diagnostics.solution && (
                  <Text fontSize="xs" color="orange" mb={3}>
                    Solution: {diagnostics.solution}
                  </Text>
                )}

                <VStack align="start" spacing={2}>
                  <Text fontSize="xs" color="#5B6B73">
                    Email: {diagnostics.email}
                  </Text>

                  <Text fontSize="xs" color="#5B6B73">
                    Environment Variables:
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Supabase URL:{" "}
                    {diagnostics.environment?.hasSupabaseUrl
                      ? "✅ Present"
                      : "❌ Missing"}
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Service Role:{" "}
                    {diagnostics.environment?.hasServiceRole
                      ? "✅ Present"
                      : "❌ Missing"}
                  </Text>

                  <Text fontSize="xs" color="#5B6B73">
                    Database Status:
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Connection:{" "}
                    {diagnostics.database?.connectionTest
                      ? "✅ Connected"
                      : "❌ Failed"}
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Orders Table:{" "}
                    {diagnostics.database?.tableExists
                      ? "✅ Exists"
                      : "❌ Missing"}
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Total Orders: {diagnostics.database?.ordersCount || 0}
                  </Text>
                  <Text fontSize="xs" color="#5B6B73" ml={2}>
                    • Your Orders: {diagnostics.database?.userOrdersCount || 0}
                  </Text>

                  {diagnostics.database?.error && (
                    <Text fontSize="xs" color="red" ml={2}>
                      Database Error: {diagnostics.database.error}
                    </Text>
                  )}

                  {diagnostics.recentOrders &&
                    diagnostics.recentOrders.length > 0 && (
                      <Box mt={2}>
                        <Text fontSize="xs" color="#5B6B73" mb={1}>
                          Recent Orders in Database:
                        </Text>
                        {diagnostics.recentOrders.map((order, idx) => (
                          <Text key={idx} fontSize="xs" color="#5B6B73" ml={2}>
                            • {order.order_number} - {order.customer_email} -{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        ))}
                      </Box>
                    )}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>
    </>
  );
}
