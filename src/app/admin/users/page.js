"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  HStack,
  VStack,
  Text,
  Tag,
  Badge,
  Select,
  Tooltip,
  IconButton,
  Skeleton,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import {
  Search,
  ShieldCheck,
  Shield,
  Ban,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  Copy,
} from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import styles from "./users.module.scss";

export default function AdminUsersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingPromote, setLoadingPromote] = useState({});
  const [loadingSuspend, setLoadingSuspend] = useState({});
  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const suspend = async (id, suspended) => {
    if (!window.confirm(`${suspended ? "Unsuspend" : "Suspend"} this user?`))
      return;
    try {
      setLoadingSuspend((p) => ({ ...p, [id]: true }));
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !suspended }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error || "Failed to update suspension state");
      toast({
        title: suspended ? "User unsuspended" : "User suspended",
        status: "success",
      });
      load();
    } catch (e) {
      toast({ title: e.message || "Update failed", status: "error" });
    } finally {
      setLoadingSuspend((p) => ({ ...p, [id]: false }));
    }
  };

  const promote = async (id, is_admin) => {
    try {
      setLoadingPromote((p) => ({ ...p, [id]: true }));
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !is_admin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update user role");
      toast({
        title: is_admin ? "User demoted" : "User promoted to admin",
        status: "success",
      });
      load();
    } catch (e) {
      toast({ title: e.message || "Update failed", status: "error" });
    } finally {
      setLoadingPromote((p) => ({ ...p, [id]: false }));
    }
  };

  const filtered = (items || [])
    .filter(
      (u) =>
        !query ||
        String(u.email || "")
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .filter((u) =>
      roleFilter === "all"
        ? true
        : roleFilter === "admin"
        ? !!u.is_admin
        : !u.is_admin
    )
    .filter((u) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? !u.suspended
        : !!u.suspended
    );

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: "Email copied", status: "success", duration: 1200 });
    } catch {}
  };

  return (
    <Box p={6} className={styles.usersPage}>
      <Box mb={4}>
        <Heading size="lg" mb={1} style={{ fontFamily: "var(--font-rothek)" }}>
          Users
        </Heading>
        <Text color="#5B6B73" fontSize="sm">
          Manage roles and access. {filtered.length} of {items.length} users
          shown
        </Text>
      </Box>

      <HStack spacing={3} mb={4} align="stretch" flexWrap="wrap">
        <InputGroup maxW={{ base: "100%", md: "280px" }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="#8A9AA3" />
          </InputLeftElement>
          <Input
            placeholder="Search by email"
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
        </InputGroup>
        <Select
          size="sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          maxW={{ base: "100%", md: "180px" }}
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </Select>
        <Select
          size="sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW={{ base: "100%", md: "180px" }}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Flex ml="auto" gap={2}>
          <AdminBackButton />
        </Flex>
      </HStack>

      <Table size="sm" className={styles.table}>
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th textAlign="right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Tr key={i}>
                <Td>
                  <Skeleton h="16px" w="220px" />
                </Td>
                <Td>
                  <Skeleton h="16px" w="80px" />
                </Td>
                <Td>
                  <Skeleton h="16px" w="90px" />
                </Td>
                <Td textAlign="right">
                  <Skeleton h="28px" w="140px" ml="auto" />
                </Td>
              </Tr>
            ))
          ) : filtered.length === 0 ? (
            <Tr>
              <Td colSpan={4}>
                <VStack py={8} spacing={2}>
                  <Text color="#5B6B73">No users match your filters.</Text>
                </VStack>
              </Td>
            </Tr>
          ) : (
            filtered.map((u) => (
              <Tr key={u.id} className={styles.row}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar name={u.email} size="sm" />
                    <HStack spacing={1}>
                      <Text className={styles.email}>{u.email}</Text>
                      <Tooltip label="Copy email">
                        <IconButton
                          aria-label="Copy email"
                          icon={<Copy size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => copyEmail(u.email)}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                </Td>
                <Td>
                  {u.is_admin ? (
                    <Tag colorScheme="purple" size="sm" borderRadius="full">
                      <ShieldCheck size={14} style={{ marginRight: 6 }} /> Admin
                    </Tag>
                  ) : (
                    <Tag colorScheme="gray" size="sm" borderRadius="full">
                      <Shield size={14} style={{ marginRight: 6 }} /> User
                    </Tag>
                  )}
                </Td>
                <Td>
                  {u.suspended ? (
                    <Badge colorScheme="red">Suspended</Badge>
                  ) : (
                    <Badge colorScheme="green">Active</Badge>
                  )}
                </Td>
                <Td textAlign="right">
                  <HStack spacing={2} justify="flex-end">
                    <Button
                      size="xs"
                      variant={u.is_admin ? "outline" : "solid"}
                      colorScheme="purple"
                      leftIcon={<ShieldCheck size={14} />}
                      isLoading={!!loadingPromote[u.id]}
                      onClick={() => promote(u.id, u.is_admin)}
                    >
                      {u.is_admin ? "Demote" : "Promote"}
                    </Button>
                    <Button
                      size="xs"
                      variant={u.suspended ? "outline" : "solid"}
                      colorScheme={u.suspended ? "green" : "red"}
                      leftIcon={
                        u.suspended ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Ban size={14} />
                        )
                      }
                      isLoading={!!loadingSuspend[u.id]}
                      onClick={() => suspend(u.id, u.suspended)}
                    >
                      {u.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
