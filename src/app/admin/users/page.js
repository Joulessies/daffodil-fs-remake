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
import React, { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import styles from "./users.module.scss";
import { useAuth } from "@/components/AuthProvider";

export default function AdminUsersPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingPromote, setLoadingPromote] = useState({});
  const [loadingSuspend, setLoadingSuspend] = useState({});
  const [loadingDelete, setLoadingDelete] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) {
      // Filter out suspended users - they should not appear in the list
      const activeUsers = (data.items || []).filter((user) => !user.suspended);
      setItems(activeUsers);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const suspend = async (id, suspended) => {
    if (
      !window.confirm(
        "Remove this user? This will suspend their account and remove them from the users list."
      )
    )
      return;
    try {
      setLoadingSuspend((p) => ({ ...p, [id]: true }));
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to remove user");
      toast({
        title: "User removed",
        description: "The user has been suspended and removed from the list",
        status: "success",
        duration: 3000,
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
      console.log("Promoting user:", {
        id,
        current_is_admin: is_admin,
        new_is_admin: !is_admin,
      });

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !is_admin }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("Promote response:", {
        ok: res.ok,
        status: res.status,
        data,
      });

      if (!res.ok) {
        throw new Error(
          data?.error || `Failed to update user role (${res.status})`
        );
      }

      toast({
        title: is_admin ? "User demoted" : "User promoted to admin",
        status: "success",
        duration: 3000,
      });

      // Reload the user list to reflect changes
      await load();
    } catch (e) {
      console.error("Promote error:", e);
      toast({
        title: "Update failed",
        description: e.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingPromote((p) => ({ ...p, [id]: false }));
    }
  };

  const deleteUser = async (id, userEmail, isAdmin) => {
    // Prevent self-deletion
    if (currentUser?.id === id) {
      toast({
        title: "Cannot delete your own account",
        description: "You cannot delete yourself. Ask another admin to do it.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (
      !window.confirm(
        `Delete user "${userEmail}" permanently? This action cannot be undone.`
      )
    )
      return;

    try {
      setLoadingDelete((p) => ({ ...p, [id]: true }));
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete user");
      }

      toast({
        title: "User deleted",
        description: `User "${userEmail}" has been permanently deleted`,
        status: "success",
        duration: 3000,
      });

      await load();
    } catch (e) {
      console.error("Delete error:", e);
      toast({
        title: "Delete failed",
        description: e.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingDelete((p) => ({ ...p, [id]: false }));
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
    );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter]);

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: "Email copied", status: "success", duration: 1200 });
    } catch {}
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      className={styles.usersPage}
      minH="100vh"
      bg="#fffcf2"
    >
      <Box maxW="1400px" mx="auto">
        <Box mb={8}>
          <Heading
            size="xl"
            mb={2}
            style={{ fontFamily: "var(--font-rothek)" }}
            color="#bc0930"
            letterSpacing="-0.02em"
          >
            Users Management
          </Heading>
          <Text color="#5B6B73" fontSize="md" fontWeight="500">
            Manage roles and access • Showing {startIndex + 1}-
            {Math.min(endIndex, filtered.length)} of {filtered.length} users
          </Text>
        </Box>

        <HStack
          spacing={3}
          mb={6}
          align="stretch"
          flexWrap="wrap"
          bg="#FFF8F3"
          p={4}
          borderRadius="16px"
          boxShadow="sm"
          border="1px solid"
          borderColor="#F5C7CF"
        >
          <InputGroup maxW={{ base: "100%", md: "320px" }} flex="1">
            <InputLeftElement pointerEvents="none" h="full">
              <Search size={18} color="#8A9AA3" />
            </InputLeftElement>
            <Input
              placeholder="Search by email..."
              size="md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              borderRadius="12px"
              border="1px solid"
              borderColor="gray.300"
              _focus={{
                borderColor: "#bc0930",
                boxShadow: "0 0 0 1px #bc0930",
              }}
              _hover={{
                borderColor: "gray.400",
              }}
            />
          </InputGroup>
          <Select
            size="md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            maxW={{ base: "100%", md: "180px" }}
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.300"
            _focus={{
              borderColor: "#bc0930",
              boxShadow: "0 0 0 1px #bc0930",
            }}
            _hover={{
              borderColor: "gray.400",
            }}
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </Select>
          <Flex ml="auto" gap={2}>
            <AdminBackButton />
          </Flex>
        </HStack>

        <Box
          bg="#FFF8F3"
          borderRadius="16px"
          overflow="hidden"
          boxShadow="sm"
          border="1px solid"
          borderColor="#F5C7CF"
        >
          <Table size="md" variant="simple">
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
                  User
                </Th>
                <Th
                  py={4}
                  color="#5B6B73"
                  fontWeight="700"
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Role
                </Th>
                <Th
                  textAlign="right"
                  py={4}
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
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <Tr key={i} _hover={{ bg: "#fff" }} transition="all 0.2s">
                    <Td py={5}>
                      <HStack spacing={3}>
                        <Skeleton boxSize="48px" borderRadius="full" />
                        <Skeleton h="18px" w="220px" borderRadius="md" />
                      </HStack>
                    </Td>
                    <Td py={5}>
                      <Skeleton h="24px" w="80px" borderRadius="full" />
                    </Td>
                    <Td textAlign="right" py={5}>
                      <HStack spacing={2} justify="flex-end">
                        <Skeleton h="32px" w="85px" borderRadius="md" />
                        <Skeleton h="32px" w="85px" borderRadius="md" />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <Tr>
                  <Td colSpan={3} py={16}>
                    <VStack spacing={3}>
                      <Box
                        boxSize="64px"
                        bg="gray.100"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Search size={28} color="#A0AEC0" />
                      </Box>
                      <Text color="gray.600" fontSize="lg" fontWeight="600">
                        No users found
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Try adjusting your search or filters
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                paginatedItems.map((u) => (
                  <Tr
                    key={u.id}
                    _hover={{ bg: "#fff" }}
                    transition="all 0.2s"
                    borderBottom="1px solid"
                    borderColor="#f5e6e8"
                  >
                    <Td py={5}>
                      <HStack spacing={4}>
                        <Avatar
                          name={u.email}
                          size="md"
                          bg="#bc0930"
                          color="white"
                          fontWeight="600"
                        />
                        <HStack spacing={2}>
                          <Text fontWeight="600" fontSize="md" color="gray.700">
                            {u.email}
                          </Text>
                          <Tooltip label="Copy email" hasArrow>
                            <IconButton
                              aria-label="Copy email"
                              icon={<Copy size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="gray"
                              borderRadius="md"
                              onClick={() => copyEmail(u.email)}
                              _hover={{ bg: "gray.200" }}
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    </Td>
                    <Td py={5}>
                      {u.is_admin ? (
                        <Tag
                          bg="#bc0930"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontWeight="600"
                        >
                          <ShieldCheck size={14} style={{ marginRight: 6 }} />
                          Admin
                        </Tag>
                      ) : (
                        <Tag
                          bg="#5B6B73"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontWeight="600"
                        >
                          <Shield size={14} style={{ marginRight: 6 }} />
                          User
                        </Tag>
                      )}
                    </Td>
                    <Td textAlign="right" py={5}>
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          size="sm"
                          variant={u.is_admin ? "outline" : "solid"}
                          bg={u.is_admin ? "transparent" : "#bc0930"}
                          color={u.is_admin ? "#bc0930" : "white"}
                          borderColor={u.is_admin ? "#bc0930" : undefined}
                          leftIcon={<ShieldCheck size={16} />}
                          isLoading={!!loadingPromote[u.id]}
                          onClick={() => promote(u.id, u.is_admin)}
                          borderRadius="md"
                          fontWeight="600"
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                            bg: u.is_admin ? "#fff8f3" : "#a10828",
                          }}
                          transition="all 0.2s"
                        >
                          {u.is_admin ? "Demote" : "Promote"}
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="red"
                          leftIcon={<Ban size={16} />}
                          isLoading={!!loadingSuspend[u.id]}
                          onClick={() => suspend(u.id, false)}
                          borderRadius="md"
                          fontWeight="600"
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                          transition="all 0.2s"
                        >
                          Remove
                        </Button>
                        {u.is_admin && (
                          <Tooltip
                            label={
                              currentUser?.id === u.id
                                ? "Cannot delete your own account"
                                : "Delete permanently"
                            }
                            hasArrow
                          >
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              icon={<Trash2 size={16} />}
                              isLoading={!!loadingDelete[u.id]}
                              isDisabled={currentUser?.id === u.id}
                              onClick={() =>
                                deleteUser(u.id, u.email, u.is_admin)
                              }
                              borderRadius="md"
                              _hover={{
                                transform: "translateY(-1px)",
                                boxShadow: "md",
                                bg: "red.50",
                              }}
                              transition="all 0.2s"
                              aria-label="Delete user"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <Flex
            mt={6}
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={4}
            bg="#FFF8F3"
            p={4}
            borderRadius="16px"
            boxShadow="sm"
            border="1px solid"
            borderColor="#F5C7CF"
          >
            <HStack spacing={2}>
              <Text fontSize="sm" color="#5B6B73">
                Rows per page:
              </Text>
              <Select
                size="sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                w="80px"
                borderRadius="md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => goToPage(currentPage - 1)}
                isDisabled={currentPage === 1}
                borderRadius="md"
                _hover={{
                  bg: "gray.100",
                }}
              >
                Previous
              </Button>

              <HStack spacing={1}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore =
                      index > 0 && page - array[index - 1] > 1;

                    return (
                      <React.Fragment key={`page-${page}`}>
                        {showEllipsisBefore && (
                          <Text px={2} color="gray.400">
                            ...
                          </Text>
                        )}
                        <Button
                          size="sm"
                          variant={currentPage === page ? "solid" : "ghost"}
                          bg={currentPage === page ? "#bc0930" : "transparent"}
                          color={currentPage === page ? "white" : "#5B6B73"}
                          onClick={() => goToPage(page)}
                          minW="40px"
                          borderRadius="md"
                          fontWeight="600"
                          _hover={{
                            bg: currentPage === page ? "#a10828" : "#fff",
                          }}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  })}
              </HStack>

              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => goToPage(currentPage + 1)}
                isDisabled={currentPage === totalPages}
                borderRadius="md"
                _hover={{
                  bg: "gray.100",
                }}
              >
                Next
              </Button>
            </HStack>

            <Text fontSize="sm" color="#5B6B73" fontWeight="500">
              Page {currentPage} of {totalPages}
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
