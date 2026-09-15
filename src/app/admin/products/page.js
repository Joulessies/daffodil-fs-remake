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
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Flex, Text, Badge, IconButton, Tooltip } from "@chakra-ui/react";
import { Edit2, Trash2, Package, DollarSign } from "lucide-react";
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
  const [mobileTab, setMobileTab] = useState("catalog"); // "catalog" | "form"

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/products?page=${page}&pageSize=${pageSize}`,
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
      setMobileTab("catalog");
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
    setMobileTab("form");
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
    setMobileTab("catalog");
  };

  return (
    <Box p={{ base: 3, sm: 4, md: 6 }} minH="100vh" bg="#fffcf2">
      <Box maxW="1600px" mx="auto">
        <Flex
          align={{ base: "stretch", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={{ base: 3, sm: 4 }}
          justify="space-between"
          mb={6}
        >
          <Box>
            <Heading
              size={{ base: "lg", md: "xl" }}
              mb={1}
              style={{ fontFamily: "var(--font-rothek)" }}
              color="#bc0930"
              letterSpacing="-0.02em"
            >
              Products Management
            </Heading>
            <Box color="#5B6B73" fontSize="sm" fontWeight="500">
              Manage your product catalog • Total: {total} products
            </Box>
          </Box>
          <AdminBackButton />
        </Flex>

        {/* Mobile View Toggle Switcher (< lg) */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          mb={4}
          p={1}
          bg="#F5C7CF40"
          borderRadius="12px"
        >
          <Button
            flex={1}
            size="sm"
            variant={mobileTab === "catalog" ? "solid" : "ghost"}
            bg={mobileTab === "catalog" ? "#bc0930" : "transparent"}
            color={mobileTab === "catalog" ? "white" : "#5B6B73"}
            _hover={{ bg: mobileTab === "catalog" ? "#a10828" : "transparent" }}
            borderRadius="8px"
            onClick={() => setMobileTab("catalog")}
            fontWeight="600"
            fontSize="xs"
          >
            Catalog ({total})
          </Button>
          <Button
            flex={1}
            size="sm"
            variant={mobileTab === "form" ? "solid" : "ghost"}
            bg={mobileTab === "form" ? "#bc0930" : "transparent"}
            color={mobileTab === "form" ? "white" : "#5B6B73"}
            _hover={{ bg: mobileTab === "form" ? "#a10828" : "transparent" }}
            borderRadius="8px"
            onClick={() => setMobileTab("form")}
            fontWeight="600"
            fontSize="xs"
          >
            {editingId ? "Edit Product" : "+ Add Product"}
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "380px 1fr" }} gap={6}>
          <GridItem display={{ base: mobileTab === "form" ? "block" : "none", lg: "block" }}>
            <Box
              border="1px solid"
              borderColor="#F5C7CF"
              borderRadius="16px"
              p={{ base: 4, md: 6 }}
              bg="#FFF8F3"
              boxShadow="sm"
            >
              <Heading
                size="md"
                mb={5}
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                {editingId ? "Edit Product" : "Add Product"}
              </Heading>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
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
                            if (pub?.publicUrl)
                              uploadedUrls.push(pub.publicUrl);
                          }
                          if (uploadedUrls.length) {
                            const existing = (form.images || "")
                              .split(/\s*,\s*/)
                              .filter(Boolean);
                            const combined = [
                              ...existing,
                              ...uploadedUrls,
                            ].join(", ");
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
                            err?.message ||
                            err?.error_description ||
                            String(err);
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
                    onChange={(e) =>
                      setForm({ ...form, images: e.target.value })
                    }
                  />
                </FormControl>
                <Stack direction="row" spacing={2} mt={2}>
                  <Button
                    bg="#bc0930"
                    color="white"
                    onClick={submit}
                    isLoading={submitting}
                    _hover={{
                      bg: "#a10828",
                      transform: "translateY(-1px)",
                      boxShadow: "md",
                    }}
                    borderRadius="md"
                    fontWeight="600"
                    transition="all 0.2s"
                  >
                    {editingId ? "Save Changes" : "Create Product"}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outline"
                      borderColor="#bc0930"
                      color="#bc0930"
                      onClick={cancelEdit}
                      disabled={submitting}
                      _hover={{
                        bg: "#fff",
                      }}
                      borderRadius="md"
                      fontWeight="600"
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </GridItem>
          <GridItem display={{ base: mobileTab === "catalog" ? "block" : "none", lg: "block" }}>
            <Box
              border="1px solid"
              borderColor="#F5C7CF"
              borderRadius="16px"
              p={{ base: 4, md: 6 }}
              bg="#FFF8F3"
              boxShadow="sm"
            >
              <Grid
                templateColumns={{ base: "1fr", sm: "1fr auto" }}
                alignItems="center"
                gap={{ base: 3, sm: 0 }}
                mb={5}
              >
                <GridItem>
                  <Heading
                    size="md"
                    color="#bc0930"
                    style={{ fontFamily: "var(--font-rothek)" }}
                  >
                    All Products
                  </Heading>
                </GridItem>
                <GridItem>
                  <Flex gap={2} flexWrap="wrap" justify={{ base: "start", sm: "end" }}>
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
                  </Flex>
                </GridItem>
              </Grid>

              {/* Mobile Products Cards (< md) */}
              <VStack spacing={3} align="stretch" display={{ base: "flex", md: "none" }} mb={4}>
                {items.map((p) => {
                  const firstImg =
                    (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
                    (typeof p.images === "string" && p.images.split(",")[0]?.trim());
                  return (
                    <Box
                      key={p.id}
                      p={3.5}
                      bg="white"
                      borderRadius="12px"
                      border="1px solid #f5e6e8"
                    >
                      <Flex gap={3} align="start">
                        {firstImg ? (
                          <Box
                            as="img"
                            src={firstImg}
                            alt={p.title}
                            width="60px"
                            height="60px"
                            borderRadius="8px"
                            objectFit="cover"
                            flexShrink={0}
                            border="1px solid #eee"
                          />
                        ) : (
                          <Box
                            width="60px"
                            height="60px"
                            borderRadius="8px"
                            bg="#FFF8F3"
                            border="1px solid #F5C7CF"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Package size={24} color="#bc0930" />
                          </Box>
                        )}

                        <Box flex={1} minW={0}>
                          <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={2}>
                            {p.title}
                          </Text>
                          <HStack spacing={2} mt={1} wrap="wrap">
                            <Badge
                              colorScheme={
                                p.status === "active"
                                  ? "green"
                                  : p.status === "out-of-stock"
                                    ? "red"
                                    : "gray"
                              }
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontSize="2xs"
                              fontWeight="600"
                            >
                              {p.status}
                            </Badge>
                            <Text fontSize="xs" color="#5B6B73">
                              Stock: {p.stock}
                            </Text>
                          </HStack>
                          <Text fontWeight="700" fontSize="sm" color="#bc0930" mt={1}>
                            ₱{Number(p.price || 0).toFixed(2)}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex justify="flex-end" gap={2} mt={3} pt={2} borderTop="1px dashed #f5e6e8">
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="#bc0930"
                          color="#bc0930"
                          leftIcon={<Edit2 size={13} />}
                          onClick={() => onEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          leftIcon={<Trash2 size={13} />}
                          onClick={() => remove(p.id)}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>

              {/* Desktop Table View (>= md) */}
              <Box
                display={{ base: "none", md: "block" }}
                bg="white"
                borderRadius="12px"
                overflowX="auto"
                border="1px solid"
                borderColor="#f5e6e8"
              >
                <Table size="md" variant="simple" minW="760px">
                  <Thead bg="#fff">
                    <Tr>
                      <Th
                        py={4}
                        color="#5B6B73"
                        fontWeight="700"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Product
                      </Th>
                      <Th
                        py={4}
                        color="#5B6B73"
                        fontWeight="700"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Price
                      </Th>
                      <Th
                        py={4}
                        color="#5B6B73"
                        fontWeight="700"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Status
                      </Th>
                      <Th
                        py={4}
                        color="#5B6B73"
                        fontWeight="700"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Stock
                      </Th>
                      <Th
                        py={4}
                        textAlign="right"
                        color="#5B6B73"
                        fontWeight="700"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((p) => (
                      <Tr
                        key={p.id}
                        _hover={{ bg: "#fff" }}
                        transition="all 0.2s"
                        borderBottom="1px solid"
                        borderColor="#f5e6e8"
                      >
                        <Td py={4}>
                          <Text fontWeight="600" fontSize="md" color="gray.700">
                            {p.title}
                          </Text>
                        </Td>
                        <Td py={4}>
                          <Text fontWeight="600" color="#bc0930">
                            ₱{Number(p.price || 0).toFixed(2)}
                          </Text>
                        </Td>
                        <Td py={4}>
                          <Badge
                            colorScheme={
                              p.status === "active"
                                ? "green"
                                : p.status === "out-of-stock"
                                  ? "red"
                                  : "gray"
                            }
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="capitalize"
                          >
                            {p.status}
                          </Badge>
                        </Td>
                        <Td py={4}>
                          <HStack spacing={2}>
                            <Package size={16} color="#5B6B73" />
                            <Text fontWeight="500">{p.stock}</Text>
                          </HStack>
                        </Td>
                        <Td textAlign="right" py={4}>
                          <HStack spacing={2} justify="flex-end">
                            <Tooltip label="Edit product" hasArrow>
                              <IconButton
                                size="sm"
                                variant="outline"
                                borderColor="#bc0930"
                                color="#bc0930"
                                icon={<Edit2 size={16} />}
                                onClick={() => onEdit(p)}
                                borderRadius="md"
                                _hover={{
                                  bg: "#fff8f3",
                                  transform: "translateY(-1px)",
                                }}
                                transition="all 0.2s"
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="Delete product" hasArrow>
                              <IconButton
                                size="sm"
                                variant="solid"
                                colorScheme="red"
                                icon={<Trash2 size={16} />}
                                onClick={() => remove(p.id)}
                                borderRadius="md"
                                _hover={{
                                  transform: "translateY(-1px)",
                                  boxShadow: "md",
                                }}
                                transition="all 0.2s"
                                aria-label="Delete"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Flex
                justify="space-between"
                align="center"
                mt={5}
                pt={4}
                borderTop="1px solid"
                borderColor="#f5e6e8"
                flexWrap="wrap"
                gap={3}
              >
                <HStack spacing={2}>
                  <Text fontSize="sm" color="#5B6B73">
                    Rows per page:
                  </Text>
                  <Select
                    size="sm"
                    value={String(pageSize)}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    w="80px"
                    borderRadius="md"
                    borderColor="#bc0930"
                    _focus={{
                      borderColor: "#bc0930",
                      boxShadow: "0 0 0 1px #bc0930",
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </Select>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#bc0930"
                    color="#bc0930"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    borderRadius="md"
                    _hover={{
                      bg: "#fff8f3",
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#bc0930"
                    color="#bc0930"
                    onClick={() => {
                      const maxPage = Math.max(1, Math.ceil(total / pageSize));
                      setPage((p) => Math.min(maxPage, p + 1));
                    }}
                    disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
                    borderRadius="md"
                    _hover={{
                      bg: "#fff8f3",
                    }}
                  >
                    Next
                  </Button>
                </HStack>

                <Text fontSize="sm" color="#5B6B73" fontWeight="500">
                  Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
                </Text>
              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}
