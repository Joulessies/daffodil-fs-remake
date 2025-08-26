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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const load = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <Box p={6}>
      <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
        Orders
      </Heading>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Order #</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Total</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((o) => (
            <Tr key={o.id}>
              <Td>{o.order_number}</Td>
              <Td>{new Date(o.created_at).toLocaleString()}</Td>
              <Td>{o.status}</Td>
              <Td>₱{Number(o.total || 0).toFixed(2)}</Td>
              <Td>
                <Link href={`/admin/orders/${o.id}`}>
                  <Button size="xs">Open</Button>
                </Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
