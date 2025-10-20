"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  Badge,
  IconButton,
  Tooltip,
  VStack,
  Skeleton,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AdminBackButton from "@/components/AdminBackButton";
import { Star, Trash2, Check, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminReviewsPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (user && isAdmin) {
      loadReviews();
    }
  }, [user, isAdmin]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) return;

      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast({
        title: "Error loading reviews",
        description: error.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) return;

      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Review deleted",
        status: "success",
      });
      loadReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast({
        title: "Error deleting review",
        description: error.message,
        status: "error",
      });
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      !searchQuery ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.products?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedReviews = filteredReviews.slice(startIdx, startIdx + pageSize);

  if (!user || !isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return null;
  }

  return (
    <Box p={8} bg="#fffcf2" minH="100vh">
      <Box maxW="1400px" mx="auto">
        <Flex align="center" justify="space-between" mb={8}>
          <Box>
            <Heading
              size="xl"
              mb={2}
              color="#bc0930"
              style={{ fontFamily: "var(--font-rothek)" }}
            >
              Product Reviews
            </Heading>
            <Text color="#5B6B73" fontSize="md">
              Manage customer reviews and ratings
            </Text>
          </Box>
          <AdminBackButton />
        </Flex>

        <Box
          border="1px solid"
          borderColor="#F5C7CF"
          borderRadius="16px"
          p={6}
          bg="#FFF8F3"
          boxShadow="sm"
        >
          {/* Filters */}
          <HStack spacing={3} mb={6} flexWrap="wrap">
            <Input
              placeholder="Search reviews, products, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxW="400px"
              borderRadius="md"
              borderColor="#F5C7CF"
              _hover={{ borderColor: "#bc0930" }}
              _focus={{
                borderColor: "#bc0930",
                boxShadow: "0 0 0 1px #bc0930",
              }}
            />
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              maxW="200px"
              borderRadius="md"
              borderColor="#F5C7CF"
              _hover={{ borderColor: "#bc0930" }}
              _focus={{
                borderColor: "#bc0930",
                boxShadow: "0 0 0 1px #bc0930",
              }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </Select>
            <Button
              leftIcon={<MessageSquare size={16} />}
              onClick={loadReviews}
              isLoading={loading}
              variant="outline"
              borderColor="#bc0930"
              color="#bc0930"
              borderRadius="md"
              _hover={{ bg: "#fff8f3" }}
            >
              Refresh
            </Button>
          </HStack>

          <Text fontSize="sm" color="#5B6B73" mb={4}>
            Showing {paginatedReviews.length} of {filteredReviews.length}{" "}
            reviews
          </Text>

          {loading ? (
            <VStack spacing={3} align="stretch">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="100px" borderRadius="md" />
              ))}
            </VStack>
          ) : paginatedReviews.length === 0 ? (
            <Box
              textAlign="center"
              py={12}
              bg="white"
              borderRadius="12px"
              border="1px solid"
              borderColor="#f5e6e8"
            >
              <MessageSquare
                size={48}
                color="#bc0930"
                style={{ margin: "0 auto 16px" }}
              />
              <Text fontSize="lg" fontWeight="600" color="#5B6B73" mb={2}>
                No reviews found
              </Text>
              <Text fontSize="sm" color="#5B6B73">
                Try adjusting your search or filters
              </Text>
            </Box>
          ) : (
            <Box
              bg="white"
              borderRadius="12px"
              overflow="hidden"
              border="1px solid"
              borderColor="#f5e6e8"
            >
              <Table size="md" variant="simple">
                <Thead bg="#fff">
                  <Tr>
                    <Th
                      py={4}
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Product
                    </Th>
                    <Th
                      py={4}
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Customer
                    </Th>
                    <Th
                      py={4}
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Rating
                    </Th>
                    <Th
                      py={4}
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Review
                    </Th>
                    <Th
                      py={4}
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Date
                    </Th>
                    <Th
                      py={4}
                      textAlign="right"
                      color="#5B6B73"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedReviews.map((review) => (
                    <Tr
                      key={review.id}
                      _hover={{ bg: "#fffcf2" }}
                      transition="all 0.2s"
                      borderBottom="1px solid"
                      borderColor="#f5e6e8"
                    >
                      <Td py={4}>
                        <Text fontWeight="600" fontSize="sm" color="gray.700">
                          {review.products?.title || "Unknown Product"}
                        </Text>
                      </Td>
                      <Td py={4}>
                        <HStack spacing={2}>
                          <Avatar
                            size="sm"
                            name={review.user_email}
                            bg="#bc0930"
                            color="white"
                          />
                          <Text fontSize="sm" color="#5B6B73">
                            {review.user_email || "Anonymous"}
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={4}>
                        <HStack spacing={1}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={14}
                              fill={n <= review.rating ? "#f59e0b" : "none"}
                              color={n <= review.rating ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                          <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="#5B6B73"
                            ml={1}
                          >
                            ({review.rating}/5)
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={4} maxW="300px">
                        <Text fontSize="sm" color="#5B6B73" noOfLines={2}>
                          {review.content}
                        </Text>
                      </Td>
                      <Td py={4}>
                        <Text fontSize="xs" color="#5B6B73">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td textAlign="right" py={4}>
                        <HStack spacing={2} justify="flex-end">
                          <Tooltip label="Delete review" hasArrow>
                            <IconButton
                              size="sm"
                              variant="solid"
                              colorScheme="red"
                              icon={<Trash2 size={16} />}
                              onClick={() => deleteReview(review.id)}
                              borderRadius="md"
                              _hover={{
                                transform: "translateY(-1px)",
                                boxShadow: "md",
                              }}
                              transition="all 0.2s"
                              aria-label="Delete"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Pagination */}
          <Flex
            justify="space-between"
            align="center"
            mt={5}
            pt={4}
            borderTop="1px solid"
            borderColor="#f5e6e8"
            flexWrap="wrap"
            gap={3}
          >
            <HStack spacing={2}>
              <Text fontSize="sm" color="#5B6B73">
                Rows per page:
              </Text>
              <Select
                size="sm"
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                w="80px"
                borderRadius="md"
                borderColor="#bc0930"
                _focus={{
                  borderColor: "#bc0930",
                  boxShadow: "0 0 0 1px #bc0930",
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </Select>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor="#bc0930"
                color="#bc0930"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                borderRadius="md"
                _hover={{
                  bg: "#fff8f3",
                }}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="#bc0930"
                color="#bc0930"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                borderRadius="md"
                _hover={{
                  bg: "#fff8f3",
                }}
              >
                Next
              </Button>
            </HStack>

            <Text fontSize="sm" color="#5B6B73" fontWeight="500">
              Page {currentPage} of {totalPages}
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
