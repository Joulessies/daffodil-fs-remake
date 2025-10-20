"use client";

import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Heading,
  HStack,
  Image as ChakraImage,
  Grid,
  Skeleton,
  Tooltip,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import { useCart } from "@/components/CartContext";
import BouquetPreview from "@/components/BouquetPreview";
import {
  Palette,
  Package,
  Gift,
  Sparkles,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";

const FLOWER_TYPES = {
  roses: { label: "Roses", pricePerStem: 100 },
  tulips: { label: "Tulips", pricePerStem: 100 },
  sunflowers: { label: "Sunflowers", pricePerStem: 100 },
  mixed: { label: "Mixed Bouquet", pricePerStem: 100 },
};

const WRAPS = {
  kraft: { label: "Kraft Paper", price: 3 },
  satin: { label: "Satin Wrap", price: 5 },
  box: { label: "Gift Box", price: 8 },
};

const ADDONS = {
  vase: { label: "Glass Vase", price: 12 },
  teddy: { label: "Mini Teddy", price: 8 },
  chocolate: { label: "Chocolates", price: 10 },
  card: { label: "Greeting Card", price: 3 },
};

export default function CustomizePage() {
  const toast = useToast();
  const cart = useCart();
  const formatPeso = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(n);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [flowerType, setFlowerType] = useState("roses");
  const [stems, setStems] = useState(12);
  const [wrap, setWrap] = useState("kraft");
  const [addons, setAddons] = useState([]);
  const [color, setColor] = useState("red");
  const [note, setNote] = useState("");
  const [aiImage, setAiImage] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const lastSpecRef = useRef("");
  // Always include the gift note text in AI prompt (toggle removed)

  // Check if AI is available (HF token present) once on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/ai/verify", { cache: "no-store" });
        const j = await r.json();
        if (!active) return;
        if (!j?.ok) {
          setAiAvailable(false);
        }
      } catch (_) {
        if (!active) return;
        setAiAvailable(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const generateAiPreview = async () => {
    if (aiLoading) return;
    try {
      setAiLoading(true);
      setAiImage("");
      let resp = await fetch("/api/ai/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
        body: JSON.stringify({
          flowerType,
          color,
          stems,
          wrap,
          addons,
          note,
        }),
      });
      // If the model is loading (503), do a brief retry with backoff
      if (resp.status === 503) {
        await new Promise((r) => setTimeout(r, 1500));
        resp = await fetch("/api/ai/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
          body: JSON.stringify({
            flowerType,
            color,
            stems,
            wrap,
            addons,
            note,
          }),
        });
      }
      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await resp.json()
        : await resp.text();
      if (!resp.ok) {
        const errText = typeof data === "string" ? data : data?.error;
        const details = [
          errText,
          data?.status && `status: ${data.status}`,
          data?.details && `details: ${String(data.details).slice(0, 240)}`,
        ]
          .filter(Boolean)
          .join(" | ");
        setAiNote(details || `AI preview failed (HTTP ${resp.status})`);
        // eslint-disable-next-line no-console
        console.error("AI preview error", data);
        throw new Error(
          errText || `Failed to generate image (HTTP ${resp.status})`
        );
      }
      if (typeof data === "object" && data?.imageUrl) setAiImage(data.imageUrl);
      setAiNote((typeof data === "object" && data?.note) || "");
    } catch (err) {
      toast({
        title: "AI preview failed",
        description: err.message,
        status: "error",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-generate preview when options change (debounced)
  useEffect(() => {
    if (!autoGenerate) return;
    const spec = JSON.stringify({
      flowerType,
      color,
      stems,
      wrap,
      addons,
      note,
    });
    const timer = setTimeout(async () => {
      if (lastSpecRef.current === spec) return;
      await generateAiPreview();
      lastSpecRef.current = spec;
    }, 800);
    return () => clearTimeout(timer);
  }, [autoGenerate, aiAvailable, flowerType, color, stems, wrap, addons]);

  const price = useMemo(() => {
    const base = FLOWER_TYPES[flowerType].pricePerStem * stems;
    const wrapPrice = WRAPS[wrap].price;
    const addonsPrice = addons.reduce((sum, key) => sum + ADDONS[key].price, 0);
    return +(base + wrapPrice + addonsPrice).toFixed(2);
  }, [flowerType, stems, wrap, addons]);

  const handleAddToCart = () => {
    const item = {
      id: `${flowerType}-${Date.now()}`,
      flowerType,
      stems,
      color,
      wrap,
      addons,
      note,
      image: aiImage || undefined,
      price,
    };
    const ok = cart.addItem(item);
    if (ok) {
      toast({ title: "Added to cart", status: "success", duration: 2000 });
      cart.open();
    } else {
      // addItem handles prompting for auth; show a gentle notice
      toast({ title: "Please sign in to add items", status: "info" });
    }
  };

  if (!mounted) return null;

  return (
    <>
      <NavigationBar />
      <Box bg="#fffcf2" minH="100vh" py={8}>
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          {/* Header Section */}
          <VStack spacing={4} mb={8} textAlign="center">
            <Box
              p={4}
              bg="#fffcf2"
              borderRadius="full"
              border="3px solid"
              borderColor="#F5C7CF"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Palette size={48} color="#bc0930" />
            </Box>
            <VStack spacing={2}>
              <Heading
                as="h1"
                fontSize="4xl"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Customize Your Bouquet
              </Heading>
              <Text fontSize="lg" color="#5B6B73" maxW="600px">
                Create the perfect floral arrangement with our interactive
                customization tool
              </Text>
            </VStack>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Customization Form */}
            <Box
              bg="white"
              border="2px solid"
              borderColor="#F5C7CF"
              borderRadius="16px"
              p={6}
              boxShadow="lg"
            >
              <VStack spacing={6} align="stretch">
                {/* Flower Type */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Palette size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Flower Type
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Choose your preferred flower variety
                      </Text>
                    </VStack>
                  </HStack>
                  <Select
                    value={flowerType}
                    onChange={(e) => setFlowerType(e.target.value)}
                    borderColor="#F5C7CF"
                    borderRadius="12px"
                    _hover={{
                      borderColor: "#bc0930",
                    }}
                    _focus={{
                      borderColor: "#bc0930",
                      boxShadow: "0 0 0 1px #bc0930",
                    }}
                  >
                    {Object.entries(FLOWER_TYPES).map(([key, v]) => (
                      <option key={key} value={key}>
                        {v.label} ({formatPeso(v.pricePerStem)}/stem)
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Stem Count */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Package size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Stem Count
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Number of flowers in your bouquet
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack maxW="240px">
                    <NumberInput
                      value={stems}
                      onChange={(v) =>
                        setStems(Math.max(1, Math.min(50, Number(v) || 0)))
                      }
                      min={1}
                      max={50}
                      borderColor="#F5C7CF"
                      borderRadius="12px"
                      _hover={{
                        borderColor: "#bc0930",
                      }}
                      _focus={{
                        borderColor: "#bc0930",
                        boxShadow: "0 0 0 1px #bc0930",
                      }}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                </Box>

                {/* Color Theme */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Palette size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Color Theme
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Select your preferred color scheme
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={4}>
                    {[
                      { key: "red", label: "Red", swatch: "#E11D48" },
                      {
                        key: "white",
                        label: "White",
                        swatch: "#F3F4F6",
                        outline: true,
                      },
                      { key: "pink", label: "Pink", swatch: "#F472B6" },
                      { key: "yellow", label: "Yellow", swatch: "#F59E0B" },
                    ].map((c) => (
                      <Tooltip key={c.key} label={c.label}>
                        <Box
                          as="button"
                          onClick={() => setColor(c.key)}
                          aria-label={c.label}
                          w="40px"
                          h="40px"
                          borderRadius="full"
                          border={c.outline ? "2px solid #E5E7EB" : "none"}
                          boxShadow={
                            color === c.key
                              ? "0 0 0 3px rgba(188,9,48,0.35)"
                              : "inset 0 0 0 1px rgba(0,0,0,0.06)"
                          }
                          bg={c.swatch}
                          transition="all 0.2s"
                          _hover={{
                            transform: "scale(1.1)",
                            boxShadow:
                              color === c.key
                                ? "0 0 0 3px rgba(188,9,48,0.35)"
                                : "0 0 0 2px rgba(188,9,48,0.2)",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </HStack>
                </Box>

                {/* Wrap Style */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Package size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Wrap Style
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Choose how your bouquet will be wrapped
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={4} wrap="wrap">
                    {Object.entries(WRAPS).map(([key, v]) => (
                      <Box
                        key={key}
                        as="button"
                        onClick={() => setWrap(key)}
                        px={4}
                        py={3}
                        borderRadius="12px"
                        border={
                          wrap === key
                            ? "2px solid #bc0930"
                            : "2px solid #F5C7CF"
                        }
                        bg={wrap === key ? "#fffcf2" : "white"}
                        _hover={{
                          borderColor: "#bc0930",
                          bg: "#fffcf2",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                      >
                        <VStack spacing={1}>
                          <Text fontWeight="600" color="#2B2B2B">
                            {v.label}
                          </Text>
                          <Text fontSize="sm" color="#bc0930">
                            +{formatPeso(v.price)}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </HStack>
                </Box>

                {/* Add-ons */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Gift size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Add-ons
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Enhance your bouquet with special extras
                      </Text>
                    </VStack>
                  </HStack>
                  <CheckboxGroup value={addons} onChange={(v) => setAddons(v)}>
                    <SimpleGrid columns={2} spacing={4}>
                      {Object.entries(ADDONS).map(([key, v]) => (
                        <Box
                          key={key}
                          p={3}
                          border="2px solid"
                          borderColor="#F5C7CF"
                          borderRadius="12px"
                          bg="white"
                          _hover={{
                            borderColor: "#bc0930",
                            bg: "#fffcf2",
                          }}
                          transition="all 0.2s"
                        >
                          <Checkbox value={key} colorScheme="red">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="500" color="#2B2B2B">
                                {v.label}
                              </Text>
                              <Text fontSize="sm" color="#bc0930">
                                +{formatPeso(v.price)}
                              </Text>
                            </VStack>
                          </Checkbox>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </Box>

                {/* Gift Note */}
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Box
                      p={2}
                      bg="#fff8f3"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="#F5C7CF"
                    >
                      <Gift size={20} color="#bc0930" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="md">
                        Gift Note
                      </Text>
                      <Text fontSize="sm" color="#5B6B73">
                        Add a personal message (optional)
                      </Text>
                    </VStack>
                  </HStack>
                  <Textarea
                    placeholder="Write a short message for the recipient"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    borderColor="#F5C7CF"
                    borderRadius="12px"
                    _hover={{
                      borderColor: "#bc0930",
                    }}
                    _focus={{
                      borderColor: "#bc0930",
                      boxShadow: "0 0 0 1px #bc0930",
                    }}
                  />
                </Box>
              </VStack>
            </Box>

            {/* Summary Sidebar */}
            <Box
              bg="white"
              border="2px solid"
              borderColor="#F5C7CF"
              borderRadius="16px"
              p={6}
              boxShadow="lg"
              position="sticky"
              top={16}
            >
              <HStack spacing={3} mb={6}>
                <Box
                  p={2}
                  bg="#fff8f3"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="#F5C7CF"
                >
                  <ShoppingCart size={20} color="#bc0930" />
                </Box>
                <Heading
                  size="md"
                  color="#2B2B2B"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Order Summary
                </Heading>
              </HStack>

              <VStack spacing={4} align="stretch" mb={6}>
                <Box
                  p={3}
                  bg="#fffcf2"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="#F5C7CF"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="#5B6B73">
                      Flower
                    </Text>
                    <Text fontWeight="600" color="#2B2B2B">
                      {FLOWER_TYPES[flowerType].label}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="#5B6B73">
                      Stems
                    </Text>
                    <Text fontWeight="600" color="#2B2B2B">
                      {stems} @{" "}
                      {formatPeso(FLOWER_TYPES[flowerType].pricePerStem)}/stem
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="#5B6B73">
                      Color
                    </Text>
                    <Text
                      fontWeight="600"
                      color="#2B2B2B"
                      textTransform="capitalize"
                    >
                      {color}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="#5B6B73">
                      Wrap
                    </Text>
                    <Text fontWeight="600" color="#2B2B2B">
                      {WRAPS[wrap].label} (+{formatPeso(WRAPS[wrap].price)})
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="#5B6B73">
                      Add-ons
                    </Text>
                    <Text fontWeight="600" color="#2B2B2B">
                      {addons.length
                        ? addons.map((k) => ADDONS[k].label).join(", ")
                        : "None"}
                    </Text>
                  </HStack>
                  {note && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="#5B6B73">
                        Gift note
                      </Text>
                      <Text fontWeight="600" color="#2B2B2B" fontSize="sm">
                        "{note}"
                      </Text>
                    </HStack>
                  )}
                </Box>
              </VStack>

              <Divider borderColor="#F5C7CF" mb={4} />
              <HStack justify="space-between" fontWeight={700} mb={6}>
                <Text fontSize="lg" color="#2B2B2B">
                  Total
                </Text>
                <Text fontSize="xl" color="#bc0930">
                  {formatPeso(price)}
                </Text>
              </HStack>

              <VStack spacing={3}>
                <Button
                  bg="#bc0930"
                  color="white"
                  size="lg"
                  borderRadius="12px"
                  fontWeight="600"
                  w="100%"
                  leftIcon={<ShoppingCart size={20} />}
                  onClick={handleAddToCart}
                  _hover={{
                    bg: "#a10828",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  borderColor="#F5C7CF"
                  color="#2B2B2B"
                  borderRadius="12px"
                  leftIcon={<RotateCcw size={18} />}
                  onClick={() => {
                    setFlowerType("roses");
                    setStems(12);
                    setColor("red");
                    setWrap("kraft");
                    setAddons([]);
                    setNote("");
                  }}
                  _hover={{
                    bg: "#fffcf2",
                    borderColor: "#bc0930",
                    color: "#bc0930",
                  }}
                  transition="all 0.2s"
                >
                  Reset
                </Button>
              </VStack>

              <Text mt={4} color="#5B6B73" fontSize="xs" textAlign="center">
                Prices are estimates; taxes and delivery are calculated at
                checkout.
              </Text>

              <Divider my={6} borderColor="#F5C7CF" />

              {/* AI Preview Section */}
              <HStack spacing={3} mb={4}>
                <Box
                  p={2}
                  bg="#fff8f3"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="#F5C7CF"
                >
                  <Sparkles size={20} color="#bc0930" />
                </Box>
                <Heading
                  size="sm"
                  color="#2B2B2B"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  AI Preview (Beta)
                </Heading>
              </HStack>

              <Text color="#5B6B73" fontSize="sm" mb={4}>
                Generate a realistic photo of your customized bouquet.
              </Text>

              <VStack spacing={3} mb={4}>
                <Checkbox
                  isChecked={autoGenerate}
                  onChange={(e) => setAutoGenerate(e.target.checked)}
                  colorScheme="red"
                >
                  <Text fontSize="sm" color="#2B2B2B">
                    Auto-generate preview
                  </Text>
                </Checkbox>

                <HStack spacing={2}>
                  <Button
                    onClick={generateAiPreview}
                    isLoading={aiLoading}
                    loadingText="Generating..."
                    size="sm"
                    bg="#bc0930"
                    color="white"
                    borderRadius="8px"
                    _hover={{
                      bg: "#a10828",
                    }}
                  >
                    Generate AI Preview
                  </Button>
                  {aiImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      borderColor="#F5C7CF"
                      color="#2B2B2B"
                      borderRadius="8px"
                      onClick={() => setAiImage("")}
                      _hover={{
                        bg: "#fffcf2",
                        borderColor: "#bc0930",
                        color: "#bc0930",
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </HStack>
              </VStack>

              <Skeleton isLoaded={!aiLoading} borderRadius="12px">
                {aiImage && (
                  <ChakraImage
                    src={aiImage}
                    alt="AI generated bouquet preview"
                    borderRadius="12px"
                    border="2px solid"
                    borderColor="#F5C7CF"
                    w="100%"
                  />
                )}
              </Skeleton>

              {aiNote && (
                <Text mt={2} color="#5B6B73" fontSize="xs">
                  {aiNote}
                </Text>
              )}

              {!aiImage && !aiLoading && (
                <Box
                  border="2px dashed"
                  borderColor="#F5C7CF"
                  borderRadius="12px"
                  p={6}
                  textAlign="center"
                  color="#5B6B73"
                  fontSize="sm"
                  bg="#fffcf2"
                >
                  No AI image yet. Click "Generate AI Preview" to create one.
                </Box>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </>
  );
}
