"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Progress,
  HStack,
  Badge,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProductAnalyticsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/products?pageSize=100"),
        fetch("/api/admin/orders"),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setProducts(productsData.items || []);
      setOrders(ordersData.items || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductPerformance = () => {
    const productSales = {};

    orders.forEach((order) => {
      const items = order.items || [];
      items.forEach((item) => {
        const productId = item.product_id || item.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            name: item.title || item.name || "Unknown",
            sales: 0,
            revenue: 0,
            quantity: 0,
          };
        }
        productSales[productId].sales += 1;
        productSales[productId].revenue +=
          Number(item.price) * Number(item.quantity);
        productSales[productId].quantity += Number(item.quantity);
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const productPerformance = getProductPerformance();

  const activeProducts = products.filter((p) => p.status === "active").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "inactive"
  ).length;
  const lowStockProducts = products.filter(
    (p) => (p.stock || 0) <= 5 && p.status === "active"
  ).length;

  const totalStockValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
    0
  );

  const avgProductPrice =
    products.length > 0
      ? products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) /
        products.length
      : 0;

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

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 3, sm: 4, md: 6 }}>
      <Flex
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 3, sm: 0 }}
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
            Product Performance Analytics
          </Heading>
          <Text color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }}>
            Track product sales and inventory metrics
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 2.5, sm: 4 }} mb={{ base: 6, md: 8 }}>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={{ base: 3, sm: 5 }}
          borderRadius={{ base: "12px", md: "16px" }}
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#3b82f615" color="#3b82f6">
              <Package size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Active Products
            </StatLabel>
            <StatNumber
              fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {activeProducts}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              In catalog
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={{ base: 3, sm: 5 }}
          borderRadius={{ base: "12px", md: "16px" }}
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#f59e0b15" color="#f59e0b">
              <TrendingUp size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Low Stock Items
            </StatLabel>
            <StatNumber
              fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {lowStockProducts}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              ≤ 5 units remaining
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={{ base: 3, sm: 5 }}
          borderRadius={{ base: "12px", md: "16px" }}
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#0f8f4d15" color="#0f8f4d">
              <DollarSign size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Avg Product Price
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱{avgProductPrice.toFixed(2)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Across all products
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={{ base: 3, sm: 5 }}
          borderRadius={{ base: "12px", md: "16px" }}
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#8b5cf615" color="#8b5cf6">
              <Package size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Total Stock Value
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱{totalStockValue.toFixed(2)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Inventory value
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Top Selling Products */}
      <Box
        bg="white"
        p={{ base: 3, sm: 4, md: 6 }}
        borderRadius={{ base: "12px", md: "16px" }}
        border="1px solid #F5C7CF"
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        mb={{ base: 6, md: 8 }}
      >
        <Heading
          size="sm"
          mb={4}
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Top Selling Products by Revenue
        </Heading>
        <Box w="100%">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={productPerformance}
              layout="horizontal"
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
              <XAxis type="number" stroke="#5B6B73" fontSize={10} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#5B6B73"
                fontSize={9}
                width={85}
                tick={{ fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #F5C7CF",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value) => `₱${Number(value).toFixed(2)}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#bc0930" name="Revenue (₱)" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Product Performance Table / Mobile Cards */}
      <Box
        bg="white"
        p={{ base: 3, sm: 4, md: 6 }}
        borderRadius={{ base: "12px", md: "16px" }}
        border="1px solid #F5C7CF"
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Heading
          size="sm"
          mb={4}
          color="#bc0930"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Top 10 Best Performing Products
        </Heading>

        {/* Mobile Product Cards (< md) */}
        <Box display={{ base: "block", md: "none" }}>
          {productPerformance.map((product, index) => (
            <Box
              key={product.productId}
              p={3}
              mb={2.5}
              bg="#fffcf2"
              borderRadius="10px"
              border="1px solid #f8e1e7"
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Flex align="center" gap={2} flex="1">
                  <Badge
                    colorScheme={
                      index === 0
                        ? "yellow"
                        : index === 1
                        ? "gray"
                        : index === 2
                        ? "orange"
                        : "blue"
                    }
                    fontSize="xs"
                  >
                    #{index + 1}
                  </Badge>
                  <Text fontWeight="600" fontSize="sm" color="#bc0930" noOfLines={1}>
                    {product.name}
                  </Text>
                </Flex>
                <Text fontWeight="700" fontSize="sm" color="#0f8f4d">
                  ₱{product.revenue.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between" fontSize="xs" color="#5B6B73" pt={1.5} borderTop="1px dashed #f5c7cf">
                <Text>Orders: <Text as="span" fontWeight="600" color="gray.700">{product.sales}</Text></Text>
                <Text>Quantity Sold: <Text as="span" fontWeight="600" color="gray.700">{product.quantity}</Text></Text>
              </Flex>
            </Box>
          ))}
        </Box>

        {/* Desktop Table (>= md) */}
        <Box overflowX="auto" display={{ base: "none", md: "block" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F5C7CF" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Product
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Orders
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Quantity Sold
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, index) => (
                <tr
                  key={product.productId}
                  style={{
                    borderBottom: "1px solid #F5C7CF",
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    <Flex align="center">
                      <Badge
                        colorScheme={
                          index === 0
                            ? "yellow"
                            : index === 1
                            ? "gray"
                            : index === 2
                            ? "orange"
                            : "blue"
                        }
                        mr={2}
                        fontSize="xs"
                      >
                        #{index + 1}
                      </Badge>
                      <Text fontWeight="500" color="#bc0930">
                        {product.name}
                      </Text>
                    </Flex>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      color: "#5B6B73",
                    }}
                  >
                    {product.sales}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      color: "#5B6B73",
                    }}
                  >
                    {product.quantity}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px" }}>
                    <Text fontWeight="600" color="#0f8f4d">
                      ₱{product.revenue.toFixed(2)}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}
