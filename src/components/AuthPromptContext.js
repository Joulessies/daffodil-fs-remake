"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Lock } from "lucide-react";

const AuthPromptContext = createContext({
  open: (_msg) => {},
  close: () => {},
});

export function AuthPromptProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const open = (msg) => {
    setMessage(
      msg || "Please log in or register to continue with this action."
    );
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const value = useMemo(() => ({ open, close }), []);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <Modal isOpen={isOpen} onClose={close} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          borderRadius="16px"
          border="1px solid"
          borderColor="#F5C7CF"
          overflow="hidden"
          bg="white"
          boxShadow="xl"
        >
          <ModalHeader
            bg="#fffcf2"
            borderBottom="1px solid"
            borderColor="#F5C7CF"
          >
            <HStack spacing={3} align="center">
              <Box
                as={Lock}
                size={20}
                color="#bc0930"
                style={{ minWidth: 20, minHeight: 20 }}
              />
              <Text
                as="span"
                fontSize="lg"
                fontWeight="700"
                color="#bc0930"
                style={{ fontFamily: "var(--font-rothek)" }}
              >
                Sign in required
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="#bc0930" _hover={{ bg: "#fff8f3" }} />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text color="#374151" fontSize="sm">
                {message ||
                  "Please log in or register to continue with this action."}
              </Text>
              <Box
                p={3}
                bg="#fffcf2"
                border="1px solid"
                borderColor="#F5C7CF"
                borderRadius="12px"
              >
                <Text fontSize="xs" color="#5B6B73">
                  You can sign in to save items to your wishlist, checkout
                  faster, and view your orders.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <Divider borderColor="#F5C7CF" />
          <ModalFooter>
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={close}
                color="#2d3748"
                _hover={{ bg: "#fff8f3" }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                borderColor="#bc0930"
                color="#bc0930"
                onClick={() => {
                  close();
                  if (typeof window !== "undefined")
                    window.location.href = "/signup";
                }}
                _hover={{ bg: "#fff8f3", borderColor: "#bc0930" }}
                borderRadius="md"
                fontWeight="600"
              >
                Register
              </Button>
              <Button
                bg="#bc0930"
                color="white"
                onClick={() => {
                  close();
                  if (typeof window !== "undefined")
                    window.location.href = "/login";
                }}
                _hover={{
                  bg: "#a10828",
                  transform: "translateY(-1px)",
                  boxShadow: "md",
                }}
                borderRadius="md"
                fontWeight="600"
              >
                Login
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  return useContext(AuthPromptContext);
}
