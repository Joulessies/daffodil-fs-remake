"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import AdminBackButton from "@/components/AdminBackButton";

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user || !isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return null;
  }

  return (
    <Box p={6}>
      <Flex align="center" justify="space-between" mb={2}>
        <Heading size="lg" style={{ fontFamily: "var(--font-rothek)" }}>
          Admin Dashboard
        </Heading>
        <Flex gap={2}>
          <AdminBackButton />
          <Link href="/">
            <Button size="sm" variant="outline">
              Home
            </Button>
          </Link>
        </Flex>
      </Flex>
      <Text color="#5B6B73" mb={6}>
        Welcome, {user.email}
      </Text>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Product Management
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/products">
                <Button size="sm">Manage Products</Button>
              </Link>
              <Text fontSize="sm" color="#5B6B73">
                Add, edit, delete, set status & stock
              </Text>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Orders
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/orders">
                <Button size="sm">View Orders</Button>
              </Link>
              <Text fontSize="sm" color="#5B6B73">
                Update status, print slips, refunds
              </Text>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Users
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/users">
                <Button size="sm">Manage Users</Button>
              </Link>
              <Text fontSize="sm" color="#5B6B73">
                Customers & admins
              </Text>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Inventory
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/inventory">
                <Button size="sm">Stock Levels</Button>
              </Link>
              <Text fontSize="sm" color="#5B6B73">
                Track & low stock alerts
              </Text>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Content
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/cms">
                <Button size="sm">CMS</Button>
              </Link>
              <Text fontSize="sm" color="#5B6B73">
                Pages, banners, homepage
              </Text>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Settings & Notifications
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/admin/settings">
                <Button size="sm">Settings</Button>
              </Link>
              <Link href="/admin/notifications">
                <Button size="sm" variant="outline">
                  Notifications
                </Button>
              </Link>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
