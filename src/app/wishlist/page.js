"use client";

import NavigationBar from "@/components/navigationbar";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
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
} from "@chakra-ui/react";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const cart = useCart();
  const toast = useToast();

  return (
    <>
      <NavigationBar />
      <Box maxW={1100} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <HStack justify="space-between" mb={6}>
          <Text
            fontSize="xl"
            fontWeight={700}
            style={{ fontFamily: "var(--font-rothek)" }}
          >
            Your Wishlist
          </Text>
          <Button
            variant="outline"
            onClick={wishlist.clear}
            isDisabled={wishlist.items.length === 0}
          >
            Clear all
          </Button>
        </HStack>

        {wishlist.items.length === 0 ? (
          <Box
            border="1px solid #EFEFEF"
            borderRadius={12}
            p={8}
            textAlign="center"
            bg="#fff"
          >
            <Text color="#5B6B73">No saved items yet.</Text>
          </Box>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            {wishlist.items.map((it) => (
              <GridItem key={it.id}>
                <Box
                  border="1px solid #EFEFEF"
                  borderRadius={12}
                  p={4}
                  bg="#fff"
                >
                  {it.image && (
                    <ChakraImage
                      src={it.image}
                      alt={it.title}
                      borderRadius={8}
                      mb={3}
                      objectFit="cover"
                      w="100%"
                      h="180px"
                    />
                  )}
                  <Stack spacing={2}>
                    <Text fontWeight={600}>{it.title}</Text>
                    {it.price != null && (
                      <Text color="#5B6B73" fontSize="sm">
                        PHP {Number(it.price).toFixed(2)}
                      </Text>
                    )}
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          const ok = cart.addItem({
                            id: it.id,
                            title: it.title,
                            price: it.price,
                            image: it.image,
                          });
                          if (ok) {
                            toast({
                              title: "Added to cart",
                              description: `${it.title} added to your cart.`,
                              status: "success",
                              duration: 2000,
                            });
                          }
                        }}
                      >
                        Add to cart
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => wishlist.remove(it.id)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  </Stack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}
