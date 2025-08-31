"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function AdminBackButton({ label = "Back" }) {
  const router = useRouter();
  return (
    <Button size="sm" variant="outline" onClick={() => router.back()}>
      {label}
    </Button>
  );
}
