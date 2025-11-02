"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  useToast,
  Progress,
  SimpleGrid,
  Badge,
  IconButton,
  Tooltip,
  Image,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminCMSPromotionsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadPromotions();
  }, [user, isAdmin]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms/promotions");
      const data = await res.json();
      setPromotions(data.items || []);
    } catch (error) {
      console.error("Failed to load promotions:", error);
      toast({
        title: "Error",
        description: "Failed to load promotions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const promotion = promotions.find((p) => p.id === id);
      const res = await fetch(`/api/admin/cms/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...promotion, is_active: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update promotion");
      }

      toast({
        title: "Success",
        description: `Promotion ${
          !currentStatus ? "activated" : "deactivated"
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      loadPromotions();
    } catch (error) {
      console.error("Failed to toggle promotion:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update promotion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/cms/promotions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete promotion");
      }

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      loadPromotions();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete promotion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case "homepage-hero":
        return "red";
      case "homepage-banner":
        return "blue";
      case "sidebar":
        return "green";
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
            CMS - Promotions & Banners
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Manage promotions, banners, and advertisements
          </Text>
        </Box>
        <HStack spacing={2}>
          <Link href="/admin/cms/promotions/new">
            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="red"
              bg="#bc0930"
              _hover={{ bg: "#a10828" }}
            >
              New Promotion
            </Button>
          </Link>
          <AdminBackButton />
        </HStack>
      </Flex>

      {promotions.length === 0 ? (
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #F5C7CF"
          p={12}
          textAlign="center"
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Text color="#5B6B73">No promotions found</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {promotions.map((promotion) => (
            <Box
              key={promotion.id}
              bg="white"
              borderRadius="16px"
              border="1px solid #F5C7CF"
              overflow="hidden"
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {promotion.image_url && (
                <Image
                  src={promotion.image_url}
                  alt={promotion.title}
                  w="full"
                  h="200px"
                  objectFit="cover"
                />
              )}
              <VStack align="stretch" p={4} spacing={3}>
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Heading size="sm" color="#bc0930">
                      {promotion.title}
                    </Heading>
                    <Badge
                      colorScheme={getPositionColor(promotion.position)}
                      fontSize="xs"
                    >
                      {promotion.position}
                    </Badge>
                  </VStack>
                  <Badge
                    colorScheme={promotion.is_active ? "green" : "gray"}
                    fontSize="xs"
                  >
                    {promotion.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Flex>

                {promotion.description && (
                  <Text fontSize="sm" color="#5B6B73" noOfLines={2}>
                    {promotion.description}
                  </Text>
                )}

                <HStack justify="space-between" pt={2}>
                  <HStack spacing={1}>
                    <Tooltip
                      label={promotion.is_active ? "Deactivate" : "Activate"}
                    >
                      <IconButton
                        icon={
                          promotion.is_active ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )
                        }
                        size="sm"
                        variant="ghost"
                        colorScheme={promotion.is_active ? "green" : "gray"}
                        onClick={() =>
                          handleToggleActive(promotion.id, promotion.is_active)
                        }
                      />
                    </Tooltip>
                    <Tooltip label="Edit">
                      <Link href={`/admin/cms/promotions/${promotion.id}`}>
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
                        onClick={() =>
                          handleDelete(promotion.id, promotion.title)
                        }
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
