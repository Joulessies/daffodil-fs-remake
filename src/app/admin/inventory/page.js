"use client";

import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";

export default function AdminInventoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products?page=1&pageSize=500");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = (q || "").toLowerCase();
    return (items || [])
      .filter(
        (p) =>
          !term ||
          p.title?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
      )
      .filter((p) =>
        status === "all"
          ? true
          : status === "low"
          ? Number(p.stock) <= 5
          : status === "oos"
          ? Number(p.stock) === 0
          : true
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, q, status]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  const setStock = async (id, newStock) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Math.max(0, Number(newStock) || 0) }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ title: "Stock updated", status: "success" });
      load();
    } catch (err) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  return (
    <Box p={6}>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="lg" style={{ fontFamily: "var(--font-rothek)" }}>
          Inventory
        </Heading>
        <AdminBackButton />
      </Flex>

      <HStack spacing={3} mb={4} align="center">
        <Input
          placeholder="Search title or category"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxW="360px"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          maxW="220px"
        >
          <option value="all">All</option>
          <option value="low">Low stock (≤ 5)</option>
          <option value="oos">Out of stock</option>
        </Select>
        <Button size="sm" onClick={load} isDisabled={loading}>
          Refresh
        </Button>
      </HStack>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Stock</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {pageItems.map((p) => (
            <Tr key={p.id}>
              <Td>{p.title}</Td>
              <Td textTransform="capitalize">{p.category || "-"}</Td>
              <Td>₱{Number(p.price || 0).toFixed(2)}</Td>
              <Td>{p.status}</Td>
              <Td>{p.stock}</Td>
              <Td>
                <HStack>
                  <NumberInput
                    size="sm"
                    min={0}
                    defaultValue={p.stock}
                    w="100px"
                  >
                    <NumberInputField />
                  </NumberInput>
                  <Button
                    size="xs"
                    onClick={(e) => {
                      const input =
                        e.currentTarget.parentElement.querySelector("input");
                      setStock(p.id, input ? input.value : p.stock);
                    }}
                  >
                    Set
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setStock(p.id, Number(p.stock || 0) + 1)}
                  >
                    +1
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setStock(p.id, Math.max(0, Number(p.stock || 0) - 1))
                    }
                  >
                    -1
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack justify="space-between" mt={3}>
        <HStack>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </HStack>
        <HStack>
          <Select
            size="sm"
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
          <Box as="span" fontSize="sm" color="#5B6B73">
            Page {currentPage} / {totalPages}
          </Box>
        </HStack>
      </HStack>
    </Box>
  );
}
