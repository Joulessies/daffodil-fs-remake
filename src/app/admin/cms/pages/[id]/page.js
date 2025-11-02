"use client";

import { useAuth } from "@/components/AuthProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Progress } from "@chakra-ui/react";
import CMSPageEditor from "../editor";

export default function EditCMSPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const params = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadPage();
  }, [user, isAdmin, params.id]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/cms/pages/${params.id}`);
      const data = await res.json();
      setPage(data);
    } catch (error) {
      console.error("Failed to load page:", error);
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

  return <CMSPageEditor page={page} />;
}
