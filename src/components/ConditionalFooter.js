"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/profile/orders")
  ) {
    return null;
  }

  return (
    <>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
