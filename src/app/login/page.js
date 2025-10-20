"use client";

import AuthCard from "@/components/AuthCard";
import Link from "next/link";
import { Button, Box } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <Box bg="#fffcf2" minH="100vh">
      <Box maxW="1200px" mx="auto" px={4} py={6}>
        <Button
          as={Link}
          href="/"
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          borderColor="#F5C7CF"
          color="#2B2B2B"
          _hover={{
            bg: "#fffcf2",
            borderColor: "#bc0930",
            color: "#bc0930",
          }}
        >
          Home
        </Button>
      </Box>
      <AuthCard mode="login" />
    </Box>
  );
}
