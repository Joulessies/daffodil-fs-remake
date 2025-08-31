"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import styles from "./users.module.scss";

export default function AdminUsersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const load = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
  };
  useEffect(() => {
    load();
  }, []);

  const suspend = async (id, suspended) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !suspended }),
    });
    if (!res.ok) return toast({ title: "Update failed", status: "error" });
    load();
  };

  const promote = async (id, is_admin) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_admin: !is_admin }),
    });
    if (!res.ok) return toast({ title: "Update failed", status: "error" });
    load();
  };

  const filtered = (items || []).filter(
    (u) =>
      !query ||
      String(u.email || "")
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <Box p={6} className={styles.usersPage}>
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        className={styles.header}
      >
        <Heading size="lg">Users</Heading>
        <Flex gap={3} align="center">
          <Input
            placeholder="Search by email"
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
          <AdminBackButton />
        </Flex>
      </Flex>
      <Table size="sm" className={styles.table}>
        <Thead>
          <Tr>
            <Th>Email</Th>
            <Th>Admin</Th>
            <Th>Suspended</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {filtered.map((u) => (
            <Tr key={u.id} className={styles.row}>
              <Td>
                <span className={styles.email}>{u.email}</span>
              </Td>
              <Td>
                <span
                  className={`${styles.badge} ${
                    u.is_admin ? styles.badgeYes : styles.badgeNo
                  }`}
                >
                  {u.is_admin ? "Admin" : "User"}
                </span>
              </Td>
              <Td>
                <span
                  className={`${styles.badge} ${
                    u.suspended ? styles.badgeWarn : styles.badgeOk
                  }`}
                >
                  {u.suspended ? "Suspended" : "Active"}
                </span>
              </Td>
              <Td>
                <Button
                  size="xs"
                  mr={2}
                  onClick={() => promote(u.id, u.is_admin)}
                  className={styles.action}
                >
                  {u.is_admin ? "Demote" : "Promote"}
                </Button>
                <Button
                  size="xs"
                  onClick={() => suspend(u.id, u.suspended)}
                  className={styles.actionWarn}
                >
                  {u.suspended ? "Unsuspend" : "Suspend"}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
