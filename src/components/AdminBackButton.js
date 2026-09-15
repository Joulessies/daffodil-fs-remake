"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function AdminBackButton({ label = "Back", fallbackHref = "/admin" }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      borderColor="#F5C7CF"
      color="#bc0930"
      _hover={{ bg: "#FFF8F3", borderColor: "#bc0930" }}
      leftIcon={<ChevronLeft size={16} />}
      onClick={handleBack}
      fontSize="xs"
      fontWeight="600"
    >
      {label}
    </Button>
  );
}

