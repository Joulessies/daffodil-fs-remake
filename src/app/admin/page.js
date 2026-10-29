"use client";

import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Icon,
  Divider,
  Progress,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import Link from "next/link";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Smartphone,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: IconComponent,
  color,
  helpText,
  trend,
  href,
}) => {
  const content = (
    <Box
      as={motion.div}
      whileHover={{ y: -4, boxShadow: "xl" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      bg="white"
      p={{ base: 4, md: 6 }}
      borderRadius="16px"
      border="1px solid"
      borderColor="#F5C7CF"
      position="relative"
      overflow="hidden"
      cursor={href ? "pointer" : "default"}
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        opacity={0.1}
        transform="rotate(-15deg)"
      >
        <IconComponent size={120} color={color} />
      </Box>
      <HStack justify="space-between" mb={2}>
        <Box p={3} borderRadius="12px" bg={`${color}15`} color={color}>
          <IconComponent size={24} />
        </Box>
        {trend && (
          <Badge colorScheme={trend > 0 ? "green" : "red"} fontSize="xs">
            {trend > 0 ? "+" : ""}
            {trend}%
          </Badge>
        )}
      </HStack>
      <Stat>
        <StatLabel color="#5B6B73" fontSize="sm" fontWeight="500">
          {title}
        </StatLabel>
        <StatNumber
          fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
          wordBreak="break-word"
        >
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText color="#8A9AA3" fontSize="xs">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadDashboardData();
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const ordersRes = await fetch("/api/admin/orders");
      const ordersData = await ordersRes.json();
      const orders = ordersData.items || [];

      const productsRes = await fetch("/api/admin/products?pageSize=100");
      const productsData = await productsRes.json();
      const products = productsData.items || [];

      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      const users = usersData.items || [];

      const totalRevenue = orders.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0,
      );
      const lowStockItems = products.filter(
        (p) => (p.stock || 0) <= 5 && p.status === "active",
      );
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "processing",
      );

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        lowStock: lowStockItems.length,
        pendingOrders: pendingOrders.length,
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(lowStockItems.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) {
        setLoginError(error.message);
      }
    } catch (err) {
      setLoginError(err?.message || "Failed to sign in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <Box p={6} minH="100vh" bg="#FFF8F3">
        <Progress size="xs" isIndeterminate colorScheme="red" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box minH="85vh" bg="#FFF8F3" py={12} px={4} display="flex" alignItems="center" justifyContent="center">
        <Box maxW="480px" w="100%" bg="white" p={8} borderRadius="20px" border="1px solid" borderColor="#F5C7CF" shadow="lg">
          <VStack spacing={5} align="stretch">
            <Box textAlign="center">
              <Badge colorScheme="red" bg="#bc093018" color="#bc0930" px={3} py={1} borderRadius="full" fontWeight="700" fontSize="xs" mb={3}>
                COMPANY / ADMIN PORTAL
              </Badge>
              <Heading size="lg" color="#bc0930" style={{ fontFamily: "var(--font-rothek)" }}>
                Web and Mobile
              </Heading>
              <Text color="#5B6B73" fontSize="sm" mt={1}>
                Sign in to manage studio operations, orders, and catalog
              </Text>
            </Box>

            <Box bg="#FFF8F3" p={3.5} borderRadius="12px" border="1px solid #F5C7CF">
              <VStack spacing={2} align="start" fontSize="xs">
                <HStack spacing={2}>
                  <Badge colorScheme="blue" fontSize="2xs">LOCAL HOST</Badge>
                  <Text color="#4A5568" fontWeight="600">Presented through localhost:3000 (Production domain expired)</Text>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme="purple" fontSize="2xs">ROLE SEPARATION</Badge>
                  <Text color="#742A2A" fontWeight="600">Web: Company & Admin Only | Customer: Mobile App (APK)</Text>
                </HStack>
              </VStack>
            </Box>

            {loginError && (
              <Alert status="error" borderRadius="8px" fontSize="sm">
                <AlertIcon />
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleAdminLogin}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" color="#5B6B73">
                    Company Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@company.com"
                    bg="#FAFAFA"
                    borderColor="#F5C7CF"
                    _focus={{ borderColor: "#bc0930", boxShadow: "0 0 0 1px #bc0930" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" color="#5B6B73">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    bg="#FAFAFA"
                    borderColor="#F5C7CF"
                    _focus={{ borderColor: "#bc0930", boxShadow: "0 0 0 1px #bc0930" }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  bg="#bc0930"
                  color="white"
                  _hover={{ bg: "#9c0728" }}
                  isLoading={isLoggingIn}
                  w="100%"
                  mt={2}
                  size="md"
                  fontWeight="600"
                >
                  Sign In as Company Admin
                </Button>
              </VStack>
            </form>

            <Divider borderColor="#F5C7CF" />

            <Box bg="#F7FAFC" p={3.5} borderRadius="12px" border="1px dashed #CBD5E0">
              <HStack spacing={2} align="start">
                <Icon as={Smartphone} color="#bc0930" mt={0.5} boxSize={4} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" fontWeight="700" color="#2D3748">
                    Customer Shopping (APK)
                  </Text>
                  <Text fontSize="xs" color="#718096" lineHeight="shorter">
                    Customer arrangements, cart, and orders are available exclusively on the Mobile App (APK).
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (user && !isAdmin) {
    return (
      <Box minH="85vh" bg="#FFF8F3" py={12} px={4} display="flex" alignItems="center" justifyContent="center">
        <Box maxW="480px" w="100%" bg="white" p={8} borderRadius="20px" border="1px solid" borderColor="#F5C7CF" shadow="lg" textAlign="center">
          <Badge colorScheme="yellow" mb={3} px={3} py={1} borderRadius="full" fontSize="xs">
            ACCESS RESTRICTED
          </Badge>
          <Heading size="md" color="#bc0930" mb={2}>
            Company Account Required
          </Heading>
          <Text fontSize="sm" color="#5B6B73" mb={4}>
            Signed in as <strong>{user.email}</strong>. This account does not have Company Administrator privileges.
          </Text>
          <Text fontSize="xs" color="#718096" mb={6}>
            Web is for company and administrative management only. Customers use the Mobile App (APK).
          </Text>
          <Button
            onClick={() => supabase.auth.signOut()}
            colorScheme="red"
            variant="outline"
            size="sm"
            w="100%"
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "processing":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 3, sm: 4, md: 6 }}>
      {/* Header */}
      <Flex
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 3, sm: 4 }}
        justify="space-between"
        mb={6}
      >
        <Box>
          <Heading
            size={{ base: "lg", md: "xl" }}
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            Admin Dashboard
          </Heading>
          <Text color="#5B6B73" fontSize="sm" wordBreak="break-word">
            Welcome back, {user.email}
          </Text>
        </Box>
        <Flex gap={2} flexWrap="wrap">
          <Button
            leftIcon={<Clock size={16} />}
            size="sm"
            variant="outline"
            borderColor="#F5C7CF"
            color="#bc0930"
            _hover={{ bg: "#FFF8F3" }}
            onClick={loadDashboardData}
            isLoading={loading}
          >
            Refresh
          </Button>
          <AdminBackButton />
        </Flex>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={{ base: 3, md: 4 }} mb={8}>
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="#bc0930"
          helpText="All time"
          href="/admin/analytics/sales"
        />
        <StatCard
          title="Total Revenue"
          value={`₱${Number(stats.totalRevenue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          color="#0f8f4d"
          helpText="All time"
          href="/admin/analytics/sales"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          color="#3b82f6"
          helpText="In catalog"
          href="/admin/analytics/products"
        />
        <StatCard
          title="Customers"
          value={stats.totalUsers}
          icon={Users}
          color="#8b5cf6"
          helpText="Registered"
          href="/admin/analytics/customers"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="#f59e0b"
          helpText="≤ 5 items"
          href="/admin/inventory"
        />
        <StatCard
          title="Pending"
          value={stats.pendingOrders}
          icon={Clock}
          color="#ef4444"
          helpText="Orders"
          href="/admin/orders"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={8}>
        {/* Recent Orders */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="16px"
            border="1px solid #F5C7CF"
            p={{ base: 4, md: 6 }}
            as={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading
                size="md"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Recent Orders
              </Heading>
              <Link href="/admin/orders">
                <Button size="sm" variant="ghost" colorScheme="red">
                  View All →
                </Button>
              </Link>
            </Flex>
            <Divider mb={4} borderColor="#F5C7CF" />
            {recentOrders.length === 0 ? (
              <Text color="#5B6B73" textAlign="center" py={8}>
                No orders yet
              </Text>
            ) : (
              <>
                {/* Mobile Card View */}
                <VStack
                  spacing={3}
                  align="stretch"
                  display={{ base: "flex", md: "none" }}
                >
                  {recentOrders.map((order) => (
                    <Box
                      key={order.id}
                      p={3.5}
                      bg="#FFF8F3"
                      borderRadius="12px"
                      border="1px solid #F5C7CF"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="700" fontSize="sm" color="#bc0930">
                          {order.order_number}
                        </Text>
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          {order.status}
                        </Badge>
                      </Flex>
                      <Flex
                        justify="space-between"
                        align="center"
                        fontSize="xs"
                        color="#5B6B73"
                        mb={2.5}
                      >
                        <Text>
                          {new Date(order.created_at).toLocaleDateString()}
                        </Text>
                        <Text fontWeight="700" fontSize="sm" color="#bc0930">
                          ₱{Number(order.total || 0).toFixed(2)}
                        </Text>
                      </Flex>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          size="xs"
                          variant="outline"
                          w="full"
                          colorScheme="red"
                          borderColor="#F5C7CF"
                        >
                          View Order Details
                        </Button>
                      </Link>
                    </Box>
                  ))}
                </VStack>

                {/* Desktop Table View */}
                <Box
                  display={{ base: "none", md: "block" }}
                  overflowX="auto"
                >
                  <Table variant="simple" size="sm" minW="560px">
                    <Thead>
                      <Tr>
                        <Th>Order #</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th isNumeric>Total</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentOrders.map((order) => (
                        <Tr key={order.id} _hover={{ bg: "#FFF8F3" }}>
                          <Td fontWeight="500">{order.order_number}</Td>
                          <Td color="#5B6B73" fontSize="xs">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(order.status)}
                              fontSize="xs"
                            >
                              {order.status}
                            </Badge>
                          </Td>
                          <Td isNumeric fontWeight="600" color="#bc0930">
                            ₱{Number(order.total || 0).toFixed(2)}
                          </Td>
                          <Td>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button size="xs" variant="outline">
                                View
                              </Button>
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </>
            )}
          </Box>
        </GridItem>

        {/* Low Stock Alert */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="16px"
            border="1px solid #F5C7CF"
            p={{ base: 4, md: 6 }}
            as={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <HStack>
                <Icon as={AlertTriangle} color="#f59e0b" />
                <Heading
                  size="md"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Low Stock
                </Heading>
              </HStack>
              <Link href="/admin/inventory">
                <Button size="sm" variant="ghost" colorScheme="red">
                  View All →
                </Button>
              </Link>
            </Flex>
            <Divider mb={4} borderColor="#F5C7CF" />
            {lowStockProducts.length === 0 ? (
              <VStack py={8} spacing={2}>
                <Icon as={CheckCircle} boxSize={10} color="#0f8f4d" />
                <Text color="#5B6B73" textAlign="center" fontSize="sm">
                  All products have sufficient stock
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                <HStack justify="flex-end">
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="green"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/admin/products/restock", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ threshold: 5, target: 10 }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Failed");
                        await loadDashboardData();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Restock to 10
                  </Button>
                </HStack>
                {lowStockProducts.map((product) => (
                  <Box
                    key={product.id}
                    p={3}
                    bg="#FFF8F3"
                    borderRadius="8px"
                    border="1px solid #F5C7CF"
                  >
                    <Flex justify="space-between" align="start" mb={2} gap={2}>
                      <Text fontSize="sm" fontWeight="500" flex={1} minW={0} noOfLines={2}>
                        {product.title}
                      </Text>
                      <Badge
                        colorScheme={product.stock === 0 ? "red" : "orange"}
                        fontSize="xs"
                        flexShrink={0}
                        alignSelf="flex-start"
                      >
                        {product.stock} left
                      </Badge>
                    </Flex>
                    <Progress
                      value={(product.stock / 10) * 100}
                      size="xs"
                      colorScheme={product.stock <= 2 ? "red" : "orange"}
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* Quick Actions */}
      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid #F5C7CF"
        p={{ base: 4, md: 6 }}
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Heading
          size="md"
          mb={4}
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Quick Actions
        </Heading>
        <Divider mb={4} borderColor="#F5C7CF" />
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 8 }} spacing={{ base: 2.5, sm: 3, md: 4 }}>
          <Link href="/admin/products">
            <Button
              w="full"
              size="sm"
              leftIcon={<Package size={16} />}
              colorScheme="red"
              bg="#bc0930"
              _hover={{ bg: "#a10828" }}
              fontSize="xs"
            >
              Products
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              w="full"
              size="sm"
              leftIcon={<ShoppingBag size={16} />}
              variant="outline"
              colorScheme="red"
              borderColor="#F5C7CF"
              fontSize="xs"
            >
              Orders
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              w="full"
              size="sm"
              leftIcon={<Users size={16} />}
              variant="outline"
              colorScheme="red"
              borderColor="#F5C7CF"
              fontSize="xs"
            >
              Users
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button
              w="full"
              size="sm"
              leftIcon={<Package size={16} />}
              variant="outline"
              colorScheme="red"
              borderColor="#F5C7CF"
              fontSize="xs"
            >
              Inventory
            </Button>
          </Link>
          <Link href="/admin/reviews">
            <Button
              w="full"
              size="sm"
              leftIcon={<MessageSquare size={16} />}
              variant="outline"
              colorScheme="red"
              borderColor="#F5C7CF"
              fontSize="xs"
            >
              Reviews
            </Button>
          </Link>
          <Link href="/admin/cms">
            <Button
              w="full"
              size="sm"
              leftIcon={<FileText size={16} />}
              variant="outline"
              colorScheme="red"
              borderColor="#F5C7CF"
              fontSize="xs"
            >
              CMS
            </Button>
          </Link>
          <Link href="/shop" target="_blank">
            <Button
              w="full"
              size="sm"
              leftIcon={<TrendingUp size={16} />}
              variant="outline"
              colorScheme="green"
              fontSize="xs"
            >
              Visit Shop
            </Button>
          </Link>
          <Button
            w="full"
            size="sm"
            leftIcon={<Clock size={16} />}
            variant="outline"
            borderColor="#F5C7CF"
            onClick={loadDashboardData}
            isLoading={loading}
            fontSize="xs"
          >
            Refresh
          </Button>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
