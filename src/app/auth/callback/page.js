"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!supabase) {
        // Missing configuration; bounce home
        window.location.replace("/");
        return;
      }

      try {
        const currentUrl = window.location.href;
        let handled = false;

        // Handle PKCE/code flow
        if (currentUrl.includes("code=")) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            currentUrl
          );
          if (error) {
            setMessage(error.message);
          }
          handled = !error;
        }

        // Handle implicit/hash tokens (e.g., magic link) as a fallback
        if (!handled && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (error) {
              setMessage(error.message);
            } else {
              handled = true;
            }
          }
        }

        if (isMounted) {
          try {
            const sess = await supabase.auth.getSession();
            const user = sess?.data?.session?.user;
            const provider = user?.app_metadata?.provider || "";
            if (provider === "google") {
              const nameMeta = user?.user_metadata || {};
              const name =
                nameMeta.full_name ||
                [nameMeta.first_name, nameMeta.last_name]
                  .filter(Boolean)
                  .join(" ");
              fetch("/api/auth/welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user?.email, name }),
              }).catch(() => {});
            }
          } catch {}

          // Clean up URL and redirect home
          const redirectTo = "/";
          const { origin } = window.location;
          window.history.replaceState({}, "", origin + redirectTo);
          window.location.replace(redirectTo);
        }
      } catch (err) {
        if (isMounted)
          setMessage(
            err instanceof Error
              ? err.message
              : "Unexpected error during sign-in"
          );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <p style={{ color: "#5B6B73" }}>{message}</p>
    </div>
  );
}
