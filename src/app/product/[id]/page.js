"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import NavigationBar from "@/components/navigationbar";
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image as ChakraImage,
  Stack,
  Text,
} from "@chakra-ui/react";
import { findProductById } from "@/lib/products";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useEffect as useEffect2, useState as useState2 } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const cart = useCart();
  const wishlist = useWishlist();
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [dbProduct, setDbProduct] = useState(null);

  const productId = String(params?.id || "");
  const product = useMemo(() => {
    if (dbProduct) return dbProduct;
    return findProductById(productId);
  }, [dbProduct, productId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!productId) return;
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data } = await supabase
          .from("products")
          .select(
            "id, title, description, price, category, status, stock, images"
          )
          .eq("id", productId)
          .maybeSingle();
        if (mounted && data) setDbProduct(data);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  // Load reviews for this product id
  useEffect(() => {
    let mounted = true;
    if (!productId) return;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data } = await supabase
          .from("reviews")
          .select("id, rating, content, user_email, created_at")
          .eq("product_id", productId)
          .order("created_at", { ascending: false });
        if (mounted) setReviews(data || []);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (!product) {
    return (
      <>
        <NavigationBar />
        <Box maxW={900} mx="auto" px={{ base: 4, md: 6 }} py={8}>
          <Text>Product not found.</Text>
        </Box>
      </>
    );
  }

  const submitReview = async () => {
    try {
      setSubmitting(true);
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) throw new Error("Supabase not configured");
      const userRes = await supabase.auth.getUser();
      const email = userRes?.data?.user?.email || null;
      const { error, data } = await supabase
        .from("reviews")
        .insert({
          product_id: product.id,
          rating,
          content: reviewText,
          user_email: email,
        })
        .select();
      if (error) throw error;
      setReviews((prev) => [data[0], ...prev]);
      setReviewText("");
      setRating(5);
    } catch (err) {
      // no-op in UI; could add toast
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Box bg="#fffcf2" minH="100vh" py={8}>
        <Box maxW={1200} mx="auto" px={{ base: 4, md: 6 }}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
            <GridItem>
              <Stack spacing={3}>
                {(product.images || []).map((src, i) => (
                  <Box
                    key={src + i}
                    border="1px solid"
                    borderColor="#F5C7CF"
                    borderRadius={16}
                    overflow="hidden"
                    bg="white"
                    boxShadow="0 4px 12px rgba(0,0,0,0.04)"
                  >
                    <ChakraImage
                      src={src}
                      alt={product.title}
                      borderRadius={0}
                      objectFit="cover"
                      w="100%"
                    />
                  </Box>
                ))}
              </Stack>
            </GridItem>
            <GridItem>
              <Box
                border="1px solid"
                borderColor="#F5C7CF"
                borderRadius={16}
                p={6}
                bg="white"
                boxShadow="0 4px 12px rgba(0,0,0,0.04)"
                h="fit-content"
                position="sticky"
                top={4}
              >
                <Stack spacing={4}>
                  <Text
                    fontSize="3xl"
                    fontWeight={700}
                    color="#2B2B2B"
                    style={{ fontFamily: "var(--font-rothek)" }}
                  >
                    {product.title}
                  </Text>
                  <Text fontSize="2xl" color="#bc0930" fontWeight="700">
                    ₱{Number(product.price).toFixed(2)}
                  </Text>
                  <Text color="#5B6B73" fontSize="md" lineHeight="1.7">
                    {product.description}
                  </Text>
                  <HStack spacing={3} mt={4}>
                    <Button
                      flex={1}
                      size="lg"
                      bg="#bc0930"
                      color="white"
                      onClick={() =>
                        cart.addItem({
                          id: product.id,
                          title: product.title,
                          price: product.price,
                          image: product.images?.[0],
                        })
                      }
                      _hover={{
                        bg: "#a10828",
                        transform: "translateY(-1px)",
                        boxShadow: "md",
                      }}
                      borderRadius="md"
                      fontWeight="600"
                      transition="all 0.2s"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      flex={1}
                      size="lg"
                      variant="outline"
                      borderColor="#bc0930"
                      color="#bc0930"
                      onClick={() =>
                        wishlist.toggle({
                          id: product.id,
                          title: product.title,
                          image: product.images?.[0],
                          price: product.price,
                        })
                      }
                      _hover={{
                        bg: "#fff8f3",
                      }}
                      borderRadius="md"
                      fontWeight="600"
                    >
                      Save to Wishlist
                    </Button>
                  </HStack>

                  {/* Reviews */}
                  <Box
                    mt={6}
                    pt={6}
                    borderTop="1px solid"
                    borderColor="#f5e6e8"
                  >
                    <Text
                      fontSize="xl"
                      fontWeight={700}
                      mb={4}
                      color="#bc0930"
                      style={{ fontFamily: "var(--font-rothek)" }}
                    >
                      Customer Reviews
                    </Text>
                    {reviews.length === 0 ? (
                      <Box
                        textAlign="center"
                        py={6}
                        bg="#fffcf2"
                        borderRadius={12}
                      >
                        <Text color="#5B6B73">
                          No reviews yet. Be the first to review!
                        </Text>
                      </Box>
                    ) : (
                      <Stack spacing={3} mt={3}>
                        {reviews.map((r) => (
                          <Box
                            key={r.id}
                            border="1px solid"
                            borderColor="#f5e6e8"
                            p={4}
                            borderRadius={12}
                            bg="#fffcf2"
                          >
                            <HStack justify="space-between" mb={2}>
                              <HStack spacing={1}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Box
                                    key={n}
                                    w="16px"
                                    h="16px"
                                    borderRadius={2}
                                    bg={n <= r.rating ? "#f59e0b" : "#e5e7eb"}
                                  />
                                ))}
                              </HStack>
                              <Text color="#5B6B73" fontSize="xs">
                                {new Date(r.created_at).toLocaleDateString()}
                              </Text>
                            </HStack>
                            <Text color="#2B2B2B" fontSize="sm">
                              {r.content}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    )}
                    <Box mt={5}>
                      <Text
                        fontSize="md"
                        fontWeight={600}
                        mb={3}
                        color="#2B2B2B"
                      >
                        Write a Review
                      </Text>
                      <HStack mb={3}>
                        <Text fontSize="sm" color="#5B6B73">
                          Your Rating:
                        </Text>
                        <InputRating value={rating} onChange={setRating} />
                      </HStack>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your thoughts about this product..."
                        style={{
                          width: "100%",
                          padding: 12,
                          borderRadius: 8,
                          border: "1px solid #F5C7CF",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          resize: "vertical",
                        }}
                      />
                      <Button
                        mt={3}
                        onClick={submitReview}
                        isLoading={submitting}
                        bg="#bc0930"
                        color="white"
                        _hover={{
                          bg: "#a10828",
                        }}
                        borderRadius="md"
                        fontWeight="600"
                      >
                        Submit Review
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

function InputRating({ value, onChange }) {
  return (
    <HStack>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          aria-label={`Rate ${n}`}
          onClick={() => onChange(n)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: n <= value ? "#f59e0b" : "#e5e7eb",
            border: "1px solid #d1d5db",
          }}
        />
      ))}
    </HStack>
  );
}
