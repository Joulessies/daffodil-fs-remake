"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Progress,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminCMSPagesPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadPages();
  }, [user, isAdmin]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms/pages");
      const data = await res.json();
      // Only show "About" page or pages with "about" in the slug
      const aboutPages = (data.items || []).filter(
        (page) =>
          page.slug.toLowerCase() === "about" ||
          page.slug.toLowerCase() === "about-us" ||
          page.title.toLowerCase().includes("about")
      );
      setPages(aboutPages);
    } catch (error) {
      console.error("Failed to load pages:", error);
      toast({
        title: "Error",
        description: "Failed to load pages",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/cms/pages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete page");
      }

      toast({
        title: "Success",
        description: "Page deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      loadPages();
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <Box p={6} minH="100vh" bg="#FFF8F3">
        <Progress size="xs" isIndeterminate colorScheme="red" />
      </Box>
    );
  }

  if (!user || !isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return null;
  }

  return (
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 3, sm: 4, md: 6 }}>
      <Flex
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 3, sm: 0 }}
        justify="space-between"
        mb={6}
      >
        <Box>
          <Heading
            size={{ base: "lg", md: "xl" }}
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            CMS - About Page
          </Heading>
          <Text color="#5B6B73" fontSize={{ base: "xs", sm: "sm" }}>
            Manage the About page content
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      <Box
        bg="white"
        borderRadius={{ base: "12px", md: "16px" }}
        border="1px solid #F5C7CF"
        p={{ base: 3.5, sm: 4, md: 6 }}
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {pages.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="#5B6B73">No pages found</Text>
          </Box>
        ) : (
          <>
            {/* Mobile Page Cards (< md) */}
            <Box display={{ base: "block", md: "none" }}>
              {pages.map((page) => (
                <Box
                  key={page.id}
                  p={3.5}
                  mb={3}
                  bg="#fffcf2"
                  borderRadius="12px"
                  border="1px solid #f8e1e7"
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Box flex="1">
                      <Text fontWeight="600" fontSize="md" color="#bc0930">
                        {page.title}
                      </Text>
                      <Text color="#5B6B73" fontSize="xs">
                        /{page.slug}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={getStatusColor(page.status)}
                      fontSize="xs"
                    >
                      {page.status}
                    </Badge>
                  </Flex>

                  <Text color="#5B6B73" fontSize="xs" mb={3}>
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </Text>

                  <Flex justify="flex-end" gap={2} pt={2} borderTop="1px dashed #f5c7cf">
                    <Link href={`/${page.slug}`} target="_blank">
                      <IconButton
                        icon={<ExternalLink size={15} />}
                        size="sm"
                        variant="outline"
                        borderColor="#F5C7CF"
                        colorScheme="gray"
                        aria-label="View page"
                      />
                    </Link>
                    <Link href={`/admin/cms/pages/${page.id}`}>
                      <IconButton
                        icon={<Edit size={15} />}
                        size="sm"
                        variant="outline"
                        borderColor="#F5C7CF"
                        colorScheme="blue"
                        aria-label="Edit page"
                      />
                    </Link>
                    <IconButton
                      icon={<Trash2 size={15} />}
                      size="sm"
                      variant="outline"
                      borderColor="#F5C7CF"
                      colorScheme="red"
                      onClick={() => handleDelete(page.id, page.title)}
                      aria-label="Delete page"
                    />
                  </Flex>
                </Box>
              ))}
            </Box>

            {/* Desktop Table (>= md) */}
            <Box overflowX="auto" display={{ base: "none", md: "block" }}>
              <Table variant="simple" minW="500px">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Slug</Th>
                    <Th>Status</Th>
                    <Th>Last Updated</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pages.map((page) => (
                    <Tr key={page.id} _hover={{ bg: "#FFF8F3" }}>
                      <Td fontWeight="500" color="#bc0930">
                        {page.title}
                      </Td>
                      <Td color="#5B6B73" fontSize="sm">
                        /{page.slug}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(page.status)}
                          fontSize="xs"
                        >
                          {page.status}
                        </Badge>
                      </Td>
                      <Td color="#5B6B73" fontSize="sm">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Page">
                            <Link href={`/${page.slug}`} target="_blank">
                              <IconButton
                                icon={<ExternalLink size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                aria-label="View page"
                              />
                            </Link>
                          </Tooltip>
                          <Tooltip label="Edit">
                            <Link href={`/admin/cms/pages/${page.id}`}>
                              <IconButton
                                icon={<Edit size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                aria-label="Edit page"
                              />
                            </Link>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(page.id, page.title)}
                              aria-label="Delete page"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
