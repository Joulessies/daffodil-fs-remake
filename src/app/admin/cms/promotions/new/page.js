"use client";

import { useAuth } from "@/components/AuthProvider";
import { Box, Progress } from "@chakra-ui/react";
import CMSPromotionEditor from "../editor";

export default function NewCMSPromotion() {
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

  return <CMSPromotionEditor />;
}
