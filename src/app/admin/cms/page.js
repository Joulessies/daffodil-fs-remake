"use client";

import { useAuth } from "@/components/AuthProvider";
import { Box, Flex, Heading, Text, Progress } from "@chakra-ui/react";
import AdminBackButton from "@/components/AdminBackButton";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function CMSPage() {
  const { user, isAdmin, isLoading } = useAuth();

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
            Content Management System
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Manage the About page content
          </Text>
        </Box>
        <AdminBackButton />
      </Flex>

      {/* About Page Management */}
      <Link href="/admin/cms/pages" style={{ textDecoration: "none" }}>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #F5C7CF"
          p={6}
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, boxShadow: "xl" }}
          cursor="pointer"
          maxW="400px"
        >
          <Box
            p={3}
            borderRadius="12px"
            bg="#bc093015"
            color="#bc0930"
            w="fit-content"
            mb={4}
          >
            <FileText size={32} />
          </Box>
          <Heading
            size="md"
            color="#bc0930"
            mb={2}
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            About Page
          </Heading>
          <Text color="#5B6B73" fontSize="sm">
            Manage the About Us page content and information
          </Text>
        </Box>
      </Link>
    </Box>
  );
}
