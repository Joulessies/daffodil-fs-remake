"use client";

import { useEffect } from "react";

export default function PayPalButtons({ items, onApproved }) {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=PHP`;
    script.async = true;
    script.onload = () => {
      if (!window.paypal) return;
      window.paypal
        .Buttons({
          createOrder: async () => {
            const res = await fetch("/api/payments/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
            });
            const data = await res.json();
            if (!res.ok || !data?.id) {
              console.error("PayPal create-order error", data);
              window.alert(
                data?.error || "Unable to create PayPal order. Check env vars."
              );
              throw new Error("create-order failed");
            }
            return data.id;
          },
          onApprove: async (data) => {
            const res = await fetch("/api/payments/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const capture = await res.json();
            if (!res.ok) {
              console.error("PayPal capture error", capture);
              window.alert(capture?.error || "Unable to capture payment");
              return;
            }
            onApproved?.(capture);
          },
          onError: (err) => {
            console.error("PayPal Buttons error", err);
            window.alert("PayPal SDK error. Check console and env.");
          },
        })
        .render("#paypal-button-container");
    };
    document.body.appendChild(script);
    return () => {
      // cleanup if needed
    };
  }, [items, onApproved]);

  return <div id="paypal-button-container" />;
}
