"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function PayPalButton({
  amount = "1.00",
  currency = "USD",
  onSuccess,
}) {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    if (!clientId) {
      console.warn("NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing");
    }
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!sdkReady || !window.paypal || !containerRef.current) return;
      try {
        containerRef.current.innerHTML = "";
        await window.paypal
          .Buttons({
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
              if (!res.ok)
                throw new Error(json.error || "Failed to create order");
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
          })
          .render(containerRef.current);
      } catch (e) {
        console.error(e);
      }
    };
    render();
  }, [amount, currency, onSuccess, sdkReady]);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
