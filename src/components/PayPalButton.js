"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Box, Text } from "@chakra-ui/react";

export default function PayPalButton({
  amount = "1.00",
  currency = "USD",
  onSuccess,
}) {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    if (!clientId) {
      console.warn("NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing");
    }
  }, []);

  const renderButtons = useCallback(async () => {
    if (!sdkReady || !window.paypal || !containerRef.current || isRendering)
      return;

    // Check if container is still in DOM
    if (!document.contains(containerRef.current)) {
      console.warn("PayPal container removed from DOM, skipping render");
      return;
    }

    setIsRendering(true);

    try {
      // Clear any existing rendering (helps during hot reloads/strict mode)
      containerRef.current.innerHTML = "";

      const buttons = window.paypal.Buttons({
        style: {
          layout: "horizontal",
          height: 30,
          shape: "rect",
          label: "paypal",
          tagline: false,
        },
        createOrder: async () => {
          const res = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, currency }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to create order");
          return json.id;
        },
        onApprove: async (data) => {
          const res = await fetch("/api/payments/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Capture failed");
          onSuccess?.(json);
        },
        onCancel: () => {
          console.warn("PayPal flow cancelled by user");
          alert("PayPal checkout was cancelled.");
        },
        onError: (err) => {
          console.error("PayPal error", err);
          alert(err?.message || "PayPal error");
        },
      });

      // Double-check container is still in DOM before rendering
      if (!document.contains(containerRef.current)) {
        console.warn(
          "PayPal container removed from DOM during render, aborting"
        );
        return;
      }

      // Render and store cleanup
      await buttons.render(containerRef.current);

      // Return a cleanup function to close the buttons instance on unmount
      return () => {
        try {
          // Guard: instance may already be destroyed if container was removed
          if (buttons && typeof buttons.close === "function") {
            buttons.close();
          }
        } catch (_) {}
      };
    } catch (e) {
      console.error("PayPal render error:", e);
    } finally {
      setIsRendering(false);
    }
  }, [amount, currency, onSuccess, sdkReady, isRendering]);

  useEffect(() => {
    let cleanup;
    const timeoutId = setTimeout(() => {
      renderButtons().then((fn) => {
        cleanup = fn;
      });
    }, 100); // Small delay to ensure DOM is stable

    return () => {
      clearTimeout(timeoutId);
      if (typeof cleanup === "function") cleanup();
    };
  }, [renderButtons]);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  if (!clientId) {
    return (
      <Box
        p={4}
        bg="#fffcf2"
        borderRadius="12px"
        border="1px solid"
        borderColor="#F5C7CF"
        textAlign="center"
      >
        <Text color="#5B6B73" fontSize="sm">
          PayPal not configured
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => {
          console.error("Failed to load PayPal SDK");
          setSdkReady(false);
        }}
      />
      <div
        ref={containerRef}
        style={{ minHeight: "40px" }}
        data-paypal-container="true"
      />
    </>
  );
}
