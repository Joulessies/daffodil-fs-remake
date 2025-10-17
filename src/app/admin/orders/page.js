"use client";

import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
  HStack,
  Input,
  Select,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminBackButton from "@/components/AdminBackButton";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Eye,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
} from "lucide-react";

export default function AdminOrdersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Manual order creation
  const [manualOrder, setManualOrder] = useState({
    customer_email: "",
    customer_name: "",
    shipping_address: "",
    items: "",
    total: 0,
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
        setFilteredItems(data.items || []);
      }
    } catch (error) {
      toast({
        title: "Error loading orders",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.customer_email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "date_desc":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "date_asc":
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case "total_desc":
        filtered.sort((a, b) => (b.total || 0) - (a.total || 0));
        break;
      case "total_asc":
        filtered.sort((a, b) => (a.total || 0) - (b.total || 0));
        break;
    }

    setFilteredItems(filtered);
  }, [searchQuery, statusFilter, sortBy, items]);

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

  const exportToCSV = () => {
    const headers = ["Order #", "Date", "Customer", "Status", "Total"];
    const rows = filteredItems.map((order) => [
      order.order_number,
      new Date(order.created_at).toLocaleString(),
      order.customer_email || "-",
      order.status,
      Number(order.total || 0).toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Orders exported",
      status: "success",
      duration: 2000,
    });
  };

  const createManualOrder = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualOrder,
          status: "pending",
          order_number: `ORD-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Failed to create order",
          description: data.error,
          status: "error",
        });
        return;
      }

      toast({
        title: "Order created successfully",
        status: "success",
      });
      onClose();
      setManualOrder({
        customer_email: "",
        customer_name: "",
        shipping_address: "",
        items: "",
        total: 0,
        notes: "",
      });
      load();
    } catch (error) {
      toast({
        title: "Error creating order",
        status: "error",
      });
    }
  };

  // Calculate statistics
  const totalRevenue = items.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );
  const pendingCount = items.filter((o) => o.status === "pending").length;
  const completedCount = items.filter(
    (o) => o.status === "completed" || o.status === "delivered"
  ).length;

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <Heading
            size="xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            Orders Management
          </Heading>
          <Text color="#5B6B73" fontSize="sm" mt={1}>
            {filteredItems.length} of {items.length} orders
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="red"
            bg="#bc0930"
            size="sm"
            onClick={onOpen}
          >
            New Order
          </Button>
          <AdminBackButton />
        </HStack>
      </Flex>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={4}
          borderRadius="12px"
          border="1px solid #F5C7CF"
        >
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm">
              Total Orders
            </StatLabel>
            <StatNumber color="#bc0930" fontSize="2xl">
              {items.length}
            </StatNumber>
            <StatHelpText>
              <Package
                size={14}
                style={{ display: "inline", marginRight: 4 }}
              />
              All time
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={4}
          borderRadius="12px"
          border="1px solid #F5C7CF"
        >
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm">
              Total Revenue
            </StatLabel>
            <StatNumber color="#0f8f4d" fontSize="2xl">
              ₱{totalRevenue.toFixed(2)}
            </StatNumber>
            <StatHelpText>
              <DollarSign
                size={14}
                style={{ display: "inline", marginRight: 4 }}
              />
              All time
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={4}
          borderRadius="12px"
          border="1px solid #F5C7CF"
        >
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm">
              Pending
            </StatLabel>
            <StatNumber color="#f59e0b" fontSize="2xl">
              {pendingCount}
            </StatNumber>
            <StatHelpText>
              <Clock size={14} style={{ display: "inline", marginRight: 4 }} />
              Needs attention
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          as={motion.div}
          whileHover={{ y: -2 }}
          bg="white"
          p={4}
          borderRadius="12px"
          border="1px solid #F5C7CF"
        >
          <Stat>
            <StatLabel color="#5B6B73" fontSize="sm">
              Completed
            </StatLabel>
            <StatNumber color="#0f8f4d" fontSize="2xl">
              {completedCount}
            </StatNumber>
            <StatHelpText>
              <CheckCircle
                size={14}
                style={{ display: "inline", marginRight: 4 }}
              />
              Success rate:{" "}
              {items.length > 0
                ? ((completedCount / items.length) * 100).toFixed(0)
                : 0}
              %
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Filters and Actions */}
      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        border="1px solid #F5C7CF"
        mb={4}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align={{ base: "stretch", md: "center" }}
        >
          <InputGroup maxW={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="#5B6B73" />
            </InputLeftElement>
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </InputGroup>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW={{ base: "100%", md: "200px" }}
            size="sm"
            icon={<Filter size={16} />}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDown size={16} />}
              size="sm"
              variant="outline"
              maxW={{ base: "100%", md: "auto" }}
            >
              Sort: {sortBy.replace("_", " ")}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy("date_desc")}>
                Date (Newest)
              </MenuItem>
              <MenuItem onClick={() => setSortBy("date_asc")}>
                Date (Oldest)
              </MenuItem>
              <MenuItem onClick={() => setSortBy("total_desc")}>
                Total (High to Low)
              </MenuItem>
              <MenuItem onClick={() => setSortBy("total_asc")}>
                Total (Low to High)
              </MenuItem>
            </MenuList>
          </Menu>

          <Button
            leftIcon={<Download size={16} />}
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={exportToCSV}
            ml={{ base: 0, md: "auto" }}
          >
            Export CSV
          </Button>
        </Flex>
      </Box>

      {/* Orders Table */}
      <Box
        bg="white"
        borderRadius="12px"
        border="1px solid #F5C7CF"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="#FFF8F3">
              <Tr>
                <Th>Order #</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th isNumeric>Total</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="#5B6B73">Loading orders...</Text>
                  </Td>
                </Tr>
              ) : filteredItems.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="#5B6B73">No orders found</Text>
                  </Td>
                </Tr>
              ) : (
                filteredItems.map((order) => (
                  <Tr key={order.id} _hover={{ bg: "#FFF8F3" }}>
                    <Td fontWeight="600">{order.order_number}</Td>
                    <Td color="#5B6B73" fontSize="sm">
                      {new Date(order.created_at).toLocaleDateString()}
                      <br />
                      <Text as="span" fontSize="xs">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{order.customer_name || "-"}</Text>
                      <Text fontSize="xs" color="#5B6B73">
                        {order.customer_email || "-"}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(order.status)}
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {order.status}
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="600" color="#bc0930">
                      ₱{Number(order.total || 0).toFixed(2)}
                    </Td>
                    <Td textAlign="center">
                      <Link href={`/admin/orders/${order.id}`}>
                        <IconButton
                          icon={<Eye size={16} />}
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          aria-label="View order"
                        />
                      </Link>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Create Manual Order Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent
          bg="#FFF8F3"
          borderRadius="16px"
          border="2px solid #F5C7CF"
        >
          <ModalHeader
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            Create Manual Order
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Customer Email</FormLabel>
                <Input
                  value={manualOrder.customer_email}
                  onChange={(e) =>
                    setManualOrder({
                      ...manualOrder,
                      customer_email: e.target.value,
                    })
                  }
                  placeholder="customer@example.com"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Customer Name</FormLabel>
                <Input
                  value={manualOrder.customer_name}
                  onChange={(e) =>
                    setManualOrder({
                      ...manualOrder,
                      customer_name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Shipping Address</FormLabel>
                <Textarea
                  value={manualOrder.shipping_address}
                  onChange={(e) =>
                    setManualOrder({
                      ...manualOrder,
                      shipping_address: e.target.value,
                    })
                  }
                  placeholder="123 Main St, City, Country"
                  rows={3}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Order Total (₱)</FormLabel>
                <NumberInput
                  value={manualOrder.total}
                  onChange={(_, val) =>
                    setManualOrder({ ...manualOrder, total: val })
                  }
                  min={0}
                  size="sm"
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={manualOrder.notes}
                  onChange={(e) =>
                    setManualOrder({ ...manualOrder, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                  size="sm"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                bg="#bc0930"
                onClick={createManualOrder}
                size="sm"
              >
                Create Order
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
