"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image as ChakraImage,
  Stack,
  Heading,
  Divider,
  Badge,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Grid,
  GridItem,
  Textarea,
  useToast,
  VStack,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { ShoppingCart, Heart, Star, ZoomIn, X } from "lucide-react";

export default function ProductDetailsModal({ isOpen, onClose, product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  // Load reviews when product changes
  useEffect(() => {
    if (!product?.id || !isOpen) return;
    let mounted = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data } = await supabase
          .from("reviews")
          .select("id, rating, content, user_email, created_at")
          .eq("product_id", product.id)
          .order("created_at", { ascending: false });
        if (mounted) setReviews(data || []);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [product?.id, isOpen]);

  if (!product) return null;

  const handleAddToCart = () => {
    const success = cart.addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || product.image,
      quantity: quantity,
    });
    if (success) {
      toast({
        title: "Added to cart",
        description: `${quantity} ${product.title} added to your cart.`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleToggleWishlist = () => {
    const itemId = product.id;
    wishlist.toggle({
      id: itemId,
      title: product.title,
      image: product.images?.[0] || product.image,
      price: product.price,
    });
    const isInWishlist = wishlist.items.some((item) => item.id === itemId);
    toast({
      title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      status: isInWishlist ? "info" : "success",
      duration: 1500,
      isClosable: true,
      position: "top",
    });
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Please write a review",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

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
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setImageModalOpen(true);
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  const isInWishlist = wishlist.items.some((item) => item.id === product.id);
  const productImages =
    product.images || (product.image ? [product.image] : []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          maxH="90vh"
          bg="#FFF8F3"
          borderRadius="20px"
          border="2px solid #F5C7CF"
          boxShadow="2xl"
        >
          <ModalHeader
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            fontSize="2xl"
            pt={6}
          >
            Product Details
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            color="#bc0930"
            _hover={{ bg: "rgba(188, 9, 48, 0.1)" }}
          />
          <ModalBody pb={6}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={6}
              mb={4}
            >
              {/* Left side - Images */}
              <GridItem>
                <Stack spacing={3}>
                  {productImages.length > 0 ? (
                    productImages.map((src, i) => (
                      <Box
                        key={src + i}
                        position="relative"
                        borderRadius="16px"
                        overflow="hidden"
                        border="1px solid #F5C7CF"
                        boxShadow="md"
                        cursor="pointer"
                        _hover={{ transform: "scale(1.02)" }}
                        transition="all 0.3s"
                        onClick={() => openImageModal(src)}
                      >
                        <ChakraImage
                          src={src}
                          alt={product.title}
                          objectFit="cover"
                          w="100%"
                          h={{ base: "250px", md: "300px" }}
                        />
                        <IconButton
                          icon={<ZoomIn size={18} />}
                          position="absolute"
                          top={3}
                          right={3}
                          size="sm"
                          colorScheme="whiteAlpha"
                          bg="rgba(255,255,255,0.9)"
                          _hover={{ bg: "white" }}
                          aria-label="Zoom image"
                        />
                      </Box>
                    ))
                  ) : (
                    <Box
                      borderRadius="16px"
                      border="1px solid #F5C7CF"
                      p={8}
                      textAlign="center"
                      bg="white"
                    >
                      <Text color="#5B6B73">No images available</Text>
                    </Box>
                  )}
                </Stack>
              </GridItem>

              {/* Right side - Product Info */}
              <GridItem>
                <Stack spacing={4}>
                  <Box>
                    <Heading
                      as="h2"
                      fontSize={{ base: "xl", md: "2xl" }}
                      color="#bc0930"
                      style={{ fontFamily: "var(--font-rothek)" }}
                      mb={2}
                    >
                      {product.title}
                    </Heading>
                    {product.category && (
                      <Badge
                        colorScheme="pink"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {product.category}
                      </Badge>
                    )}
                  </Box>

                  {/* Rating */}
                  {reviews.length > 0 && (
                    <HStack spacing={2}>
                      <HStack spacing={1}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= averageRating ? "#f59e0b" : "none"}
                            color={
                              star <= averageRating ? "#f59e0b" : "#d1d5db"
                            }
                          />
                        ))}
                      </HStack>
                      <Text color="#5B6B73" fontSize="sm">
                        {averageRating} ({reviews.length} reviews)
                      </Text>
                    </HStack>
                  )}

                  <Divider borderColor="#F5C7CF" />

                  <Box>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="#bc0930"
                      style={{ fontFamily: "var(--font-rothek)" }}
                    >
                      ₱{Number(product.price).toFixed(2)}
                    </Text>
                    {product.stock !== undefined && (
                      <Text color="#5B6B73" fontSize="sm" mt={1}>
                        {product.stock > 10
                          ? "In Stock"
                          : product.stock > 0
                          ? `Only ${product.stock} left!`
                          : "Out of Stock"}
                      </Text>
                    )}
                  </Box>

                  {product.description && (
                    <Text color="#5B6B73" lineHeight="1.6" fontSize="sm">
                      {product.description}
                    </Text>
                  )}

                  <Divider borderColor="#F5C7CF" />

                  {/* Quantity Selector */}
                  <Box>
                    <Text fontWeight="600" mb={2} color="#5B6B73" fontSize="sm">
                      Quantity
                    </Text>
                    <NumberInput
                      value={quantity}
                      onChange={(valueString) =>
                        setQuantity(parseInt(valueString) || 1)
                      }
                      min={1}
                      max={product.stock || 99}
                      maxW="120px"
                      size="sm"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>

                  {/* Action Buttons */}
                  <HStack spacing={3} pt={2}>
                    <Button
                      leftIcon={<ShoppingCart size={16} />}
                      colorScheme="red"
                      bg="#bc0930"
                      size="md"
                      flex={1}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                      transition="all 0.3s ease"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      icon={
                        <Heart
                          size={18}
                          fill={isInWishlist ? "#bc0930" : "none"}
                        />
                      }
                      colorScheme={isInWishlist ? "red" : "gray"}
                      variant={isInWishlist ? "solid" : "outline"}
                      size="md"
                      onClick={handleToggleWishlist}
                      aria-label="Add to wishlist"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                      }}
                      transition="all 0.3s ease"
                    />
                  </HStack>
                </Stack>
              </GridItem>
            </Grid>

            <Divider borderColor="#F5C7CF" my={6} />

            {/* Reviews Section */}
            <Box>
              <Heading
                as="h3"
                fontSize="lg"
                mb={4}
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Customer Reviews
              </Heading>

              {/* Add Review Form */}
              <Box
                p={4}
                bg="white"
                borderRadius="12px"
                border="1px solid #F5C7CF"
                mb={4}
              >
                <Text fontWeight="600" mb={2} color="#5B6B73" fontSize="sm">
                  Write a Review
                </Text>
                <HStack mb={3}>
                  <InputRating value={rating} onChange={setRating} />
                </HStack>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  mb={3}
                  size="sm"
                  borderColor="#F5C7CF"
                  _focus={{ borderColor: "#bc0930" }}
                />
                <Button
                  onClick={submitReview}
                  isLoading={submitting}
                  colorScheme="red"
                  bg="#bc0930"
                  size="sm"
                >
                  Submit Review
                </Button>
              </Box>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <Text
                  color="#5B6B73"
                  textAlign="center"
                  py={4}
                  fontSize="sm"
                  fontStyle="italic"
                >
                  No reviews yet. Be the first to review!
                </Text>
              ) : (
                <VStack
                  spacing={3}
                  align="stretch"
                  maxH="300px"
                  overflowY="auto"
                >
                  {reviews.map((r) => (
                    <Box
                      key={r.id}
                      p={3}
                      bg="white"
                      borderRadius="12px"
                      border="1px solid #F5C7CF"
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={1}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= r.rating ? "#f59e0b" : "none"}
                              color={star <= r.rating ? "#f59e0b" : "#d1d5db"}
                            />
                          ))}
                        </HStack>
                        <Text color="#5B6B73" fontSize="xs">
                          {new Date(r.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text color="#5B6B73" fontSize="sm">
                        {r.content}
                      </Text>
                      {r.user_email && (
                        <Text
                          color="#5B6B73"
                          fontSize="xs"
                          mt={1}
                          fontStyle="italic"
                        >
                          By {r.user_email.split("@")[0]}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        size="6xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
        <ModalContent maxH="90vh" bg="transparent" boxShadow="none">
          <ModalCloseButton
            color="white"
            bg="rgba(0,0,0,0.6)"
            _hover={{ bg: "rgba(0,0,0,0.8)" }}
            size="lg"
            icon={<X />}
          />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {selectedImage && (
              <ChakraImage
                src={selectedImage}
                alt={product.title}
                maxH="85vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="8px"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function InputRating({ value, onChange }) {
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconButton
          key={n}
          icon={
            <Star
              size={18}
              fill={n <= value ? "#f59e0b" : "none"}
              color={n <= value ? "#f59e0b" : "#d1d5db"}
            />
          }
          onClick={() => onChange(n)}
          variant="ghost"
          size="sm"
          aria-label={`Rate ${n} stars`}
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.2s"
        />
      ))}
    </HStack>
  );
}
