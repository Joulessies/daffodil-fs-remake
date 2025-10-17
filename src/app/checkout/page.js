"use client";

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image as ChakraImage,
  Icon,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import NavigationBar from "@/components/navigationbar";
import dynamic from "next/dynamic";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), {
  ssr: false,
});

export default function CheckoutPage() {
  const toast = useToast();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "PH",
  });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState({ ...shipping });
  const [instructions, setInstructions] = useState("");
  const [promo, setPromo] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    try {
      // Validate minimum order amount for Stripe (₱20.00 minimum)
      const MINIMUM_ORDER_PHP = 20;
      if (cart.total < MINIMUM_ORDER_PHP) {
        toast({
          title: "Minimum order amount",
          description: `Minimum order is ₱${MINIMUM_ORDER_PHP}.00. Please add more items to your cart.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate required fields
      if (!email || !name) {
        toast({
          title: "Missing information",
          description: "Please fill in your email and name.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Only Stripe (card) is supported now
      // Create Stripe Checkout session
      const stripeInit = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: email,
          // Include the session id placeholder so the confirmation page
          // can fetch the exact order by session_id
          successUrl: `${window.location.origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });
      const session = await stripeInit.json();
      if (!stripeInit.ok)
        throw new Error(session?.error || "Failed to init payment");

      // Save a draft order in Supabase (for history) with status pending
      try {
        const { supabase } = await import("@/lib/supabase");
        if (supabase) {
          await supabase.from("orders").insert({
            order_number: session.id,
            status: "pending",
            total: cart.total,
            items: cart.items,
            customer_name: name,
            customer_email: email,
            shipping_address: shipping,
          });
        }
      } catch {}

      // Persist a lightweight copy locally for fallback on confirmation page
      try {
        const subtotal = cart.total;
        const taxes = subtotal * 0.12;
        const shippingFee = subtotal > 0 ? 150 : 0;
        const total = subtotal * 1.12 + shippingFee;
        const draftOrder = {
          orderNumber: session.id,
          date: Date.now(),
          items: cart.items,
          totals: {
            subtotal,
            taxes,
            shipping: shippingFee,
            total,
          },
          customer: {
            name,
            email,
            shipping,
            billing: billingSame ? shipping : billing,
            phone,
          },
          payment: { method: "card", status: "Paid" },
        };
        localStorage.setItem("lastOrder", JSON.stringify(draftOrder));
      } catch {}

      // Redirect to Stripe Checkout (server returns URL)
      window.location.href = session.url;
    } catch (err) {
      toast({
        title: "Unable to place order",
        description: err.message,
        status: "error",
      });
    }
  };

  const handlePayMongo = async () => {
    try {
      if (cart.items.length === 0) throw new Error("Your cart is empty");
      const resp = await fetch("/api/payments/paymongo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: email,
          // Intentionally omit successUrl so server sets pm_ref in redirect
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "PayMongo init failed");

      // Save a draft order in Supabase (for history) with status pending
      try {
        const { supabase } = await import("@/lib/supabase");
        if (supabase) {
          await supabase.from("orders").insert({
            order_number: data.reference || data.id,
            status: "pending",
            total: cart.total,
            items: cart.items,
            customer_name: name,
            customer_email: email,
            shipping_address: shipping,
          });
        }
      } catch {}

      // Persist a lightweight copy locally for fallback on confirmation page
      try {
        const subtotal = cart.total;
        const taxes = subtotal * 0.12;
        const shippingFee = subtotal > 0 ? 150 : 0;
        const total = subtotal * 1.12 + shippingFee;
        const draftOrder = {
          orderNumber: data.reference || data.id,
          date: Date.now(),
          items: cart.items,
          totals: {
            subtotal,
            taxes,
            shipping: shippingFee,
            total,
          },
          customer: {
            name,
            email,
            shipping,
            billing: billingSame ? shipping : billing,
            phone,
          },
          payment: { method: "paymongo", status: "Paid" },
        };
        localStorage.setItem("lastOrder", JSON.stringify(draftOrder));
      } catch {}

      // Redirect user to PayMongo Checkout URL
      window.location.href = data.url;
    } catch (err) {
      toast({
        title: "Unable to start PayMongo checkout",
        description: err.message,
        status: "error",
      });
    }
  };

  if (!mounted) return null;

  return (
    <>
      <NavigationBar />
      <Box
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={8}
        bg="bg.canvas"
      >
        <Heading
          as="h1"
          size="lg"
          mb={6}
          color="brand.600"
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Checkout
        </Heading>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <GridItem>
            <form onSubmit={handleSubmit}>
              <Stack spacing={8}>
                <Box
                  border="1px solid"
                  borderColor="border.muted"
                  p={5}
                  borderRadius="12"
                  bg="white"
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4}>
                    Customer Information
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={4}
                  >
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(+63) 900 000 0000"
                      />
                    </FormControl>
                  </Grid>
                  <Divider my={4} />

                  <Heading size="sm" mb={3}>
                    Shipping Address
                  </Heading>
                  <Stack spacing={3}>
                    <FormControl isRequired>
                      <FormLabel>Street Address</FormLabel>
                      <Input
                        value={shipping.address1}
                        onChange={(e) =>
                          setShipping({ ...shipping, address1: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                      <Input
                        value={shipping.address2}
                        onChange={(e) =>
                          setShipping({ ...shipping, address2: e.target.value })
                        }
                      />
                    </FormControl>
                    <Grid
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={3}
                    >
                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          value={shipping.city}
                          onChange={(e) =>
                            setShipping({ ...shipping, city: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>State/Province</FormLabel>
                        <Input
                          value={shipping.state}
                          onChange={(e) =>
                            setShipping({ ...shipping, state: e.target.value })
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={3}
                    >
                      <FormControl>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <Input
                          value={shipping.zip}
                          onChange={(e) =>
                            setShipping({ ...shipping, zip: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={shipping.country}
                          onChange={(e) =>
                            setShipping({
                              ...shipping,
                              country: e.target.value,
                            })
                          }
                        >
                          <option value="PH">Philippines</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Checkbox
                      isChecked={billingSame}
                      onChange={(e) => setBillingSame(e.target.checked)}
                    >
                      Billing address is same as shipping
                    </Checkbox>
                  </Stack>

                  {!billingSame && (
                    <Box mt={4}>
                      <Heading size="sm" mb={3}>
                        Billing Address
                      </Heading>
                      <Stack spacing={3}>
                        <FormControl>
                          <FormLabel>Street Address</FormLabel>
                          <Input
                            value={billing.address1}
                            onChange={(e) =>
                              setBilling({
                                ...billing,
                                address1: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>
                            Apartment, suite, etc. (optional)
                          </FormLabel>
                          <Input
                            value={billing.address2}
                            onChange={(e) =>
                              setBilling({
                                ...billing,
                                address2: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <Grid
                          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                          gap={3}
                        >
                          <FormControl>
                            <FormLabel>City</FormLabel>
                            <Input
                              value={billing.city}
                              onChange={(e) =>
                                setBilling({ ...billing, city: e.target.value })
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>State/Province</FormLabel>
                            <Input
                              value={billing.state}
                              onChange={(e) =>
                                setBilling({
                                  ...billing,
                                  state: e.target.value,
                                })
                              }
                            />
                          </FormControl>
                        </Grid>
                        <Grid
                          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                          gap={3}
                        >
                          <FormControl>
                            <FormLabel>ZIP/Postal Code</FormLabel>
                            <Input
                              value={billing.zip}
                              onChange={(e) =>
                                setBilling({ ...billing, zip: e.target.value })
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Country</FormLabel>
                            <Select
                              value={billing.country}
                              onChange={(e) =>
                                setBilling({
                                  ...billing,
                                  country: e.target.value,
                                })
                              }
                            >
                              <option value="PH">Philippines</option>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Stack>
                    </Box>
                  )}

                  <FormControl mt={4}>
                    <FormLabel>Delivery Instructions (optional)</FormLabel>
                    <Textarea
                      rows={3}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </FormControl>
                </Box>

                <Box
                  border="1px solid"
                  borderColor="border.muted"
                  p={5}
                  borderRadius="12"
                  bg="white"
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4}>
                    Payment
                  </Heading>
                  <Text color="text.muted" mb={4}>
                    We accept major credit and debit cards. Payments are
                    securely processed via Stripe. You will be redirected to
                    Stripe Checkout to complete your purchase.
                  </Text>

                  <Grid
                    templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                    gap={3}
                    mt={4}
                  >
                    <FormControl>
                      <FormLabel>Promo / Discount Code</FormLabel>
                      <Input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="ENTERPROMO"
                      />
                    </FormControl>
                    <FormControl alignSelf="end">
                      <Button variant="outline">Apply</Button>
                    </FormControl>
                  </Grid>

                  <Checkbox
                    mt={4}
                    isChecked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                  >
                    Save payment and address info for next time
                  </Checkbox>

                  <Stack
                    mt={6}
                    spacing={3}
                    direction={{ base: "column", sm: "row" }}
                  >
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      bg="#635bff"
                      _hover={{ bg: "#5851df" }}
                      color="white"
                      size="sm"
                      isDisabled={cart.items.length === 0}
                    >
                      Pay with Stripe
                    </Button>
                    <Button
                      type="button"
                      onClick={handlePayMongo}
                      bg="#0ea5e9"
                      _hover={{ bg: "#0284c7" }}
                      color="white"
                      size="sm"
                      isDisabled={cart.items.length === 0}
                    >
                      Pay with PayMongo (Sandbox)
                    </Button>
                    <Button as="a" href="/" variant="ghost" size="sm">
                      Back to Cart
                    </Button>
                  </Stack>

                  <Divider my={6} />
                  <Heading size="sm" mb={2}>
                    Or pay with PayPal (Sandbox)
                  </Heading>
                  <PayPalButton
                    amount={(
                      cart.total * 1.12 +
                      (cart.total > 0 ? 150 : 0)
                    ).toFixed(2)}
                    currency="PHP"
                    onSuccess={(result) => {
                      console.log("PayPal capture result", result);
                    }}
                  />

                  <HStack mt={3} spacing={2} color="text.muted">
                    <Text fontSize="sm">Powered by</Text>
                    <Text fontSize="sm" fontWeight={600}>
                      Stripe & PayPal Sandbox
                    </Text>
                  </HStack>

                  <Divider my={6} />
                  <HStack spacing={4} color="text.muted">
                    <Icon viewBox="0 0 24 24" boxSize="20px">
                      <path
                        fill="currentColor"
                        d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm3 8H9V7a3 3 0 116 0v3zm-3 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                      />
                    </Icon>
                    <Text fontSize="sm">Secure checkout — SSL encrypted</Text>
                    <Text fontSize="sm">•</Text>
                    <a
                      href="/privacy"
                      style={{ color: "var(--chakra-colors-link)" }}
                    >
                      Privacy Policy
                    </a>
                    <Text fontSize="sm">•</Text>
                    <a
                      href="/refund"
                      style={{ color: "var(--chakra-colors-link)" }}
                    >
                      Refund Policy
                    </a>
                  </HStack>
                </Box>
              </Stack>
            </form>
          </GridItem>

          <GridItem>
            <Box
              border="1px solid"
              borderColor="border.muted"
              p={5}
              borderRadius="12"
              bg="white"
              position="sticky"
              top={16}
            >
              <Heading size="md" mb={4}>
                Order Summary
              </Heading>
              <Stack spacing={4}>
                {cart.items.length === 0 && (
                  <Text color="text.muted">Your cart is empty.</Text>
                )}
                {cart.items.map((item) => (
                  <Flex key={item.id} gap={3} align="center">
                    <ChakraImage
                      src={item.image || "/images/placeholder.png"}
                      alt={item.title || item.flowerType || "Item"}
                      boxSize="56px"
                      borderRadius="8"
                      objectFit="cover"
                    />
                    <Box flex="1">
                      <Text fontWeight={600}>
                        {item.title || item.flowerType || "Item"}
                      </Text>
                      <Text fontSize="sm" color="text.muted">
                        {item.description || ""}
                      </Text>
                    </Box>
                    <Box>
                      <Input
                        width="70px"
                        type="number"
                        min={1}
                        value={item.quantity || 1}
                        onChange={(e) =>
                          cart.updateQuantity(item.id, e.target.value)
                        }
                      />
                    </Box>
                    <Text width="80px" textAlign="right">
                      ₱{(Number(item.price) || 0).toFixed(2)}
                    </Text>
                  </Flex>
                ))}
              </Stack>

              <Divider my={4} />
              <Stack spacing={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="text.muted">Subtotal</Text>
                  <Text>₱{cart.total.toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="text.muted">Taxes & Fees (12%)</Text>
                  <Text>₱{(cart.total * 0.12).toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="text.muted">Shipping</Text>
                  <Text>₱{cart.total > 0 ? "150.00" : "0.00"}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" fontWeight={700}>
                  <Text>Total</Text>
                  <Text>
                    ₱
                    {(cart.total * 1.12 + (cart.total > 0 ? 150 : 0)).toFixed(
                      2
                    )}
                  </Text>
                </HStack>
                <Button
                  mt={3}
                  size="sm"
                  variant="brand"
                  onClick={handleSubmit}
                  isDisabled={cart.items.length === 0}
                >
                  Pay Now
                </Button>
              </Stack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}
