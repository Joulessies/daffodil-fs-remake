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
  VStack,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthProvider";
import NavigationBar from "@/components/navigationbar";
import dynamic from "next/dynamic";
import {
  ShoppingBag,
  Lock,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), {
  ssr: false,
});

export default function CheckoutPage() {
  const toast = useToast();
  const cart = useCart();
  const { user } = useAuth();
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
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-populate email and name from logged-in user
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    } else if (user?.user_metadata?.name) {
      setName(user.user_metadata.name);
    }
  }, [user]);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (isProcessing) return; // Prevent double submission

    try {
      // Validation
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

      if (!shipping.address1 || !shipping.city) {
        toast({
          title: "Missing shipping address",
          description:
            "Please fill in your shipping address (street address and city are required).",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsProcessing(true);

      // Validate stock before proceeding
      try {
        const stockValidation = await fetch("/api/stock/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart.items }),
        });

        const stockResult = await stockValidation.json();

        if (!stockResult.valid) {
          setIsProcessing(false);
          const outOfStockItems = stockResult.results.filter((r) => !r.valid);
          toast({
            title: "Items out of stock",
            description: `Some items are no longer available: ${outOfStockItems
              .map((item) => item.title)
              .join(", ")}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }
      } catch (err) {
        console.error("Stock validation error:", err);
        // Continue with checkout if stock validation fails
      }

      // Show loading toast
      toast({
        title: "Processing...",
        description: "Redirecting to payment gateway...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      // Only Stripe (card) is supported now
      // Create Stripe Checkout session
      const stripeInit = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: email,
          successUrl: `${window.location.origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });
      const session = await stripeInit.json();
      if (!stripeInit.ok)
        throw new Error(session?.error || "Failed to init payment");

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

      window.location.href = session.url;
    } catch (err) {
      setIsProcessing(false);
      toast({
        title: "Unable to place order",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePayMongo = async () => {
    if (isProcessing) return; // Prevent double submission

    try {
      // Validation
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

      if (!shipping.address1 || !shipping.city) {
        toast({
          title: "Missing shipping address",
          description:
            "Please fill in your shipping address (street address and city are required).",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (cart.items.length === 0) throw new Error("Your cart is empty");

      setIsProcessing(true);

      // Show loading toast
      toast({
        title: "Processing...",
        description: "Redirecting to PayMongo...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      const resp = await fetch("/api/payments/paymongo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: email,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "PayMongo init failed");

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
      setIsProcessing(false);
      toast({
        title: "Unable to start PayMongo checkout",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!mounted) return null;

  return (
    <>
      <NavigationBar />
      <Box bg="#fffcf2" minH="100vh" py={8}>
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          {/* Header */}
          <HStack spacing={4} mb={8}>
            <Button
              as="a"
              href="/"
              leftIcon={<ArrowLeft size={18} />}
              variant="ghost"
              color="#5B6B73"
              _hover={{ bg: "#fff8f3", color: "#bc0930" }}
            >
              Back to Shop
            </Button>
          </HStack>

          <VStack spacing={4} mb={8} align="start">
            <HStack spacing={3}>
              <Box
                p={3}
                bg="#bc0930"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ShoppingBag size={24} color="white" />
              </Box>
              <Heading
                as="h1"
                fontSize="3xl"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Checkout
              </Heading>
            </HStack>
            <HStack spacing={6} flexWrap="wrap">
              <HStack spacing={2} color="#5B6B73">
                <ShieldCheck size={16} />
                <Text fontSize="sm" fontWeight="500">
                  Secure Checkout
                </Text>
              </HStack>
              <HStack spacing={2} color="#5B6B73">
                <Lock size={16} />
                <Text fontSize="sm" fontWeight="500">
                  SSL Encrypted
                </Text>
              </HStack>
              <HStack spacing={2} color="#5B6B73">
                <Truck size={16} />
                <Text fontSize="sm" fontWeight="500">
                  Fast Delivery
                </Text>
              </HStack>
            </HStack>
          </VStack>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            <GridItem>
              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                    _hover={{
                      boxShadow: "xl",
                      borderColor: "#bc0930",
                    }}
                    transition="all 0.3s"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <CreditCard size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Customer Information
                      </Heading>
                    </HStack>
                    <Grid
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={4}
                    >
                      <FormControl isRequired>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Full Name
                        </FormLabel>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Dela Cruz"
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Email
                        </FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Phone
                        </FormLabel>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(+63) 900 000 0000"
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Divider my={5} borderColor="#F5C7CF" />

                    <HStack spacing={2} mb={4}>
                      <Truck size={18} color="#bc0930" />
                      <Heading size="sm" color="#2B2B2B">
                        Shipping Address
                      </Heading>
                    </HStack>
                    <Stack spacing={3}>
                      <FormControl isRequired>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Street Address
                        </FormLabel>
                        <Input
                          value={shipping.address1}
                          onChange={(e) =>
                            setShipping({
                              ...shipping,
                              address1: e.target.value,
                            })
                          }
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Apartment, suite, etc. (optional)
                        </FormLabel>
                        <Input
                          value={shipping.address2}
                          onChange={(e) =>
                            setShipping({
                              ...shipping,
                              address2: e.target.value,
                            })
                          }
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={3}
                      >
                        <FormControl>
                          <FormLabel
                            color="#5B6B73"
                            fontWeight="600"
                            fontSize="sm"
                          >
                            City
                          </FormLabel>
                          <Input
                            value={shipping.city}
                            onChange={(e) =>
                              setShipping({ ...shipping, city: e.target.value })
                            }
                            borderColor="#F5C7CF"
                            _hover={{ borderColor: "#bc0930" }}
                            _focus={{
                              borderColor: "#bc0930",
                              boxShadow: "0 0 0 1px #bc0930",
                            }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel
                            color="#5B6B73"
                            fontWeight="600"
                            fontSize="sm"
                          >
                            State/Province
                          </FormLabel>
                          <Input
                            value={shipping.state}
                            onChange={(e) =>
                              setShipping({
                                ...shipping,
                                state: e.target.value,
                              })
                            }
                            borderColor="#F5C7CF"
                            _hover={{ borderColor: "#bc0930" }}
                            _focus={{
                              borderColor: "#bc0930",
                              boxShadow: "0 0 0 1px #bc0930",
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={3}
                      >
                        <FormControl>
                          <FormLabel
                            color="#5B6B73"
                            fontWeight="600"
                            fontSize="sm"
                          >
                            ZIP/Postal Code
                          </FormLabel>
                          <Input
                            value={shipping.zip}
                            onChange={(e) =>
                              setShipping({ ...shipping, zip: e.target.value })
                            }
                            borderColor="#F5C7CF"
                            _hover={{ borderColor: "#bc0930" }}
                            _focus={{
                              borderColor: "#bc0930",
                              boxShadow: "0 0 0 1px #bc0930",
                            }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel
                            color="#5B6B73"
                            fontWeight="600"
                            fontSize="sm"
                          >
                            Country
                          </FormLabel>
                          <Select
                            value={shipping.country}
                            onChange={(e) =>
                              setShipping({
                                ...shipping,
                                country: e.target.value,
                              })
                            }
                            borderColor="#F5C7CF"
                            _hover={{ borderColor: "#bc0930" }}
                            _focus={{
                              borderColor: "#bc0930",
                              boxShadow: "0 0 0 1px #bc0930",
                            }}
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
                        colorScheme="red"
                        size="md"
                      >
                        <Text fontSize="sm" color="#2B2B2B">
                          Billing address is same as shipping
                        </Text>
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
                                  setBilling({
                                    ...billing,
                                    city: e.target.value,
                                  })
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
                                  setBilling({
                                    ...billing,
                                    zip: e.target.value,
                                  })
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
                      <FormLabel color="#5B6B73" fontWeight="600" fontSize="sm">
                        Delivery Instructions (optional)
                      </FormLabel>
                      <Textarea
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Add any special delivery instructions..."
                        borderColor="#F5C7CF"
                        _hover={{ borderColor: "#bc0930" }}
                        _focus={{
                          borderColor: "#bc0930",
                          boxShadow: "0 0 0 1px #bc0930",
                        }}
                      />
                    </FormControl>
                  </Box>

                  <Box
                    border="2px solid"
                    borderColor="#F5C7CF"
                    p={6}
                    borderRadius="16px"
                    bg="white"
                    boxShadow="lg"
                    _hover={{
                      boxShadow: "xl",
                      borderColor: "#bc0930",
                    }}
                    transition="all 0.3s"
                  >
                    <HStack spacing={3} mb={5}>
                      <Box
                        p={2}
                        bg="#fff8f3"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <Lock size={20} color="#bc0930" />
                      </Box>
                      <Heading
                        size="md"
                        color="#2B2B2B"
                        style={{ fontFamily: "var(--font-rothek)" }}
                      >
                        Payment
                      </Heading>
                    </HStack>
                    <Box
                      bg="#fffcf2"
                      p={4}
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="#F5C7CF"
                      mb={5}
                    >
                      <HStack spacing={2} mb={2}>
                        <ShieldCheck size={18} color="#bc0930" />
                        <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                          Secure Payment
                        </Text>
                      </HStack>
                      <Text color="#5B6B73" fontSize="sm">
                        We accept major credit and debit cards. Payments are
                        securely processed via Stripe. You will be redirected to
                        Stripe Checkout to complete your purchase.
                      </Text>
                    </Box>

                    <Grid
                      templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                      gap={3}
                    >
                      <FormControl>
                        <FormLabel
                          color="#5B6B73"
                          fontWeight="600"
                          fontSize="sm"
                        >
                          Promo / Discount Code
                        </FormLabel>
                        <Input
                          value={promo}
                          onChange={(e) => setPromo(e.target.value)}
                          placeholder="ENTERPROMO"
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <FormControl alignSelf="end">
                        <Button
                          variant="outline"
                          borderColor="#bc0930"
                          color="#bc0930"
                          _hover={{
                            bg: "#fff8f3",
                          }}
                          w="100%"
                        >
                          Apply
                        </Button>
                      </FormControl>
                    </Grid>

                    <Checkbox
                      mt={5}
                      isChecked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      colorScheme="red"
                      size="md"
                    >
                      <Text fontSize="sm" color="#2B2B2B">
                        Save payment and address info for next time
                      </Text>
                    </Checkbox>

                    <VStack spacing={3} mt={6} align="stretch">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        bg="#635bff"
                        _hover={{
                          bg: "#5851df",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        color="white"
                        size="lg"
                        isDisabled={cart.items.length === 0 || isProcessing}
                        isLoading={isProcessing}
                        loadingText="Processing..."
                        fontWeight="600"
                        transition="all 0.2s"
                      >
                        Pay with Stripe
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePayMongo}
                        bg="#0ea5e9"
                        _hover={{
                          bg: "#0284c7",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        color="white"
                        size="lg"
                        isDisabled={cart.items.length === 0 || isProcessing}
                        isLoading={isProcessing}
                        loadingText="Processing..."
                        fontWeight="600"
                        transition="all 0.2s"
                      >
                        Pay with PayMongo (Sandbox)
                      </Button>
                    </VStack>

                    <Divider my={6} borderColor="#F5C7CF" />
                    <Heading size="sm" mb={3} color="#2B2B2B">
                      Or pay with PayPal (Sandbox)
                    </Heading>
                    {mounted && cart.items.length > 0 && (
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
                    )}

                    <HStack mt={4} spacing={2} color="#5B6B73" justify="center">
                      <Text fontSize="xs">Powered by</Text>
                      <Text fontSize="xs" fontWeight={600} color="#2B2B2B">
                        Stripe & PayPal Sandbox
                      </Text>
                    </HStack>

                    <Divider my={6} borderColor="#F5C7CF" />
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={3} justify="center" color="#5B6B73">
                        <Lock size={16} />
                        <Text fontSize="sm" fontWeight="500">
                          Secure checkout — SSL encrypted
                        </Text>
                      </HStack>
                      <HStack
                        spacing={4}
                        justify="center"
                        fontSize="sm"
                        flexWrap="wrap"
                      >
                        <a
                          href="/privacy"
                          style={{
                            color: "#bc0930",
                            textDecoration: "underline",
                          }}
                        >
                          Privacy Policy
                        </a>
                        <Text color="#5B6B73">•</Text>
                        <a
                          href="/refund"
                          style={{
                            color: "#bc0930",
                            textDecoration: "underline",
                          }}
                        >
                          Refund Policy
                        </a>
                      </HStack>
                    </VStack>
                  </Box>
                </Stack>
              </form>
            </GridItem>

            <GridItem>
              <Box
                border="2px solid"
                borderColor="#F5C7CF"
                p={6}
                borderRadius="16px"
                bg="white"
                position="sticky"
                top={24}
                boxShadow="lg"
              >
                <HStack spacing={3} mb={5}>
                  <Box
                    p={2}
                    bg="#fff8f3"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="#F5C7CF"
                  >
                    <ShoppingBag size={20} color="#bc0930" />
                  </Box>
                  <Heading
                    size="md"
                    color="#2B2B2B"
                    style={{ fontFamily: "var(--font-rothek)" }}
                  >
                    Order Summary
                  </Heading>
                </HStack>
                <Stack spacing={4}>
                  {cart.items.length === 0 && (
                    <Box textAlign="center" py={6}>
                      <Text color="#5B6B73" fontSize="sm">
                        Your cart is empty.
                      </Text>
                    </Box>
                  )}
                  {cart.items.map((item, index) => {
                    const uniqueKey =
                      item.id ||
                      `${item.title || item.flowerType || "item"}-${index}-${
                        item.price || 0
                      }`;
                    return (
                      <Box
                        key={uniqueKey}
                        p={3}
                        bg="#fffcf2"
                        borderRadius="12px"
                        border="1px solid"
                        borderColor="#F5C7CF"
                      >
                        <Flex gap={3} align="start">
                          <ChakraImage
                            src={item.image || "/images/placeholder.png"}
                            alt={item.title || item.flowerType || "Item"}
                            boxSize="60px"
                            borderRadius="8px"
                            objectFit="cover"
                            border="1px solid"
                            borderColor="#F5C7CF"
                          />
                          <Box flex="1">
                            <Text
                              fontWeight={600}
                              fontSize="sm"
                              color="#2B2B2B"
                              noOfLines={1}
                            >
                              {item.title || item.flowerType || "Item"}
                            </Text>
                            <HStack spacing={2} mt={1}>
                              <Text fontSize="xs" color="#5B6B73">
                                Qty: {item.quantity || 1}
                              </Text>
                              <Text fontSize="xs" color="#5B6B73">
                                •
                              </Text>
                              <Text fontSize="xs" color="#5B6B73">
                                ₱{(Number(item.price) || 0).toFixed(2)}
                              </Text>
                            </HStack>
                            <Text
                              fontSize="sm"
                              fontWeight="700"
                              color="#bc0930"
                              mt={1}
                            >
                              ₱
                              {(
                                (Number(item.price) || 0) * (item.quantity || 1)
                              ).toFixed(2)}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </Stack>

                <Divider my={5} borderColor="#F5C7CF" />
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                      Subtotal
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                      ₱{cart.total.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                      Taxes & Fees (12%)
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                      ₱{(cart.total * 0.12).toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="#5B6B73" fontSize="sm" fontWeight="500">
                      Shipping
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="#2B2B2B">
                      ₱{cart.total > 0 ? "150.00" : "0.00"}
                    </Text>
                  </HStack>
                  <Divider borderColor="#F5C7CF" />
                  <HStack justify="space-between" pt={2}>
                    <Text fontSize="lg" fontWeight="700" color="#2B2B2B">
                      Total
                    </Text>
                    <Text fontSize="xl" fontWeight="700" color="#bc0930">
                      ₱
                      {(cart.total * 1.12 + (cart.total > 0 ? 150 : 0)).toFixed(
                        2
                      )}
                    </Text>
                  </HStack>
                  <Button
                    mt={4}
                    size="lg"
                    bg="#bc0930"
                    color="white"
                    onClick={handleSubmit}
                    isDisabled={cart.items.length === 0 || isProcessing}
                    isLoading={isProcessing}
                    loadingText="Processing..."
                    _hover={{
                      bg: "#a10828",
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    fontWeight="600"
                    transition="all 0.2s"
                    borderRadius="full"
                  >
                    Complete Order
                  </Button>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
