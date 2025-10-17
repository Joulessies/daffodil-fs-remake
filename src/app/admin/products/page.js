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
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";

export default function AdminProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: 0,
    status: "active",
    stock: 0,
    category: "",
    images: "",
  });
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/products?page=${page}&pageSize=${pageSize}`
    );
    const data = await res.json();
    if (res.ok) {
      setItems(data.items || []);
      if (typeof data.total === "number") setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, pageSize]);

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        images: (form.images || "").split(/\s*,\s*/).filter(Boolean),
      };
      let res;
      if (editingId) {
        res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok)
        return toast({
          title: "Failed",
          description: data.error,
          status: "error",
        });
      toast({
        title: editingId ? "Product updated" : "Product created",
        status: "success",
      });
      setForm({
        title: "",
        price: 0,
        status: "active",
        stock: 0,
        category: "",
        images: "",
      });
      setEditingId(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) return toast({ title: "Delete failed", status: "error" });
    toast({ title: "Deleted", status: "success" });
    load();
  };

  const onEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      category: p.category || "",
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      status: p.status || "active",
      images: Array.isArray(p.images) ? p.images.join(", ") : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      title: "",
      price: 0,
      status: "active",
      stock: 0,
      category: "",
      images: "",
    });
  };

  return (
    <Box p={6}>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="lg" style={{ fontFamily: "var(--font-rothek)" }}>
          Products
        </Heading>
        <AdminBackButton />
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Heading size="sm" mb={3}>
              {editingId ? "Edit Product" : "Add Product"}
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
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="floral">Floral Arrangements</option>
                  <option value="seasonal">Seasonal Flowers</option>
                  <option value="gifts">Gift Collections</option>
                </Select>
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
                <FormLabel>Upload Images</FormLabel>
                <HStack spacing={3} align="start">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const inputEl = e.target;
                      const files = Array.from(inputEl.files || []);
                      if (files.length === 0) return;
                      try {
                        setUploading(true);
                        const { supabase } = await import("@/lib/supabase");
                        if (!supabase) {
                          toast({
                            title: "Upload unavailable",
                            description: "Supabase is not configured",
                            status: "error",
                          });
                          return;
                        }
                        const uploadedUrls = [];
                        for (const file of files) {
                          const safeName = file.name
                            .toLowerCase()
                            .replace(/[^a-z0-9.]+/g, "-");
                          const path = `admin/${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2, 8)}-${safeName}`;
                          const { error: upErr } = await supabase.storage
                            .from("products")
                            .upload(path, file);
                          if (upErr) throw upErr;
                          const { data: pub } = supabase.storage
                            .from("products")
                            .getPublicUrl(path);
                          if (pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
                        }
                        if (uploadedUrls.length) {
                          const existing = (form.images || "")
                            .split(/\s*,\s*/)
                            .filter(Boolean);
                          const combined = [...existing, ...uploadedUrls].join(
                            ", "
                          );
                          setForm({ ...form, images: combined });
                          toast({
                            title: "Uploaded",
                            description: `${uploadedUrls.length} image(s) added`,
                            status: "success",
                          });
                        }
                      } catch (err) {
                        console.error("Upload failed", err);
                        const msg =
                          err?.message || err?.error_description || String(err);
                        let hint = "";
                        if (/not found/i.test(msg)) {
                          hint =
                            " — create a 'products' Storage bucket and allow uploads (dev).";
                        } else if (/Unauthorized|permission/i.test(msg)) {
                          hint =
                            " — update Storage policies to allow anon or authenticated uploads.";
                        }
                        toast({
                          title: "Upload failed",
                          description: msg + hint,
                          status: "error",
                        });
                      } finally {
                        setUploading(false);
                        // Reset the file input so same files can be chosen again if needed
                        if (inputEl) inputEl.value = "";
                      }
                    }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <Button isLoading loadingText="Uploading" size="sm" />
                  )}
                </HStack>
                <HStack spacing={2} mt={2} wrap="wrap">
                  {(form.images || "")
                    .split(/\s*,\s*/)
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((url) => (
                      <Box
                        key={url}
                        as="img"
                        src={url}
                        alt="preview"
                        width="56px"
                        height="56px"
                        style={{
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #efefef",
                        }}
                      />
                    ))}
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Images (comma separated URLs)</FormLabel>
                <Input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                />
              </FormControl>
              <Stack direction="row" spacing={2}>
                <Button
                  colorScheme="red"
                  onClick={submit}
                  isLoading={submitting}
                >
                  {editingId ? "Save Changes" : "Create"}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={cancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </GridItem>
        <GridItem>
          <Box border="1px solid #EFEFEF" borderRadius="12" p={4} bg="#fff">
            <Grid
              templateColumns={{ base: "1fr", md: "1fr auto" }}
              alignItems="center"
              mb={3}
            >
              <GridItem>
                <Heading size="sm">All Products</Heading>
              </GridItem>
              <GridItem textAlign={{ base: "left", md: "right" }}>
                <HStack spacing={2} justify={{ base: "start", md: "end" }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch("/api/admin/products/import", {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        return toast({
                          title: "Import failed",
                          description: data.error,
                          status: "error",
                        });
                      }
                      toast({
                        title: `Imported ${data.imported} products`,
                        status: "success",
                      });
                      load();
                    }}
                  >
                    Import catalog
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch("/api/admin/products/seed", {
                        method: "POST",
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        return toast({
                          title: "Seed failed",
                          description: data.error,
                          status: "error",
                        });
                      }
                      toast({
                        title: `Seeded ${data.inserted} low stock products`,
                        description: `${data.inserted} added, ${data.errors} errors`,
                        status: "success",
                        duration: 5000,
                      });
                      load();
                    }}
                  >
                    Seed Low Stock
                  </Button>
                </HStack>
              </GridItem>
            </Grid>
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
                      <Stack direction="row" spacing={2} justify="flex-end">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button size="xs" onClick={() => remove(p.id)}>
                          Delete
                        </Button>
                      </Stack>
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
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const maxPage = Math.max(1, Math.ceil(total / pageSize));
                    setPage((p) => Math.min(maxPage, p + 1));
                  }}
                  disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
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
                  Page {page} / {Math.max(1, Math.ceil(total / pageSize))}
                </Box>
              </HStack>
            </HStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
