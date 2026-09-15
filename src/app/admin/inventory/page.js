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
  Badge,
  Text,
  Skeleton,
  VStack,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { Package, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";

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
          p.category?.toLowerCase().includes(term),
      )
      .filter((p) =>
        status === "all"
          ? true
          : status === "low"
            ? Number(p.stock) <= 5
            : status === "oos"
              ? Number(p.stock) === 0
              : true,
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
    <Box p={{ base: 3, sm: 4, md: 6 }} bg="#fffcf2" minH="100vh">
      <Box maxW="1400px" mx="auto">
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
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              Inventory Management
            </Heading>
            <Text color="#5B6B73" fontSize="sm">
              Track and manage product stock levels
            </Text>
          </Box>
          <AdminBackButton />
        </Flex>

        <Box
          border="1px solid"
          borderColor="#F5C7CF"
          borderRadius="16px"
          p={{ base: 4, md: 6 }}
          bg="#FFF8F3"
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={3}
            mb={6}
            align={{ base: "stretch", sm: "center" }}
          >
            <Input
              placeholder="Search title or category"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              w={{ base: "100%", sm: "320px" }}
              borderRadius="md"
              borderColor="#F5C7CF"
              size="sm"
              _hover={{ borderColor: "#bc0930" }}
              _focus={{
                borderColor: "#bc0930",
                boxShadow: "0 0 0 1px #bc0930",
              }}
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              w={{ base: "100%", sm: "200px" }}
              borderRadius="md"
              borderColor="#F5C7CF"
              size="sm"
              _hover={{ borderColor: "#bc0930" }}
              _focus={{
                borderColor: "#bc0930",
                boxShadow: "0 0 0 1px #bc0930",
              }}
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="oos">Out of Stock</option>
            </Select>
            <Button
              size="sm"
              onClick={load}
              isLoading={loading}
              leftIcon={<RefreshCw size={15} />}
              variant="outline"
              borderColor="#bc0930"
              color="#bc0930"
              w={{ base: "100%", sm: "auto" }}
              borderRadius="md"
              _hover={{
                bg: "#fff8f3",
              }}
            >
              Refresh
            </Button>
          </Flex>

          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="60px" borderRadius="md" />
              ))}
            </VStack>
          ) : pageItems.length === 0 ? (
            <Box
              textAlign="center"
              py={12}
              bg="white"
              borderRadius="12px"
            >
              <Text fontSize="md" fontWeight="600" color="#5B6B73">
                No inventory items found
              </Text>
              <Text fontSize="sm" color="#8A9AA3">
                Try adjusting your search or filters
              </Text>
            </Box>
          ) : (
            <>
              {/* Mobile Inventory Cards (< md) */}
              <VStack
                spacing={3}
                align="stretch"
                display={{ base: "flex", md: "none" }}
                mb={4}
              >
                {pageItems.map((p) => {
                  const stockLevel = Number(p.stock || 0);
                  const isLowStock = stockLevel <= 5 && stockLevel > 0;
                  const isOutOfStock = stockLevel === 0;

                  return (
                    <Box
                      key={p.id}
                      p={3.5}
                      bg="white"
                      borderRadius="12px"
                      border="1px solid #f5e6e8"
                    >
                      <Flex justify="space-between" align="start" mb={1.5}>
                        <Box flex={1} minW={0} pr={2}>
                          <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={2}>
                            {p.title}
                          </Text>
                          <Text fontSize="xs" color="#5B6B73" textTransform="capitalize">
                            {p.category || "Uncategorized"} • ₱{Number(p.price || 0).toFixed(2)}
                          </Text>
                        </Box>
                        <Badge
                          colorScheme={
                            p.status === "active"
                              ? "green"
                              : p.status === "out-of-stock"
                                ? "red"
                                : "gray"
                          }
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          flexShrink={0}
                        >
                          {p.status}
                        </Badge>
                      </Flex>

                      <Flex
                        justify="space-between"
                        align="center"
                        pt={3}
                        mt={2}
                        borderTop="1px dashed #f5e6e8"
                      >
                        <HStack spacing={1.5}>
                          {isOutOfStock && <AlertCircle size={15} color="#E53E3E" />}
                          {isLowStock && <TrendingDown size={15} color="#DD6B20" />}
                          {!isOutOfStock && !isLowStock && <Package size={15} color="#38A169" />}
                          <Text
                            fontWeight="700"
                            fontSize="sm"
                            color={
                              isOutOfStock
                                ? "#E53E3E"
                                : isLowStock
                                  ? "#DD6B20"
                                  : "#38A169"
                            }
                          >
                            {stockLevel} in stock
                          </Text>
                        </HStack>

                        {/* Quick Touch Stepper */}
                        <HStack spacing={1}>
                          <IconButton
                            size="xs"
                            variant="outline"
                            borderColor="#bc0930"
                            color="#bc0930"
                            icon={<span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>−</span>}
                            onClick={() =>
                              setStock(p.id, Math.max(0, Number(p.stock || 0) - 1))
                            }
                            aria-label="Decrease stock"
                          />
                          <Box
                            px={2}
                            py={0.5}
                            bg="#FFF8F3"
                            border="1px solid #F5C7CF"
                            borderRadius="md"
                            fontSize="xs"
                            fontWeight="700"
                            minW="32px"
                            textAlign="center"
                          >
                            {p.stock}
                          </Box>
                          <IconButton
                            size="xs"
                            variant="outline"
                            borderColor="#bc0930"
                            color="#bc0930"
                            icon={<span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>}
                            onClick={() => setStock(p.id, Number(p.stock || 0) + 1)}
                            aria-label="Increase stock"
                          />
                        </HStack>
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
              <Table size="md" variant="simple" minW="720px">
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
                      Category
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
                      Current Stock
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
                  {pageItems.map((p) => {
                    const stockLevel = Number(p.stock || 0);
                    const isLowStock = stockLevel <= 5 && stockLevel > 0;
                    const isOutOfStock = stockLevel === 0;

                    return (
                      <Tr
                        key={p.id}
                        _hover={{ bg: "#fffcf2" }}
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
                          <Text
                            fontSize="sm"
                            textTransform="capitalize"
                            color="#5B6B73"
                          >
                            {p.category || "-"}
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
                            {isOutOfStock && (
                              <AlertCircle size={16} color="#E53E3E" />
                            )}
                            {isLowStock && (
                              <TrendingDown size={16} color="#DD6B20" />
                            )}
                            {!isOutOfStock && !isLowStock && (
                              <Package size={16} color="#38A169" />
                            )}
                            <Text
                              fontWeight="600"
                              color={
                                isOutOfStock
                                  ? "#E53E3E"
                                  : isLowStock
                                    ? "#DD6B20"
                                    : "#38A169"
                              }
                            >
                              {stockLevel}
                            </Text>
                          </HStack>
                        </Td>
                        <Td textAlign="right" py={4}>
                          <Flex gap={2} justify="flex-end" flexWrap="wrap" align="center">
                            <NumberInput
                              size="sm"
                              min={0}
                              defaultValue={p.stock}
                              w="80px"
                              borderRadius="md"
                            >
                              <NumberInputField
                                borderColor="#F5C7CF"
                                _hover={{ borderColor: "#bc0930" }}
                                _focus={{
                                  borderColor: "#bc0930",
                                  boxShadow: "0 0 0 1px #bc0930",
                                }}
                              />
                            </NumberInput>
                            <Button
                              size="sm"
                              bg="#bc0930"
                              color="white"
                              onClick={(e) => {
                                const input =
                                  e.currentTarget.parentElement.querySelector(
                                    "input",
                                  );
                                setStock(p.id, input ? input.value : p.stock);
                              }}
                              borderRadius="md"
                              _hover={{
                                bg: "#a10828",
                                transform: "translateY(-1px)",
                                boxShadow: "sm",
                              }}
                              transition="all 0.2s"
                            >
                              Set
                            </Button>
                            <HStack spacing={1}>
                              <IconButton
                                size="sm"
                                variant="outline"
                                borderColor="#bc0930"
                                color="#bc0930"
                                icon={<span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>}
                                onClick={() =>
                                  setStock(p.id, Number(p.stock || 0) + 1)
                                }
                                borderRadius="md"
                                _hover={{ bg: "#fff8f3" }}
                                aria-label="Increase stock by 1"
                              />
                              <IconButton
                                size="sm"
                                variant="outline"
                                borderColor="#bc0930"
                                color="#bc0930"
                                icon={<span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>−</span>}
                                onClick={() =>
                                  setStock(
                                    p.id,
                                    Math.max(0, Number(p.stock || 0) - 1),
                                  )
                                }
                                borderRadius="md"
                                _hover={{ bg: "#fff8f3" }}
                                aria-label="Decrease stock by 1"
                              />
                            </HStack>
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </>
        )}

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
                disabled={currentPage === 1}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                borderRadius="md"
                _hover={{
                  bg: "#fff8f3",
                }}
              >
                Next
              </Button>
            </HStack>

            <Text fontSize="sm" color="#5B6B73" fontWeight="500">
              Page {currentPage} of {totalPages}
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
