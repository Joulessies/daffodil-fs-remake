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
import styles from "./ContactPage.module.scss";

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
      toast({ title: "Message sent!", status: "success" });
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
      <Box className={styles.contactContainer}>
        <Heading className={styles.heading}>Contact Us</Heading>
        <form onSubmit={onSubmit} className={styles.form}>
          <FormControl className={styles.formControl} isRequired>
            <FormLabel>Your Name</FormLabel>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl className={styles.formControl} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl className={styles.formControl} isRequired>
            <FormLabel>Message</FormLabel>
            <Textarea
              rows={5}
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            className={styles.submitBtn}
            colorScheme="red"
            isLoading={sending}
            isDisabled={!name || !email || !message}
          >
            Send
          </Button>
        </form>
      </Box>
    </>
  );
}
