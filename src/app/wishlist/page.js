"use client";

import NavigationBar from "@/components/navigationbar";
import { useWishlistStore, useCartStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { useAuthPrompt } from "@/components/AuthPromptContext";
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Image as ChakraImage,
  Stack,
  Text,
  useToast,
  VStack,
  Heading,
  IconButton,
  Badge,
  Divider,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { Heart, ShoppingCart, Trash2, Plus } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const authPrompt = useAuthPrompt();
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistRemove = useWishlistStore((state) => state.remove);
  const wishlistClear = useWishlistStore((state) => state.clear);
  const cartAddItem = useCartStore((state) => state.addItem);
  const cartOpen = useCartStore((state) => state.open);
  const toast = useToast();

  return (
    <>
      <NavigationBar />
      <Box minH="100vh" bg="var(--background-color)" pt={{ base: 4, md: 8 }} pb={{ base: "88px", md: 8 }}>
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          {/* Header Section */}
          <VStack spacing={6} align="stretch" mb={8}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              gap={4}
            >
              <VStack
                align={{ base: "flex-start", md: "flex-start" }}
                spacing={2}
              >
                <Heading
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight={700}
                  color="var(--color-primary)"
                  fontFamily="var(--font-serif)"
                  letterSpacing="-0.015em"
                >
                  Your Wishlist
                </Heading>
                <Text
                  color="var(--text-secondary)"
                  fontSize="sm"
                  lineHeight="1.2"
                  fontFamily="var(--font-sans)"
                >
                  {wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"} saved
                </Text>
              </VStack>

              {wishlistItems.length > 0 && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    const count = wishlistItems.length;
                    wishlistClear();
                    toast({
                      title: "Wishlist cleared",
                      description:
                        count === 1
                          ? "Removed 1 item from your wishlist."
                          : `Removed ${count} items from your wishlist.`,
                      status: "info",
                      duration: 2000,
                      isClosable: true,
                      position: "top",
                    });
                  }}
                  leftIcon={<Trash2 size={16} />}
                  _hover={{
                    bg: "red.50",
                    borderColor: "red.300",
                  }}
                >
                  Clear all
                </Button>
              )}
            </Flex>
          </VStack>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <VStack
              spacing={6}
              py={16}
              px={8}
              textAlign="center"
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
            >
              <Box p={6} borderRadius="full" bg="red.50" color="red.400">
                <Heart size={48} />
              </Box>
              <VStack spacing={3}>
                <Heading
                  fontSize="xl"
                  color="var(--text-primary)"
                  fontFamily="var(--font-serif)"
                >
                  Your wishlist is empty
                </Heading>
                <Text color="var(--text-secondary)" maxW="md" lineHeight="tall">
                  Start adding items you love to your wishlist. They'll appear
                  here for easy access later.
                </Text>
                <Button
                  as="a"
                  href="/shop"
                  colorScheme="red"
                  size="lg"
                  leftIcon={<Plus size={20} />}
                  mt={4}
                >
                  Browse Products
                </Button>
              </VStack>
            </VStack>
          ) : (
            /* Wishlist Items Grid */
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              {wishlistItems.map((item) => (
                <GridItem key={item.id}>
                  <Box
                    bg="white"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.100"
                    transition="all 0.3s ease"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "lg",
                      borderColor: "red.200",
                    }}
                    position="relative"
                  >
                    {/* Image Container */}
                    <Box position="relative" overflow="hidden">
                      {item.image && (
                        <ChakraImage
                          src={item.image}
                          alt={item.title}
                          w="100%"
                          h={{ base: "200px", md: "220px" }}
                          objectFit="cover"
                          transition="transform 0.3s ease"
                          _groupHover={{
                            transform: "scale(1.05)",
                          }}
                        />
                      )}

                      {/* Remove from wishlist button */}
                      <IconButton
                        position="absolute"
                        top={3}
                        right={3}
                        aria-label="Remove from wishlist"
                        icon={<Heart size={16} fill="currentColor" />}
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        bg="white"
                        color="red.500"
                        _hover={{
                          bg: "red.500",
                          color: "white",
                        }}
                        onClick={() => wishlistRemove(item.id)}
                        boxShadow="md"
                      />
                    </Box>

                    {/* Content */}
                    <VStack spacing={4} p={4} align="stretch">
                      <VStack spacing={2} align="stretch">
                        <Heading
                          fontSize="lg"
                          fontWeight={600}
                          color="var(--text-primary)"
                          fontFamily="var(--font-rothek)"
                          lineHeight="short"
                          noOfLines={2}
                        >
                          {item.title}
                        </Heading>

                        {item.price != null && (
                          <Text
                            fontSize="xl"
                            fontWeight={700}
                            color="var(--color-primary)"
                          >
                            ₱{Number(item.price).toFixed(2)}
                          </Text>
                        )}
                      </VStack>

                      <Divider />

                      {/* Action Buttons */}
                      <HStack spacing={2}>
                        <Button
                          flex={1}
                          colorScheme="red"
                          size="sm"
                          leftIcon={<ShoppingCart size={16} />}
                          onClick={() => {
                            if (!user) {
                              authPrompt.open(
                                "Please sign in or register to add items to your cart."
                              );
                              return;
                            }
                            const ok = cartAddItem({
                              id: item.id,
                              title: item.title,
                              price: item.price,
                              image: item.image,
                            });
                            if (ok) {
                              toast({
                                title: "Added to cart",
                                description: `${item.title} added to your cart.`,
                                status: "success",
                                duration: 2000,
                                isClosable: true,
                              });
                              cartOpen();
                            }
                          }}
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                        >
                          Add to Cart
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => wishlistRemove(item.id)}
                          _hover={{
                            bg: "red.50",
                            borderColor: "red.300",
                          }}
                        >
                          Remove
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
}
