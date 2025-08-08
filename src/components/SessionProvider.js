"use client";

import { SessionProvider } from "@auth/nextjs/react";

export function SessionProviderWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
