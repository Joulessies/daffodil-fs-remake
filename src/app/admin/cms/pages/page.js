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
    <Box minH="100vh" bg="#FFF8F3" p={{ base: 4, md: 6 }}>
      <Flex align="center" justify="space-between" mb={6}>
        <Box>
          <Heading
            size="xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            mb={1}
          >
            CMS - About Page
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Manage the About page content
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid #F5C7CF"
        p={6}
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Table variant="simple">
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
            {pages.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={8}>
                  <Text color="#5B6B73">No pages found</Text>
                </Td>
              </Tr>
            ) : (
              pages.map((page) => (
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
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
