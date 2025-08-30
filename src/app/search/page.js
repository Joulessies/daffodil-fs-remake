"use client";

import { useEffect, useMemo, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Grid,
  GridItem,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import ProductCardMinimal from "@/components/ProductCardMinimal";
import { searchProducts } from "@/lib/products";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [colors, setColors] = useState([]);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    if (qParam) setQ(qParam);
  }, []);

  const results = useMemo(
    () => searchProducts({ q, category, minPrice, maxPrice, colors, sort }),
    [q, category, minPrice, maxPrice, colors, sort]
  );

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(results.length, startIdx + pageSize);
  const pagedResults = results.slice(startIdx, endIdx);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, category, minPrice, maxPrice, colors, sort, pageSize]);

  return (
    <>
      <NavigationBar />
      <Box maxW={1100} mx="auto" px={{ base: 4, md: 6 }} py={6}>
        <Text
          fontSize="xl"
          fontWeight={700}
          mb={4}
          style={{ fontFamily: "var(--font-rothek)" }}
        >
          Search Products
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "280px 1fr" }} gap={6}>
          <GridItem>
            <Stack
              spacing={4}
              bg="#fff"
              p={4}
              border="1px solid #EFEFEF"
              borderRadius={12}
            >
              <div>
                <Text fontWeight={600} mb={2}>
                  Keyword
                </Text>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search..."
                />
              </div>
              <div>
                <Text fontWeight={600} mb={2}>
                  Category
                </Text>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="bouquets">Bouquets</option>
                  <option value="wedding">Wedding Flowers</option>
                  <option value="sympathy">Sympathy</option>
                  <option value="gifts">Gifts</option>
                </Select>
              </div>
              <div>
                <Text fontWeight={600} mb={2}>
                  Price
                </Text>
                <HStack>
                  <Input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                    placeholder="Max"
                  />
                </HStack>
              </div>
              <div>
                <Text fontWeight={600} mb={2}>
                  Colors
                </Text>
                <CheckboxGroup value={colors} onChange={setColors}>
                  <Stack direction="row" wrap="wrap" spacing={3}>
                    {[
                      "red",
                      "pink",
                      "white",
                      "yellow",
                      "purple",
                      "green",
                      "brown",
                      "blush",
                    ].map((c) => (
                      <Checkbox key={c} value={c}>
                        {c}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </div>
              <div>
                <Text fontWeight={600} mb={2}>
                  Sort by
                </Text>
                <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                </Select>
              </div>
              <div>
                <Text fontWeight={600} mb={2}>
                  Page size
                </Text>
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value) || 9)}
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </Select>
              </div>
              <Button
                onClick={() => {
                  setQ("");
                  setCategory("all");
                  setMinPrice(0);
                  setMaxPrice(10000);
                  setColors([]);
                  setSort("relevance");
                  setPage(1);
                  setPageSize(9);
                }}
              >
                Reset
              </Button>
            </Stack>
          </GridItem>
          <GridItem>
            <Stack spacing={4}>
              <HStack justify="space-between">
                <Text color="#5B6B73">{results.length} result(s)</Text>
                <Text color="#5B6B73" fontSize="sm">
                  Showing {results.length === 0 ? 0 : startIdx + 1}–{endIdx}
                </Text>
              </HStack>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                gap={4}
              >
                {pagedResults.map((p) => (
                  <ProductCardMinimal
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    image={p.images?.[0]}
                    price={p.price}
                    sku={p.sku}
                    categories={p.categories || [p.category].filter(Boolean)}
                    availability={p.availability}
                    stock={p.stock}
                    description={p.description}
                  />
                ))}
              </Grid>
              {/* Pagination controls */}
              <HStack justify="center" spacing={2} pt={2}>
                <Button
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={currentPage <= 1}
                >
                  Prev
                </Button>
                {/* Page number buttons (compact) */}
                {Array.from({ length: totalPages })
                  .slice(0, 7)
                  .map((_, idx) => {
                    const num = idx + 1;
                    return (
                      <Button
                        key={num}
                        size="sm"
                        variant={num === currentPage ? "solid" : "outline"}
                        colorScheme={num === currentPage ? "blue" : undefined}
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </Button>
                    );
                  })}
                {totalPages > 7 && <Text px={1}>…</Text>}
                {totalPages > 7 && (
                  <Button
                    size="sm"
                    variant={currentPage === totalPages ? "solid" : "outline"}
                    colorScheme={
                      currentPage === totalPages ? "blue" : undefined
                    }
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Stack>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}
