"use client";

import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  useToast,
  Badge,
  Divider,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  VStack,
  Image,
  FormControl,
  FormLabel,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AdminBackButton from "@/components/AdminBackButton";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Mail,
  Phone,
  FileText,
  Printer,
  Save,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        setStatus(data.order?.status || "");
        setTracking(data.order?.tracking_url || "");
        setNotes(data.order?.notes || "");
      }
    } catch (error) {
      toast({
        title: "Error loading order",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tracking_url: tracking, notes }),
      });
      if (!res.ok) {
        toast({ title: "Update failed", status: "error" });
        return;
      }
      toast({ title: "Order updated successfully", status: "success" });
      load();
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <Box minH="100vh" bg="#FFF8F3" p={6}>
        <Text color="#5B6B73">Loading order...</Text>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box minH="100vh" bg="#FFF8F3" p={6}>
        <Text color="#5B6B73">Order not found</Text>
      </Box>
    );
  }

  const orderItems = order.items
    ? typeof order.items === "string"
      ? JSON.parse(order.items)
      : order.items
    : [];

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading
              size="xl"
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              Order {order.order_number}
            </Heading>
            <Badge
              colorScheme={getStatusColor(order.status)}
              fontSize="md"
              px={3}
              py={1}
              borderRadius="full"
            >
              {order.status}
            </Badge>
          </HStack>
          <Text color="#5B6B73" fontSize="sm">
            Created {new Date(order.created_at).toLocaleString()}
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<Printer size={16} />}
            size="sm"
            variant="outline"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <AdminBackButton />
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Main Content */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Order Items */}
            <Box
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              bg="white"
              borderRadius="16px"
              border="1px solid #F5C7CF"
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
              {orderItems.length > 0 ? (
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
                    {orderItems.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <HStack>
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.title}
                                boxSize="40px"
                                objectFit="cover"
                                borderRadius="8px"
                              />
                            )}
                            <Text fontSize="sm">{item.title || item.name}</Text>
                          </HStack>
                        </Td>
                        <Td isNumeric>{item.quantity || 1}</Td>
                        <Td isNumeric>₱{Number(item.price || 0).toFixed(2)}</Td>
                        <Td isNumeric fontWeight="600">
                          ₱
                          {(
                            Number(item.price || 0) * (item.quantity || 1)
                          ).toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="#5B6B73" textAlign="center" py={4}>
                  No items in this order
                </Text>
              )}
              <Divider my={4} borderColor="#F5C7CF" />
              <Flex justify="space-between" align="center">
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
              </Flex>
            </Box>

            {/* Customer Information */}
            <Box
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              bg="white"
              borderRadius="16px"
              border="1px solid #F5C7CF"
              p={6}
            >
              <HStack mb={4}>
                <User size={20} color="#bc0930" />
                <Heading
                  size="md"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Customer Information
                </Heading>
              </HStack>
              <Divider mb={4} borderColor="#F5C7CF" />
              <VStack spacing={3} align="stretch">
                <HStack>
                  <User size={16} color="#5B6B73" />
                  <Text color="#5B6B73" w="120px">
                    Name:
                  </Text>
                  <Text fontWeight="500">{order.customer_name || "-"}</Text>
                </HStack>
                <HStack>
                  <Mail size={16} color="#5B6B73" />
                  <Text color="#5B6B73" w="120px">
                    Email:
                  </Text>
                  <Text fontWeight="500">{order.customer_email || "-"}</Text>
                </HStack>
                <HStack>
                  <Phone size={16} color="#5B6B73" />
                  <Text color="#5B6B73" w="120px">
                    Phone:
                  </Text>
                  <Text fontWeight="500">{order.customer_phone || "-"}</Text>
                </HStack>
                <HStack align="start">
                  <MapPin size={16} color="#5B6B73" style={{ marginTop: 4 }} />
                  <Text color="#5B6B73" w="120px">
                    Address:
                  </Text>
                  <Text fontWeight="500" flex={1}>
                    {order.shipping_address || "-"}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Payment Information */}
            {order.payment_method && (
              <Box
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                bg="white"
                borderRadius="16px"
                border="1px solid #F5C7CF"
                p={6}
              >
                <HStack mb={4}>
                  <DollarSign size={20} color="#bc0930" />
                  <Heading
                    size="md"
                    color="#bc0930"
                    style={{ fontFamily: "var(--font-rothek)" }}
                  >
                    Payment Information
                  </Heading>
                </HStack>
                <Divider mb={4} borderColor="#F5C7CF" />
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Text color="#5B6B73" w="150px">
                      Payment Method:
                    </Text>
                    <Text fontWeight="500">{order.payment_method}</Text>
                  </HStack>
                  <HStack>
                    <Text color="#5B6B73" w="150px">
                      Payment Status:
                    </Text>
                    <Badge
                      colorScheme={
                        order.payment_status === "paid" ? "green" : "yellow"
                      }
                    >
                      {order.payment_status || "pending"}
                    </Badge>
                  </HStack>
                  {order.transaction_id && (
                    <HStack>
                      <Text color="#5B6B73" w="150px">
                        Transaction ID:
                      </Text>
                      <Text fontWeight="500" fontSize="sm">
                        {order.transaction_id}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </GridItem>

        {/* Sidebar */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Order Management */}
            <Box
              as={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              bg="white"
              borderRadius="16px"
              border="1px solid #F5C7CF"
              p={6}
            >
              <HStack mb={4}>
                <FileText size={20} color="#bc0930" />
                <Heading
                  size="md"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Order Management
                </Heading>
              </HStack>
              <Divider mb={4} borderColor="#F5C7CF" />
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" color="#5B6B73">
                    Order Status
                  </FormLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    size="sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="#5B6B73">
                    <HStack>
                      <Truck size={14} />
                      <Text>Tracking URL</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="https://tracking.example.com/..."
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="#5B6B73">
                    Internal Notes
                  </FormLabel>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this order..."
                    rows={4}
                    size="sm"
                  />
                </FormControl>

                <Button
                  leftIcon={<Save size={16} />}
                  colorScheme="red"
                  bg="#bc0930"
                  onClick={save}
                  isLoading={saving}
                  w="full"
                >
                  Save Changes
                </Button>
              </VStack>
            </Box>

            {/* Order Timeline */}
            <Box
              as={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              bg="white"
              borderRadius="16px"
              border="1px solid #F5C7CF"
              p={6}
            >
              <HStack mb={4}>
                <Calendar size={20} color="#bc0930" />
                <Heading
                  size="md"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Timeline
                </Heading>
              </HStack>
              <Divider mb={4} borderColor="#F5C7CF" />
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Text color="#5B6B73" fontSize="sm" w="80px">
                    Created:
                  </Text>
                  <Text fontSize="sm" fontWeight="500">
                    {new Date(order.created_at).toLocaleString()}
                  </Text>
                </HStack>
                {order.updated_at && (
                  <HStack>
                    <Text color="#5B6B73" fontSize="sm" w="80px">
                      Updated:
                    </Text>
                    <Text fontSize="sm" fontWeight="500">
                      {new Date(order.updated_at).toLocaleString()}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}
