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
  Progress,
  HStack,
  Badge,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#bc0930",
  "#0f8f4d",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function CustomerAnalyticsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/orders"),
      ]);

      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      setUsers(usersData.items || []);
      setOrders(ordersData.items || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerStats = () => {
    const customerMap = {};

    orders.forEach((order) => {
      const email = order.customer_email || order.email;
      if (!customerMap[email]) {
        customerMap[email] = {
          email,
          orders: 0,
          revenue: 0,
          lastOrderDate: null,
        };
      }
      customerMap[email].orders += 1;
      customerMap[email].revenue += Number(order.total) || 0;

      const orderDate = new Date(order.created_at);
      if (
        !customerMap[email].lastOrderDate ||
        orderDate > new Date(customerMap[email].lastOrderDate)
      ) {
        customerMap[email].lastOrderDate = order.created_at;
      }
    });

    return Object.values(customerMap).sort((a, b) => b.revenue - a.revenue);
  };

  const customerStats = getCustomerStats();
  const topCustomers = customerStats.slice(0, 10);

  const getCustomerSegments = () => {
    const segments = {
      oneTime: 0,
      repeat: 0,
      frequent: 0,
      vip: 0,
    };

    customerStats.forEach((customer) => {
      if (customer.orders === 1) {
        segments.oneTime += 1;
      } else if (customer.orders >= 2 && customer.orders <= 4) {
        segments.repeat += 1;
      } else if (customer.orders >= 5 && customer.orders < 10) {
        segments.frequent += 1;
      } else {
        segments.vip += 1;
      }
    });

    return [
      { name: "One-Time", value: segments.oneTime },
      { name: "Repeat (2-4)", value: segments.repeat },
      { name: "Frequent (5-9)", value: segments.frequent },
      { name: "VIP (10+)", value: segments.vip },
    ];
  };

  const customerSegments = getCustomerSegments();

  const totalCustomers = users.length;
  const customersWithOrders = customerStats.length;
  const conversionRate =
    totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
  const avgCustomerValue =
    customersWithOrders > 0
      ? customerStats.reduce((sum, c) => sum + c.revenue, 0) /
        customersWithOrders
      : 0;

  const avgOrdersPerCustomer =
    customersWithOrders > 0
      ? customerStats.reduce((sum, c) => sum + c.orders, 0) /
        customersWithOrders
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
            Customer Insights & Analytics
          </Heading>
          <Text color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }}>
            Understand your customer behavior and segments
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
            <Box p={2} borderRadius="8px" bg="#8b5cf615" color="#8b5cf6">
              <Users size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Total Customers
            </StatLabel>
            <StatNumber
              fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {totalCustomers}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Registered users
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
            <Box p={2} borderRadius="8px" bg="#3b82f615" color="#3b82f6">
              <ShoppingBag size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Active Customers
            </StatLabel>
            <StatNumber
              fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {customersWithOrders}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              With orders
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
              Avg Customer Value
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱{avgCustomerValue.toFixed(2)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Lifetime value
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
              Avg Orders/Customer
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {avgOrdersPerCustomer.toFixed(1)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Repeat rate
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Customer Segments */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
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
            Customer Segments
          </Heading>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
              >
                {customerSegments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Top Customers chart */}
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
            Top 10 Customers by Revenue
          </Heading>
          <Box w="100%">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topCustomers}
                layout="horizontal"
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
                <XAxis type="number" stroke="#5B6B73" fontSize={10} />
                <YAxis
                  type="category"
                  dataKey="email"
                  stroke="#5B6B73"
                  fontSize={8}
                  width={85}
                  tick={{ fontSize: 8 }}
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
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₱)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Customer Performance Table / Mobile Cards */}
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
          Top Customers
        </Heading>

        {/* Mobile Customer Cards (< md) */}
        <Box display={{ base: "block", md: "none" }}>
          {topCustomers.map((customer, index) => (
            <Box
              key={customer.email}
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
                  <Text fontWeight="600" fontSize="xs" color="#bc0930" noOfLines={1}>
                    {customer.email}
                  </Text>
                </Flex>
                <Text fontWeight="700" fontSize="sm" color="#0f8f4d">
                  ₱{customer.revenue.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between" fontSize="xs" color="#5B6B73" pt={1.5} borderTop="1px dashed #f5c7cf">
                <Text>Orders: <Text as="span" fontWeight="600" color="gray.700">{customer.orders}</Text></Text>
                <Text>Avg Value: <Text as="span" fontWeight="600" color="gray.700">₱{(customer.revenue / Math.max(1, customer.orders)).toFixed(2)}</Text></Text>
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
                  Rank
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Customer Email
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
                    textAlign: "right",
                    padding: "12px",
                    color: "#5B6B73",
                  }}
                >
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr
                  key={customer.email}
                  style={{
                    borderBottom: "1px solid #F5C7CF",
                  }}
                >
                  <td style={{ padding: "12px" }}>
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
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Text fontWeight="500" color="#bc0930">
                      {customer.email}
                    </Text>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      color: "#5B6B73",
                    }}
                  >
                    {customer.orders}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px" }}>
                    <Text fontWeight="600" color="#0f8f4d">
                      ₱{customer.revenue.toFixed(2)}
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
