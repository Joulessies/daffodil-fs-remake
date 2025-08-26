"use client";

import { useEffect, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import {
  Box,
  Heading,
  Stack,
  Text,
  HStack,
  Divider,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase || !orderId) return;
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_number, total, status, created_at, tracking_url, items"
          )
          .eq("id", orderId)
          .single();
        if (error) throw error;
        if (mounted) setOrder(data || null);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <>
      <NavigationBar />
      <Box maxW={1100} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg" style={{ fontFamily: "var(--font-rothek)" }}>
            Order Details
          </Heading>
          <Link href="/profile/orders">
            <Button variant="outline">Back to orders</Button>
          </Link>
        </HStack>

        {loading ? (
          <Text>Loading…</Text>
        ) : !order ? (
          <Text>Order not found.</Text>
        ) : (
          <Stack spacing={4}>
            <Box border="1px solid #EFEFEF" p={5} borderRadius={12} bg="#fff">
              <HStack justify="space-between">
                <Text>
                  <strong>Order #</strong> {order.order_number}
                </Text>
                <Text>{new Date(order.created_at).toLocaleString()}</Text>
              </HStack>
              <Divider my={3} />
              <HStack justify="space-between">
                <Text>Status: {order.status || "Paid"}</Text>
                <Text>Total: ₱{Number(order.total || 0).toFixed(2)}</Text>
              </HStack>
              {order.tracking_url && (
                <HStack mt={3}>
                  <a href={order.tracking_url} target="_blank" rel="noreferrer">
                    <Button size="sm" colorScheme="blue">
                      Track package
                    </Button>
                  </a>
                </HStack>
              )}
            </Box>

            <Box border="1px solid #EFEFEF" p={5} borderRadius={12} bg="#fff">
              <Heading size="sm" mb={3}>
                Items
              </Heading>
              {items.length === 0 ? (
                <Text color="#5B6B73">No items recorded.</Text>
              ) : (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th isNumeric>Qty</Th>
                      <Th isNumeric>Price</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((it, idx) => (
                      <Tr key={idx}>
                        <Td>{it.title || it.flowerType || "Item"}</Td>
                        <Td isNumeric>{it.quantity || 1}</Td>
                        <Td isNumeric>₱{Number(it.price || 0).toFixed(2)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </Stack>
        )}
      </Box>
    </>
  );
}
