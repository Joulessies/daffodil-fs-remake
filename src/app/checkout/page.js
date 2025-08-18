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
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import NavigationBar from "@/components/navigationbar";
import PayPalButtons from "@/components/PayPalButtons";

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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ number: "", exp: "", cvv: "" });
  const [promo, setPromo] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (paymentMethod !== "card") {
        // For PayPal and others, do not submit the form; buttons handle flow
        return;
      }
      // Create Stripe Checkout session
      const stripeInit = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: email,
          successUrl: `${window.location.origin}/order/confirmation`,
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

  if (!mounted) return null;

  return (
    <>
      <NavigationBar />
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Heading
          as="h1"
          size="lg"
          mb={6}
          style={{ fontFamily: "var(--font-rothek)", color: "#bc0930" }}
        >
          Checkout
        </Heading>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <GridItem>
            <form onSubmit={handleSubmit}>
              <Stack spacing={8}>
                <Box
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
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
                  border="1px solid #EFEFEF"
                  p={5}
                  borderRadius="12"
                  bg="white"
                >
                  <Heading size="md" mb={4}>
                    Payment
                  </Heading>
                  <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      spacing={6}
                    >
                      <Radio value="card">Credit / Debit Card</Radio>
                      <Radio value="paypal">PayPal</Radio>
                      <Radio value="wallet">Digital Wallet</Radio>
                    </Stack>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <Grid
                      templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
                      gap={3}
                      mt={4}
                    >
                      <FormControl isRequired>
                        <FormLabel>Card Number</FormLabel>
                        <Input
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          value={card.number}
                          onChange={(e) =>
                            setCard({ ...card, number: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Expiry</FormLabel>
                        <Input
                          placeholder="MM/YY"
                          autoComplete="cc-exp"
                          value={card.exp}
                          onChange={(e) =>
                            setCard({ ...card, exp: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>CVV</FormLabel>
                        <Input
                          type="password"
                          placeholder="123"
                          autoComplete="cc-csc"
                          value={card.cvv}
                          onChange={(e) =>
                            setCard({ ...card, cvv: e.target.value })
                          }
                        />
                      </FormControl>
                    </Grid>
                  )}

                  {paymentMethod === "paypal" && (
                    <Box mt={3}>
                      <PayPalButtons
                        items={cart.items}
                        onApproved={async (capture) => {
                          try {
                            const { supabase } = await import("@/lib/supabase");
                            if (supabase) {
                              await supabase.from("orders").insert({
                                order_number:
                                  capture?.id ||
                                  Math.random().toString(36).slice(2, 10),
                                status: "paid",
                                total: cart.total,
                                items: cart.items,
                                customer_name: name,
                                customer_email: email,
                                shipping_address: shipping,
                                paypal_order_id: capture?.id || null,
                              });
                            }
                          } catch {}
                          cart.clearCart();
                          window.location.href = "/order/confirmation";
                        }}
                      />
                    </Box>
                  )}

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

                  <HStack mt={6} spacing={4}>
                    <Button
                      type="submit"
                      colorScheme="red"
                      isDisabled={cart.items.length === 0}
                    >
                      Complete Purchase
                    </Button>
                    <Button as="a" href="/" variant="ghost">
                      Back to Cart
                    </Button>
                  </HStack>

                  <Divider my={6} />
                  <HStack spacing={4} color="#5B6B73">
                    <ChakraImage
                      src="/images/lock.svg"
                      alt="SSL"
                      boxSize="20px"
                    />
                    <Text fontSize="sm">Secure checkout — SSL encrypted</Text>
                    <Text fontSize="sm">•</Text>
                    <a href="/privacy" style={{ color: "#3b5bfd" }}>
                      Privacy Policy
                    </a>
                    <Text fontSize="sm">•</Text>
                    <a href="/refund" style={{ color: "#3b5bfd" }}>
                      Refund Policy
                    </a>
                  </HStack>
                </Box>
              </Stack>
            </form>
          </GridItem>

          <GridItem>
            <Box
              border="1px solid #EFEFEF"
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
                  <Text color="#5B6B73">Your cart is empty.</Text>
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
                      <Text fontSize="sm" color="#5B6B73">
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
                  <Text color="#5B6B73">Subtotal</Text>
                  <Text>₱{cart.total.toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#5B6B73">Taxes & Fees (12%)</Text>
                  <Text>₱{(cart.total * 0.12).toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#5B6B73">Shipping</Text>
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
              </Stack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}
