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
} from "@chakra-ui/react";

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
      <Modal isOpen={isOpen} onClose={close} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in required</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="#374151" fontSize="sm">
              {message}
            </Text>
          </ModalBody>
          <ModalFooter style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                close();
                if (typeof window !== "undefined")
                  window.location.href = "/signup";
              }}
            >
              Register
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                close();
                if (typeof window !== "undefined")
                  window.location.href = "/login";
              }}
            >
              Login
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  return useContext(AuthPromptContext);
}
