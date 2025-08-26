"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    price: 0,
    status: "active",
    stock: 0,
    category: "",
    images: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      images: (form.images || "").split(/\s*,\s*/).filter(Boolean),
    };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok)
      return toast({
        title: "Failed",
        description: data.error,
        status: "error",
      });
    toast({ title: "Product created", status: "success" });
    setForm({
      title: "",
      price: 0,
      status: "active",
      stock: 0,
      category: "",
      images: "",
    });
    load();
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) return toast({ title: "Delete failed", status: "error" });
    toast({ title: "Deleted", status: "success" });
    load();
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
        Products
      </Heading>

      <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              Add Product
            </Heading>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Price</FormLabel>
                <NumberInput
                  min={0}
                  value={form.price}
                  onChange={(_, v) => setForm({ ...form, price: v })}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Stock</FormLabel>
                <NumberInput
                  min={0}
                  value={form.stock}
                  onChange={(_, v) => setForm({ ...form, stock: v })}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="out-of-stock">out-of-stock</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Images (comma separated URLs)</FormLabel>
                <Input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                />
              </FormControl>
              <Button colorScheme="red" onClick={submit}>
                Create
              </Button>
            </Stack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              All Products
            </Heading>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <Th>Stock</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.title}</Td>
                    <Td>₱{Number(p.price || 0).toFixed(2)}</Td>
                    <Td>{p.status}</Td>
                    <Td>{p.stock}</Td>
                    <Td textAlign="right">
                      <Button size="xs" onClick={() => remove(p.id)}>
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
