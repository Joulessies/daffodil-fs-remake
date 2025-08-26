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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");

  const load = async () => {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    if (res.ok) {
      setOrder(data.order);
      setStatus(data.order?.status || "");
      setTracking(data.order?.tracking_url || "");
    }
  };
  useEffect(() => {
    if (id) load();
  }, [id]);

  const save = async () => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking_url: tracking }),
    });
    if (!res.ok) return toast({ title: "Update failed", status: "error" });
    toast({ title: "Updated", status: "success" });
    load();
  };

  if (!order) return null;
  return (
    <Box p={6}>
      <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
        Order {order.order_number}
      </Heading>
      <Stack spacing={3}>
        <HStack>
          <Text w="140px" color="#5B6B73">
            Date
          </Text>
          <Text>{new Date(order.created_at).toLocaleString()}</Text>
        </HStack>
        <HStack>
          <Text w="140px" color="#5B6B73">
            Total
          </Text>
          <Text>₱{Number(order.total || 0).toFixed(2)}</Text>
        </HStack>
        <HStack>
          <Text w="140px" color="#5B6B73">
            Customer
          </Text>
          <Text>{order.customer_email || "-"}</Text>
        </HStack>
        <HStack>
          <Text w="140px" color="#5B6B73">
            Status
          </Text>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            maxW="260px"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </HStack>
        <HStack>
          <Text w="140px" color="#5B6B73">
            Tracking URL
          </Text>
          <Input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </HStack>
        <HStack>
          <Button colorScheme="red" onClick={save}>
            Save
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
