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

export default function AdminUsersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
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

  return (
    <Box p={6}>
      <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
        Users
      </Heading>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Email</Th>
            <Th>Admin</Th>
            <Th>Suspended</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((u) => (
            <Tr key={u.id}>
              <Td>{u.email}</Td>
              <Td>{u.is_admin ? "Yes" : "No"}</Td>
              <Td>{u.suspended ? "Yes" : "No"}</Td>
              <Td>
                <Button
                  size="xs"
                  mr={2}
                  onClick={() => promote(u.id, u.is_admin)}
                >
                  {u.is_admin ? "Demote" : "Promote"}
                </Button>
                <Button size="xs" onClick={() => suspend(u.id, u.suspended)}>
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
