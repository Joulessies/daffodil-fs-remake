"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Progress,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import Link from "next/link";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#bc0930",
  "#0f8f4d",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function SalesAnalyticsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadOrdersData();
  }, [user, isAdmin, timeRange]);

  const loadOrdersData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.items || []);
    } catch (error) {
      console.error("Failed to load orders data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTimeRange = (orders) => {
    const now = new Date();
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      switch (timeRange) {
        case "7d":
          return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
          return (
            orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          );
        case "90d":
          return (
            orderDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          );
        default:
          return true;
      }
    });
    return filtered;
  };

  const getTimeSeriesData = (orders) => {
    const dataMap = {};
    const now = new Date();

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      let key;

      if (timeRange === "all") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else {
        key = date.toLocaleDateString();
      }

      if (!dataMap[key]) {
        dataMap[key] = { date: key, orders: 0, revenue: 0 };
      }
      dataMap[key].orders += 1;
      dataMap[key].revenue += Number(order.total) || 0;
    });

    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getStatusDistribution = (orders) => {
    const statusCount = {};
    orders.forEach((order) => {
      const status = order.status || "pending";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const filteredOrders = filterOrdersByTimeRange(orders);
  const timeSeriesData = getTimeSeriesData(filteredOrders);
  const statusDistribution = getStatusDistribution(filteredOrders);

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = filteredOrders.filter(
    (o) => o.status === "completed" || o.status === "paid"
  ).length;
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

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
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <Heading
            size="xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            Sales & Revenue Analytics
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Track your sales performance and revenue trends
          </Text>
        </Box>
        <HStack spacing={2}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            w="150px"
            bg="white"
            borderRadius="md"
          >
            <option value="all">All Time</option>
            <option value="90d">Last 90 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </Select>
          <AdminBackButton />
        </HStack>
      </Flex>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#bc093015" color="#bc0930">
              <ShoppingBag size={20} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm" fontWeight="500">
              Total Orders
            </StatLabel>
            <StatNumber
              fontSize="3xl"
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {totalOrders}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs">
              {timeRange === "all"
                ? "All time"
                : `Last ${timeRange.replace("d", "")} days`}
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#0f8f4d15" color="#0f8f4d">
              <DollarSign size={20} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm" fontWeight="500">
              Total Revenue
            </StatLabel>
            <StatNumber
              fontSize="2xl"
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱
              {Number(totalRevenue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs">
              {timeRange === "all"
                ? "All time"
                : `Last ${timeRange.replace("d", "")} days`}
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#3b82f615" color="#3b82f6">
              <TrendingUp size={20} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm" fontWeight="500">
              Avg Order Value
            </StatLabel>
            <StatNumber
              fontSize="2xl"
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱{avgOrderValue.toFixed(2)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs">
              Per transaction
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#8b5cf615" color="#8b5cf6">
              <Activity size={20} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm" fontWeight="500">
              Completion Rate
            </StatLabel>
            <StatNumber
              fontSize="2xl"
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {completionRate.toFixed(1)}%
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs">
              Successfully completed
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Revenue Trend */}
        <Box
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
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
            Revenue Trend
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
              <XAxis dataKey="date" stroke="#5B6B73" fontSize={12} />
              <YAxis stroke="#5B6B73" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #F5C7CF",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f8f4d"
                strokeWidth={2}
                dot={{ fill: "#0f8f4d", r: 4 }}
                name="Revenue (₱)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Orders Status Distribution */}
        <Box
          bg="white"
          p={6}
          borderRadius="16px"
          border="1px solid #F5C7CF"
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
            Orders by Status
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Orders over Time */}
      <Box
        bg="white"
        p={6}
        borderRadius="16px"
        border="1px solid #F5C7CF"
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
          Orders Over Time
        </Heading>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
            <XAxis dataKey="date" stroke="#5B6B73" fontSize={12} />
            <YAxis stroke="#5B6B73" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #F5C7CF",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="orders" fill="#bc0930" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
