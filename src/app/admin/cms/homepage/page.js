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
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Switch,
} from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminCMSHomepagePage() {
  const { user, isAdmin, isLoading } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadSections();
  }, [user, isAdmin]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms/homepage");
      const data = await res.json();
      setSections(data.items || []);
    } catch (error) {
      console.error("Failed to load sections:", error);
      toast({
        title: "Error",
        description: "Failed to load homepage sections",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save sections");
      }

      toast({
        title: "Success",
        description: "Homepage sections updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to save sections:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sections",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (id, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
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
            CMS - Homepage Content
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Manage your homepage sections and content
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            onClick={handleSave}
            colorScheme="red"
            bg="#bc0930"
            _hover={{ bg: "#a10828" }}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
          <AdminBackButton />
        </HStack>
      </Flex>

      <VStack spacing={6}>
        {sections.map((section) => (
          <Box
            key={section.id}
            bg="white"
            borderRadius="16px"
            border="1px solid #F5C7CF"
            p={6}
            w="full"
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VStack align="stretch" spacing={4}>
              <Heading
                size="md"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                {section.section_title || section.section_key}
              </Heading>

              <FormControl>
                <FormLabel>Content Type</FormLabel>
                <Select
                  value={section.content_type}
                  onChange={(e) =>
                    updateSection(section.id, "content_type", e.target.value)
                  }
                >
                  <option value="text">Text</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={section.content}
                  onChange={(e) =>
                    updateSection(section.id, "content", e.target.value)
                  }
                  rows={section.content_type === "json" ? 8 : 4}
                  fontFamily={
                    section.content_type === "json" ? "monospace" : "inherit"
                  }
                  resize="vertical"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Display Order</FormLabel>
                <input
                  type="number"
                  value={section.display_order}
                  onChange={(e) =>
                    updateSection(
                      section.id,
                      "display_order",
                      parseInt(e.target.value) || 0
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #E2E8F0",
                  }}
                />
              </FormControl>

              <Flex justify="space-between" align="center">
                <Text color="#5B6B73" fontSize="sm">
                  Active
                </Text>
                <Switch
                  isChecked={section.is_active}
                  onChange={(e) =>
                    updateSection(section.id, "is_active", e.target.checked)
                  }
                  colorScheme="green"
                />
              </Flex>
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
