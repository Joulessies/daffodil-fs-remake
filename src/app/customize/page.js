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
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import { useCart } from "@/components/CartContext";
import BouquetPreview from "@/components/BouquetPreview";

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
      <Box maxW={"1100px"} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Heading
          as="h1"
          size="lg"
          textAlign="center"
          mb={6}
          style={{ fontFamily: "var(--font-rothek)", color: "#bc0930" }}
        >
          Customize Your Flower
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box
            bg="white"
            border="1px solid #EFEFEF"
            borderRadius="12"
            p={6}
            boxShadow="sm"
          >
            <Stack spacing={5}>
              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    1
                  </Box>
                  <Text fontWeight={600}>Flower type</Text>
                </HStack>
                <Select
                  value={flowerType}
                  onChange={(e) => setFlowerType(e.target.value)}
                >
                  {Object.entries(FLOWER_TYPES).map(([key, v]) => (
                    <option key={key} value={key}>
                      {v.label} ({formatPeso(v.pricePerStem)}/stem)
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    2
                  </Box>
                  <Text fontWeight={600}>Stem count</Text>
                </HStack>
                <HStack maxW="240px">
                  <NumberInput
                    value={stems}
                    onChange={(v) =>
                      setStems(Math.max(1, Math.min(50, Number(v) || 0)))
                    }
                    min={1}
                    max={50}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </Box>

              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    3
                  </Box>
                  <Text fontWeight={600}>Color theme</Text>
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
                        w="34px"
                        h="34px"
                        borderRadius="full"
                        border={c.outline ? "1px solid #E5E7EB" : "none"}
                        boxShadow={
                          color === c.key
                            ? "0 0 0 3px rgba(188,9,48,0.35)"
                            : "inset 0 0 0 1px rgba(0,0,0,0.06)"
                        }
                        bg={c.swatch}
                      />
                    </Tooltip>
                  ))}
                </HStack>
              </Box>

              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    4
                  </Box>
                  <Text fontWeight={600}>Wrap style</Text>
                </HStack>
                <HStack spacing={4} wrap="wrap">
                  {Object.entries(WRAPS).map(([key, v]) => (
                    <Box
                      key={key}
                      as="button"
                      onClick={() => setWrap(key)}
                      px={4}
                      py={3}
                      borderRadius="10"
                      border={
                        wrap === key ? "2px solid #bc0930" : "1px solid #E5E7EB"
                      }
                      bg={wrap === key ? "rgba(188,9,48,0.06)" : "white"}
                      _hover={{ borderColor: "#bc0930" }}
                    >
                      <Text fontWeight={600}>{v.label}</Text>
                      <Text fontSize="sm" color="#5B6B73">
                        +{formatPeso(v.price)}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </Box>

              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    5
                  </Box>
                  <Text fontWeight={600}>Add-ons</Text>
                </HStack>
                <CheckboxGroup value={addons} onChange={(v) => setAddons(v)}>
                  <Stack direction={{ base: "column", sm: "row" }} spacing={6}>
                    {Object.entries(ADDONS).map(([key, v]) => (
                      <Checkbox key={key} value={key}>
                        {v.label} (+{formatPeso(v.price)})
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </Box>

              <Box>
                <HStack mb={2} spacing={2}>
                  <Box
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg="#bc0930"
                    color="white"
                    fontSize="xs"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    6
                  </Box>
                  <Text fontWeight={600}>Gift note (optional)</Text>
                </HStack>
                <Textarea
                  placeholder="Write a short message for the recipient"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </Box>
            </Stack>
          </Box>

          <Box
            bg="white"
            border="1px solid #EFEFEF"
            borderRadius="12"
            p={6}
            boxShadow="sm"
            position="sticky"
            top={16}
          >
            <Heading size="md" mb={4}>
              Summary
            </Heading>
            <Stack spacing={3} fontSize="sm">
              <Text>
                <strong>Flower:</strong> {FLOWER_TYPES[flowerType].label}
              </Text>
              <Text>
                <strong>Stems:</strong> {stems} @{" "}
                {formatPeso(FLOWER_TYPES[flowerType].pricePerStem)}
                /stem
              </Text>
              <Text>
                <strong>Color:</strong> {color}
              </Text>
              <Text>
                <strong>Wrap:</strong> {WRAPS[wrap].label} (+
                {formatPeso(WRAPS[wrap].price)})
              </Text>
              <Text>
                <strong>Add-ons:</strong>{" "}
                {addons.length
                  ? addons.map((k) => ADDONS[k].label).join(", ")
                  : "None"}
              </Text>
              {note && (
                <Text>
                  <strong>Gift note:</strong> {note}
                </Text>
              )}
            </Stack>

            <Divider my={4} />
            <HStack justify="space-between" fontWeight={700} mb={4}>
              <Text>Total</Text>
              <Text>{formatPeso(price)}</Text>
            </HStack>

            <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
              <Button colorScheme="red" onClick={handleAddToCart} flex={1}>
                Add to cart
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFlowerType("roses");
                  setStems(12);
                  setColor("red");
                  setWrap("kraft");
                  setAddons([]);
                  setNote("");
                }}
              >
                Reset
              </Button>
            </Stack>
            <Text mt={3} color="#5B6B73" fontSize="xs">
              Prices are estimates; taxes and delivery are calculated at
              checkout.
            </Text>

            <Divider my={6} />
            <Heading size="sm" mb={2}>
              AI Preview (beta)
            </Heading>
            <Text color="#5B6B73" fontSize="sm" mb={3}>
              Generate a realistic photo of your customized bouquet.
            </Text>
            <HStack spacing={3} mb={3}>
              <Checkbox
                isChecked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
              >
                Auto-generate preview
              </Checkbox>

              <Button
                onClick={generateAiPreview}
                isLoading={aiLoading}
                loadingText="Generating..."
              >
                Generate AI Preview
              </Button>
              {aiImage && (
                <Button variant="ghost" onClick={() => setAiImage("")}>
                  Clear
                </Button>
              )}
            </HStack>
            <Skeleton isLoaded={!aiLoading} borderRadius="12">
              {aiImage && (
                <ChakraImage
                  src={aiImage}
                  alt="AI generated bouquet preview"
                  borderRadius="12"
                  border="1px solid #EFEFEF"
                />
              )}
            </Skeleton>
            {aiNote && (
              <Text mt={1} color="#5B6B73" fontSize="xs">
                {aiNote}
              </Text>
            )}
            {!aiImage && !aiLoading && (
              <Box
                border="1px dashed #E2E8F0"
                borderRadius="12"
                p={6}
                textAlign="center"
                color="#5B6B73"
                fontSize="sm"
              >
                No AI image yet. Click "Generate AI Preview" to create one.
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </>
  );
}
