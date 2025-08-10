"use client";

import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Heading,
  HStack,
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
import { useEffect, useMemo, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import BouquetPreview from "@/components/BouquetPreview";

const FLOWER_TYPES = {
  roses: { label: "Roses", pricePerStem: 3.5 },
  tulips: { label: "Tulips", pricePerStem: 2.5 },
  sunflowers: { label: "Sunflowers", pricePerStem: 4 },
  mixed: { label: "Mixed Bouquet", pricePerStem: 3 },
};

const WRAPS = {
  kraft: { label: "Kraft Paper", price: 2 },
  satin: { label: "Satin Wrap", price: 4 },
  box: { label: "Gift Box", price: 6 },
};

const ADDONS = {
  vase: { label: "Glass Vase", price: 10 },
  teddy: { label: "Mini Teddy", price: 6 },
  chocolate: { label: "Chocolates", price: 8 },
  card: { label: "Greeting Card", price: 2 },
};

export default function CustomizePage() {
  const toast = useToast();
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
      price,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");
      localStorage.setItem("cart", JSON.stringify([item, ...existing]));
      toast({ title: "Added to cart", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Unable to save to cart", status: "error" });
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
          <Box bg="white" border="1px solid #EFEFEF" borderRadius="12" p={6}>
            <Stack spacing={5}>
              <Box>
                <Text mb={2} fontWeight={600}>
                  Flower type
                </Text>
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
                <Text mb={2} fontWeight={600}>
                  Stem count
                </Text>
                <HStack maxW="240px">
                  <NumberInput
                    value={stems}
                    onChange={(v) => setStems(Number(v) || 0)}
                    min={1}
                    max={100}
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
                <Text mb={2} fontWeight={600}>
                  Color theme
                </Text>
                <RadioGroup value={color} onChange={setColor}>
                  <HStack spacing={6}>
                    {[
                      { key: "red", label: "Red" },
                      { key: "white", label: "White" },
                      { key: "pink", label: "Pink" },
                      { key: "yellow", label: "Yellow" },
                    ].map((c) => (
                      <Radio key={c.key} value={c.key}>
                        {c.label}
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </Box>

              <Box>
                <Text mb={2} fontWeight={600}>
                  Wrap style
                </Text>
                <RadioGroup value={wrap} onChange={setWrap}>
                  <Stack direction={{ base: "column", sm: "row" }} spacing={6}>
                    {Object.entries(WRAPS).map(([key, v]) => (
                      <Radio key={key} value={key}>
                        {v.label} (+{formatPeso(v.price)})
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>

              <Box>
                <Text mb={2} fontWeight={600}>
                  Add-ons
                </Text>
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
                <Text mb={2} fontWeight={600}>
                  Gift note (optional)
                </Text>
                <Textarea
                  placeholder="Write a short message for the recipient"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </Box>
            </Stack>
          </Box>

          <Box bg="white" border="1px solid #EFEFEF" borderRadius="12" p={6}>
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
          </Box>
        </SimpleGrid>
      </Box>
    </>
  );
}
