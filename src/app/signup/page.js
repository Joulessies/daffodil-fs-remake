"use client";

import AuthCard from "@/components/AuthCard";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        paddingTop: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 920, padding: "0 16px" }}>
        <Button
          as={Link}
          href="/"
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
        >
          Home
        </Button>
      </div>
      <AuthCard mode="signup" />
    </div>
  );
}
