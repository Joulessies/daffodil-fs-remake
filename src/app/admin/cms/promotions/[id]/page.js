"use client";

import { useAuth } from "@/components/AuthProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Progress } from "@chakra-ui/react";
import CMSPromotionEditor from "../editor";

export default function EditCMSPromotion() {
  const { user, isAdmin, isLoading } = useAuth();
  const params = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadPromotion();
  }, [user, isAdmin, params.id]);

  const loadPromotion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/cms/promotions/${params.id}`);
      const data = await res.json();
      setPromotion(data);
    } catch (error) {
      console.error("Failed to load promotion:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
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

  return <CMSPromotionEditor promotion={promotion} />;
}
