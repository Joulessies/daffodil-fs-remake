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
} from "@chakra-ui/react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, total, status, created_at, tracking_url")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setOrders(data || []);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <NavigationBar />
      <Box maxW={1100} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
          My Orders
        </Heading>
        {loading ? (
          <Text>Loading…</Text>
        ) : orders.length === 0 ? (
          <Box border="1px solid #EFEFEF" p={6} borderRadius={12} bg="#fff">
            <Text color="#5B6B73">No orders yet.</Text>
            <Link href="/shop">
              <Button mt={3} colorScheme="red">
                Go shopping
              </Button>
            </Link>
          </Box>
        ) : (
          <Stack spacing={4}>
            {orders.map((o) => (
              <Box
                key={o.id}
                border="1px solid #EFEFEF"
                p={5}
                borderRadius={12}
                bg="#fff"
              >
                <HStack justify="space-between">
                  <Text>
                    <strong>Order #</strong> {o.order_number}
                  </Text>
                  <Text>{new Date(o.created_at).toLocaleString()}</Text>
                </HStack>
                <Divider my={3} />
                <HStack justify="space-between">
                  <Text>Status: {o.status || "Paid"}</Text>
                  <Text>Total: ₱{Number(o.total || 0).toFixed(2)}</Text>
                </HStack>
                <HStack mt={3} spacing={4}>
                  <Link href={`/profile/orders/${o.id}`}>
                    <Button size="sm" variant="outline">
                      View details
                    </Button>
                  </Link>
                  {o.tracking_url && (
                    <a href={o.tracking_url} target="_blank" rel="noreferrer">
                      <Button size="sm" colorScheme="blue">
                        Track package
                      </Button>
                    </a>
                  )}
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
}
