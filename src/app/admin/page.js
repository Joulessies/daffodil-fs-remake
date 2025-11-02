"use client";

import { useAuth } from "@/components/AuthProvider";
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
      p={6}
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
          fontSize="3xl"
          fontWeight="bold"
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
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

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadDashboardData();
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load orders
      const ordersRes = await fetch("/api/admin/orders");
      const ordersData = await ordersRes.json();
      const orders = ordersData.items || [];

      // Load products
      const productsRes = await fetch("/api/admin/products?pageSize=100");
      const productsData = await productsRes.json();
      const products = productsData.items || [];

      // Load users
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      const users = usersData.items || [];

      // Calculate statistics
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0
      );
      const lowStockItems = products.filter(
        (p) => (p.stock || 0) <= 5 && p.status === "active"
      );
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      );

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        lowStock: lowStockItems.length,
        pendingOrders: pendingOrders.length,
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

      // Get low stock products
      setLowStockProducts(lowStockItems.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box p={6} minH="100vh" bg="#FFF8F3">
        <Progress size="xs" isIndeterminate colorScheme="red" />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return null;
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
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <Heading
            size="xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            Admin Dashboard
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Welcome back, {user.email}
          </Text>
        </Box>
        <Flex gap={2}>
          <Button
            leftIcon={<Clock size={16} />}
            size="sm"
            variant="outline"
            onClick={loadDashboardData}
            isLoading={loading}
          >
            Refresh
          </Button>
          <AdminBackButton />
          <Link href="/">
            <Button size="sm" variant="outline" colorScheme="red">
              Home
            </Button>
          </Link>
        </Flex>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing={4} mb={8}>
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
          value={`₱${stats.totalRevenue.toFixed(2)}`}
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
            p={6}
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
              <Table variant="simple" size="sm">
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
            )}
          </Box>
        </GridItem>

        {/* Low Stock Alert */}
        <GridItem>
          <Box
            bg="white"
            borderRadius="16px"
            border="1px solid #F5C7CF"
            p={6}
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
                    <Flex justify="space-between" align="start" mb={2}>
                      <Text fontSize="sm" fontWeight="500" flex={1}>
                        {product.title}
                      </Text>
                      <Badge
                        colorScheme={product.stock === 0 ? "red" : "orange"}
                        fontSize="xs"
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
        p={6}
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
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing={4}>
          <Link href="/admin/products">
            <Button
              w="full"
              leftIcon={<Package size={18} />}
              colorScheme="red"
              bg="#bc0930"
              _hover={{ bg: "#a10828" }}
            >
              Products
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              w="full"
              leftIcon={<ShoppingBag size={18} />}
              variant="outline"
              colorScheme="red"
            >
              Orders
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              w="full"
              leftIcon={<Users size={18} />}
              variant="outline"
              colorScheme="red"
            >
              Users
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button
              w="full"
              leftIcon={<Package size={18} />}
              variant="outline"
              colorScheme="red"
            >
              Inventory
            </Button>
          </Link>
          <Link href="/admin/reviews">
            <Button
              w="full"
              leftIcon={<MessageSquare size={18} />}
              variant="outline"
              colorScheme="red"
            >
              Reviews
            </Button>
          </Link>
          <Link href="/admin/cms">
            <Button
              w="full"
              leftIcon={<FileText size={18} />}
              variant="outline"
              colorScheme="red"
            >
              CMS
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              w="full"
              leftIcon={<TrendingUp size={18} />}
              variant="outline"
              colorScheme="green"
            >
              Visit Shop
            </Button>
          </Link>
          <Button
            w="full"
            leftIcon={<Clock size={16} />}
            variant="outline"
            onClick={loadDashboardData}
            isLoading={loading}
          >
            Refresh Data
          </Button>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
