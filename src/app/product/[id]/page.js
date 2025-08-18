"use client";

import { useMemo } from "react";
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
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const cart = useCart();
  const wishlist = useWishlist();
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const productId = String(params?.id || "");
  const product = useMemo(() => findProductById(productId), [productId]);

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
      <Box maxW={1100} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          <GridItem>
            <Stack spacing={3}>
              {(product.images || []).map((src, i) => (
                <ChakraImage
                  key={src + i}
                  src={src}
                  alt={product.title}
                  borderRadius={12}
                  objectFit="cover"
                  w="100%"
                />
              ))}
            </Stack>
          </GridItem>
          <GridItem>
            <Stack spacing={3}>
              <Text
                fontSize="2xl"
                fontWeight={700}
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                {product.title}
              </Text>
              <Text color="#5B6B73">
                PHP {Number(product.price).toFixed(2)}
              </Text>
              <Text>{product.description}</Text>
              <HStack spacing={3} mt={2}>
                <Button
                  colorScheme="red"
                  onClick={() =>
                    cart.addItem({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.images?.[0],
                    })
                  }
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    wishlist.toggle({
                      id: product.id,
                      title: product.title,
                      image: product.images?.[0],
                      price: product.price,
                    })
                  }
                >
                  Save to Wishlist
                </Button>
              </HStack>

              {/* Reviews */}
              <Box mt={6}>
                <Text
                  fontWeight={700}
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Reviews
                </Text>
                {reviews.length === 0 ? (
                  <Text color="#5B6B73">No reviews yet.</Text>
                ) : (
                  <Stack spacing={2} mt={2}>
                    {reviews.map((r) => (
                      <Box
                        key={r.id}
                        border="1px solid #efefef"
                        p={3}
                        borderRadius={8}
                      >
                        <HStack justify="space-between">
                          <Text>Rating: {r.rating}/5</Text>
                          <Text color="#5B6B73" fontSize="sm">
                            {new Date(r.created_at).toLocaleString()}
                          </Text>
                        </HStack>
                        <Text mt={1}>{r.content}</Text>
                      </Box>
                    ))}
                  </Stack>
                )}
                <Box mt={4}>
                  <HStack>
                    <InputRating value={rating} onChange={setRating} />
                  </HStack>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      marginTop: 8,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Button
                    mt={2}
                    onClick={submitReview}
                    isLoading={submitting}
                    colorScheme="red"
                  >
                    Submit Review
                  </Button>
                </Box>
              </Box>
            </Stack>
          </GridItem>
        </Grid>
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
