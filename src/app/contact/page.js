"use client";

import { useMemo, useState } from "react";
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
  FormErrorMessage,
} from "@chakra-ui/react";
import styles from "./ContactPage.module.scss";

export default function ContactPage() {
  const toast = useToast();
  const publicSupportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@daffodilflower.page";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState({});
  const [botField, setBotField] = useState(""); // honeypot

  const errors = useMemo(() => {
    const next = {};
    if (!name.trim()) next.name = "Name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) next.email = "Email is required";
    else if (!emailRegex.test(email)) next.email = "Enter a valid email";
    if (!subject.trim()) next.subject = "Subject is required";
    if (!message.trim() || message.trim().length < 10)
      next.message = "Please provide at least 10 characters";
    return next;
  }, [name, email, subject, message]);

  const isFormInvalid = Object.keys(errors).length > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (botField) return; // silently drop bots
      setSending(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      toast({ title: "Message sent!", status: "success" });
      setName("");
      setEmail("");
      setSubject("");
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
      <Box className={styles.pageWrapper}>
        <Box className={styles.contactContainer}>
          <div className={styles.pageHeader}>
            <p className={styles.eyebrow}>Get in touch</p>
            <Heading className={styles.heading}>Contact Us</Heading>
            <p className={styles.subheading}>
              We typically respond within 24 hours. Fill out the form and our
              team will get back to you.
            </p>
          </div>

          <div className={styles.contentGrid}>
            <section
              className={styles.infoSection}
              aria-label="Contact information"
            >
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📧</div>
                <div>
                  <h3 className={styles.infoTitle}>Email</h3>
                  <p className={styles.infoText}>{publicSupportEmail}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📍</div>
                <div>
                  <h3 className={styles.infoTitle}>Location</h3>
                  <p className={styles.infoText}>
                    TIP QC, Aurora Blvd, Cubao, Quezon City, Philippines
                  </p>
                </div>
              </div>
              <div className={styles.hours}>
                <h4>Business Hours</h4>
                <p>Mon–Fri: 9:00 AM – 6:00 PM</p>
                <p>Sat: 10:00 AM – 4:00 PM</p>
              </div>
            </section>

            <section
              className={styles.formSection}
              aria-label="Send us a message"
            >
              <form onSubmit={onSubmit} className={styles.form} noValidate>
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className={styles.srOnly}
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  aria-hidden="true"
                />

                <FormControl
                  className={styles.formControl}
                  isRequired
                  isInvalid={touched.name && Boolean(errors.name)}
                >
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl
                  className={styles.formControl}
                  isRequired
                  isInvalid={touched.email && Boolean(errors.email)}
                >
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl
                  className={styles.formControl}
                  isRequired
                  isInvalid={touched.subject && Boolean(errors.subject)}
                >
                  <FormLabel>Subject</FormLabel>
                  <Input
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                  />
                  <FormErrorMessage>{errors.subject}</FormErrorMessage>
                </FormControl>

                <FormControl
                  className={styles.formControl}
                  isRequired
                  isInvalid={touched.message && Boolean(errors.message)}
                >
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    rows={5}
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  />
                  <FormErrorMessage>{errors.message}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  className={styles.submitBtn}
                  colorScheme="red"
                  isLoading={sending}
                  isDisabled={isFormInvalid || sending}
                >
                  Send
                </Button>
              </form>
            </section>
          </div>
        </Box>
      </Box>
    </>
  );
}
