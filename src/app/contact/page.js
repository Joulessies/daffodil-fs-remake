"use client";

import { useState } from "react";
import NavigationBar from "@/components/navigationbar";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";

export default function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      toast({ title: "Message sent", status: "success" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast({
        title: "Unable to send",
        description: err.message,
        status: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Box maxW={820} mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Heading size="lg" mb={4} style={{ fontFamily: "var(--font-rothek)" }}>
          Contact Us
        </Heading>
        <form onSubmit={onSubmit}>
          <FormControl mb={3} isRequired>
            <FormLabel>Your Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Message</FormLabel>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="red" isLoading={sending}>
            Send
          </Button>
        </form>
      </Box>
    </>
  );
}
