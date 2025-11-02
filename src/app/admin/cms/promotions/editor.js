"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Heading,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminBackButton from "@/components/AdminBackButton";

export default function CMSPromotionEditor({ promotion = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: "homepage-hero",
    priority: 0,
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const toast = useToast();

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || "",
        description: promotion.description || "",
        image_url: promotion.image_url || "",
        link_url: promotion.link_url || "",
        position: promotion.position || "homepage-hero",
        priority: promotion.priority || 0,
        start_date: promotion.start_date
          ? new Date(promotion.start_date).toISOString().slice(0, 16)
          : "",
        end_date: promotion.end_date
          ? new Date(promotion.end_date).toISOString().slice(0, 16)
          : "",
        is_active:
          promotion.is_active !== undefined ? promotion.is_active : true,
      });
    }
  }, [promotion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = promotion
        ? `/api/admin/cms/promotions/${promotion.id}`
        : "/api/admin/cms/promotions";
      const method = promotion ? "PUT" : "POST";

      const submitData = {
        ...formData,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : null,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        priority: parseInt(formData.priority) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save promotion");
      }

      toast({
        title: "Success",
        description: promotion
          ? "Promotion updated successfully"
          : "Promotion created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to promotions list
      window.location.href = "/admin/cms/promotions";
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save promotion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

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
            {promotion ? "Edit Promotion" : "New Promotion"}
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            {promotion
              ? "Update promotion details"
              : "Create a new promotion or banner"}
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      <form onSubmit={handleSubmit}>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #F5C7CF"
          p={6}
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Summer Sale"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Promotion description..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Link URL</FormLabel>
              <Input
                value={formData.link_url}
                onChange={(e) =>
                  setFormData({ ...formData, link_url: e.target.value })
                }
                placeholder="https://example.com/landing-page"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Position</FormLabel>
              <Select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              >
                <option value="homepage-hero">Homepage Hero</option>
                <option value="homepage-banner">Homepage Banner</option>
                <option value="sidebar">Sidebar</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                placeholder="0"
              />
              <Text fontSize="xs" color="#5B6B73" mt={1}>
                Higher priority displays first (default: 0)
              </Text>
            </FormControl>

            <Flex w="full" gap={4}>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.value === "active",
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>

            <Flex justify="flex-end" w="full" pt={4}>
              <Button
                type="submit"
                colorScheme="red"
                bg="#bc0930"
                _hover={{ bg: "#a10828" }}
                isLoading={loading}
                loadingText="Saving..."
              >
                {promotion ? "Update Promotion" : "Create Promotion"}
              </Button>
            </Flex>
          </VStack>
        </Box>
      </form>
    </Box>
  );
}
