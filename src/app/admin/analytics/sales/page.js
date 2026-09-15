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
            Sales & Revenue Analytics
          </Heading>
          <Text color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }}>
            Track your sales performance and revenue trends
          </Text>
        </Box>
        <Flex gap={2} flexWrap="wrap" align="center">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            w={{ base: "100%", sm: "150px" }}
            bg="white"
            borderRadius="md"
            size="sm"
          >
            <option value="all">All Time</option>
            <option value="90d">Last 90 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </Select>
          <AdminBackButton />
        </Flex>
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
            <Box p={2} borderRadius="8px" bg="#bc093015" color="#bc0930">
              <ShoppingBag size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Total Orders
            </StatLabel>
            <StatNumber
              fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {totalOrders}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
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
              Total Revenue
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
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
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
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
          p={{ base: 3, sm: 5 }}
          borderRadius={{ base: "12px", md: "16px" }}
          border="1px solid #F5C7CF"
        >
          <HStack mb={2}>
            <Box p={2} borderRadius="8px" bg="#3b82f615" color="#3b82f6">
              <TrendingUp size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Avg Order Value
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              ₱{avgOrderValue.toFixed(2)}
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Per transaction
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
              <Activity size={18} />
            </Box>
          </HStack>
          <Stat>
            <StatLabel color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }} fontWeight="500">
              Completion Rate
            </StatLabel>
            <StatNumber
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              {completionRate.toFixed(1)}%
            </StatNumber>
            <StatHelpText color="#8A9AA3" fontSize="xs" mb={0}>
              Successfully completed
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
        {/* Revenue Trend */}
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
            Revenue Trend
          </Heading>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeSeriesData} margin={{ left: -15, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
              <XAxis dataKey="date" stroke="#5B6B73" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis stroke="#5B6B73" fontSize={10} width={45} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #F5C7CF",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f8f4d"
                strokeWidth={2}
                dot={{ fill: "#0f8f4d", r: 3 }}
                name="Revenue (₱)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Orders Status Distribution */}
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
            Orders by Status
          </Heading>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
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
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Orders over Time */}
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
          Orders Over Time
        </Heading>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={timeSeriesData} margin={{ left: -15, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5C7CF" />
            <XAxis dataKey="date" stroke="#5B6B73" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis stroke="#5B6B73" fontSize={10} width={35} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #F5C7CF",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="orders" fill="#bc0930" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
