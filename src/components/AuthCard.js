"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { isAdminEmail } from "../lib/admin";
import { useAuth } from "./AuthProvider";
import { AlertCircle, Eye, EyeOff, LogOut } from "lucide-react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Heading,
} from "@chakra-ui/react";

export default function AuthCard({ mode = "login" }) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeMode, setActiveMode] = useState(
    mode === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    setActiveMode(mode === "signup" ? "signup" : "login");
  }, [mode]);

  const isSignup = activeMode === "signup";
  const isLoggedIn = !!user;
  const adminDetected = isAdminEmail((email || "").trim());

  const currentUserDisplay = useMemo(() => {
    const meta = user?.user_metadata || {};
    const name =
      meta.full_name ||
      (meta.first_name || meta.last_name
        ? `${meta.first_name || ""} ${meta.last_name || ""}`.trim()
        : "") ||
      meta.name ||
      "";
    const emailAddr = user?.email || "";
    return name ? `${name} (${emailAddr})` : emailAddr;
  }, [user]);

  function validateFields() {
    const errors = {
      email: "",
      password: "",
      passwordConfirm: "",
      firstName: "",
      lastName: "",
    };
    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      errors.email = "Enter a valid email";

    if (isSignup) {
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "Minimum 6 characters";
      if (!passwordConfirm) errors.passwordConfirm = "Confirm your password";
      else if (passwordConfirm !== password)
        errors.passwordConfirm = "Passwords do not match";

      if (trimmedEmail.toLowerCase() === "john.doe@example.com") {
        errors.email = "An account with this email already exists.";
      }
    } else {
      if (!password) errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return errors;
  }

  const hasErrors = (errs) => Object.values(errs).some((m) => !!m);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!supabase) {
      setFormError("Auth is not configured. Please try again later.");
      return;
    }
    if (isLoggedIn) {
      setFormError("You're already signed in. Please sign out to continue.");
      return;
    }
    const errs = validateFields();
    if (hasErrors(errs)) return;

    try {
      setIsSubmitting(true);
      const trimmedEmail = (email || "").trim();
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          const msg = /already/i.test(error.message)
            ? "An account with this email already exists."
            : error.message;
          setFormError(msg);
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to confirm your account.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) setFormError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      bg="#fffcf2"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={4}
    >
      <Box
        w="100%"
        maxW="420px"
        bg="white"
        borderRadius="16px"
        boxShadow="lg"
        border="2px solid"
        borderColor="#F5C7CF"
        p={8}
      >
        {isLoggedIn && (
          <Alert
            status="info"
            borderRadius="12px"
            mb={4}
            bg="#fffcf2"
            border="1px solid"
            borderColor="#F5C7CF"
          >
            <AlertIcon color="#bc0930" />
            <Text fontSize="sm" color="#2B2B2B">
              You are already signed in as <strong>{currentUserDisplay}</strong>
              . Forms are disabled. Use Sign Out or Switch User to continue.
            </Text>
          </Alert>
        )}

        <VStack spacing={6} align="center">
          <Image
            src="/images/logo.svg"
            alt="Daffodil"
            width={120}
            height={120}
          />
          <Heading
            fontSize="2xl"
            color="#bc0930"
            style={{ fontFamily: "var(--font-rothek)" }}
            textAlign="center"
          >
            {isSignup ? "Create your account" : "Welcome back"}
          </Heading>

          {/* Mode Toggle */}
          <HStack
            bg="#fffcf2"
            borderRadius="12px"
            p={1}
            border="1px solid"
            borderColor="#F5C7CF"
            spacing={0}
          >
            {[
              { key: "login", label: "Login" },
              { key: "signup", label: "Register" },
            ].map((tab) => {
              const selected = activeMode === tab.key;
              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveMode(tab.key)}
                  disabled={isLoggedIn}
                  bg={selected ? "white" : "transparent"}
                  color="#2B2B2B"
                  borderRadius="10px"
                  fontWeight="600"
                  fontSize="sm"
                  px={4}
                  py={2}
                  boxShadow={selected ? "sm" : "none"}
                  border="none"
                  _hover={{
                    bg: selected ? "white" : "#fffcf2",
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </HStack>
        </VStack>

        <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
          {!!formError && (
            <Alert
              status="error"
              borderRadius="12px"
              mb={4}
              bg="#fffcf2"
              border="1px solid"
              borderColor="#F5C7CF"
            >
              <AlertIcon color="#bc0930" />
              <Text fontSize="sm" color="#bc0930">
                {formError}
              </Text>
            </Alert>
          )}

          <VStack spacing={4}>
            {isSignup && (
              <>
                <FormControl isInvalid={!!fieldErrors.firstName}>
                  <FormLabel fontSize="sm" color="#2B2B2B" fontWeight="500">
                    First name*
                  </FormLabel>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName)
                        setFieldErrors({ ...fieldErrors, firstName: "" });
                    }}
                    placeholder="e.g. John"
                    disabled={isLoggedIn || isSubmitting}
                    borderColor="#F5C7CF"
                    borderRadius="12px"
                    _hover={{
                      borderColor: "#bc0930",
                    }}
                    _focus={{
                      borderColor: "#bc0930",
                      boxShadow: "0 0 0 1px #bc0930",
                    }}
                    _invalid={{
                      borderColor: "#bc0930",
                    }}
                  />
                  {fieldErrors.firstName && (
                    <Text fontSize="xs" color="#bc0930" mt={1}>
                      {fieldErrors.firstName}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!fieldErrors.lastName}>
                  <FormLabel fontSize="sm" color="#2B2B2B" fontWeight="500">
                    Last name*
                  </FormLabel>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName)
                        setFieldErrors({ ...fieldErrors, lastName: "" });
                    }}
                    placeholder="e.g. Doe"
                    disabled={isLoggedIn || isSubmitting}
                    borderColor="#F5C7CF"
                    borderRadius="12px"
                    _hover={{
                      borderColor: "#bc0930",
                    }}
                    _focus={{
                      borderColor: "#bc0930",
                      boxShadow: "0 0 0 1px #bc0930",
                    }}
                    _invalid={{
                      borderColor: "#bc0930",
                    }}
                  />
                  {fieldErrors.lastName && (
                    <Text fontSize="xs" color="#bc0930" mt={1}>
                      {fieldErrors.lastName}
                    </Text>
                  )}
                </FormControl>
              </>
            )}

            <FormControl isInvalid={!!fieldErrors.email}>
              <FormLabel fontSize="sm" color="#2B2B2B" fontWeight="500">
                Email address*
              </FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors({ ...fieldErrors, email: "" });
                }}
                placeholder="you@example.com"
                disabled={isLoggedIn || isSubmitting}
                borderColor="#F5C7CF"
                borderRadius="12px"
                _hover={{
                  borderColor: "#bc0930",
                }}
                _focus={{
                  borderColor: "#bc0930",
                  boxShadow: "0 0 0 1px #bc0930",
                }}
                _invalid={{
                  borderColor: "#bc0930",
                }}
                required
              />
              {fieldErrors.email && (
                <Text fontSize="xs" color="#bc0930" mt={1}>
                  {fieldErrors.email}
                </Text>
              )}
              {adminDetected && !fieldErrors.email && (
                <Text fontSize="xs" color="#2f855a" mt={1}>
                  Admin email detected. You will have admin access after login.
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!fieldErrors.password}>
              <FormLabel fontSize="sm" color="#2B2B2B" fontWeight="500">
                Password*
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  placeholder={isSignup ? "Create a password" : "Your password"}
                  disabled={isLoggedIn || isSubmitting}
                  borderColor="#F5C7CF"
                  borderRadius="12px"
                  _hover={{
                    borderColor: "#bc0930",
                  }}
                  _focus={{
                    borderColor: "#bc0930",
                    boxShadow: "0 0 0 1px #bc0930",
                  }}
                  _invalid={{
                    borderColor: "#bc0930",
                  }}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    icon={
                      showPassword ? <EyeOff size={18} /> : <Eye size={18} />
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoggedIn || isSubmitting}
                    variant="ghost"
                    size="sm"
                    color="#5B6B73"
                    _hover={{
                      bg: "#fffcf2",
                      color: "#bc0930",
                    }}
                  />
                </InputRightElement>
              </InputGroup>
              {fieldErrors.password && (
                <Text fontSize="xs" color="#bc0930" mt={1}>
                  {fieldErrors.password}
                </Text>
              )}
            </FormControl>

            {isSignup && (
              <FormControl isInvalid={!!fieldErrors.passwordConfirm}>
                <FormLabel fontSize="sm" color="#2B2B2B" fontWeight="500">
                  Confirm password*
                </FormLabel>
                <Input
                  id="passwordConfirm"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (fieldErrors.passwordConfirm)
                      setFieldErrors({ ...fieldErrors, passwordConfirm: "" });
                  }}
                  placeholder="Re-enter your password"
                  disabled={isLoggedIn || isSubmitting}
                  borderColor="#F5C7CF"
                  borderRadius="12px"
                  _hover={{
                    borderColor: "#bc0930",
                  }}
                  _focus={{
                    borderColor: "#bc0930",
                    boxShadow: "0 0 0 1px #bc0930",
                  }}
                  _invalid={{
                    borderColor: "#bc0930",
                  }}
                  required
                />
                {fieldErrors.passwordConfirm && (
                  <Text fontSize="xs" color="#bc0930" mt={1}>
                    {fieldErrors.passwordConfirm}
                  </Text>
                )}
              </FormControl>
            )}

            <Button
              type="submit"
              disabled={isLoggedIn || isSubmitting}
              bg="#bc0930"
              color="white"
              size="lg"
              borderRadius="12px"
              fontWeight="600"
              w="100%"
              _hover={{
                bg: "#a10828",
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              _disabled={{
                bg: "#9ca3af",
                cursor: "not-allowed",
                transform: "none",
                boxShadow: "none",
              }}
              transition="all 0.2s"
              mt={2}
            >
              {isSubmitting
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                ? "Create account"
                : "Sign in"}
            </Button>
          </VStack>
        </form>

        <HStack my={6} color="#5B6B73">
          <Divider borderColor="#F5C7CF" />
          <Text fontSize="xs" fontWeight="500">
            OR
          </Text>
          <Divider borderColor="#F5C7CF" />
        </HStack>

        <VStack spacing={3}>
          <Button
            onClick={async () => {
              if (!supabase) {
                toast({
                  title: "Error",
                  description:
                    "Auth is not configured. Please try again later.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }
              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "github",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                },
              });
              if (error) {
                toast({
                  title: "Error",
                  description: error.message,
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
            variant="outline"
            borderColor="#F5C7CF"
            color="#2B2B2B"
            borderRadius="12px"
            w="100%"
            justifyContent="flex-start"
            _hover={{
              bg: "#fffcf2",
              borderColor: "#bc0930",
              color: "#bc0930",
            }}
            disabled={isLoggedIn || isSubmitting}
            leftIcon={
              <Image
                src="/images/github.png"
                alt="GitHub"
                width={20}
                height={20}
              />
            }
          >
            Continue with GitHub
          </Button>

          <Button
            onClick={async () => {
              if (!supabase) {
                toast({
                  title: "Error",
                  description:
                    "Auth is not configured. Please try again later.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }

              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                  queryParams: { prompt: "select_account" },
                },
              });
              if (error) {
                toast({
                  title: "Error",
                  description: error.message,
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
            variant="outline"
            borderColor="#F5C7CF"
            color="#2B2B2B"
            borderRadius="12px"
            w="100%"
            justifyContent="flex-start"
            _hover={{
              bg: "#fffcf2",
              borderColor: "#bc0930",
              color: "#bc0930",
            }}
            disabled={isLoggedIn || isSubmitting}
            leftIcon={
              <Image
                src="/images/google.png"
                alt="Google"
                width={20}
                height={20}
              />
            }
          >
            Continue with Google
          </Button>

          <Button
            onClick={async () => {
              if (!supabase) {
                toast({
                  title: "Error",
                  description:
                    "Auth is not configured. Please try again later.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }

              try {
                await supabase.auth.signOut({ scope: "local" });
              } catch {}
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "azure",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  flowType: "pkce",
                  scopes: "openid profile email offline_access",
                  queryParams: { prompt: "select_account" },
                },
              });
              if (error) {
                toast({
                  title: "Error",
                  description: error.message,
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
            variant="outline"
            borderColor="#F5C7CF"
            color="#2B2B2B"
            borderRadius="12px"
            w="100%"
            justifyContent="flex-start"
            _hover={{
              bg: "#fffcf2",
              borderColor: "#bc0930",
              color: "#bc0930",
            }}
            disabled={isLoggedIn || isSubmitting}
            leftIcon={
              <Image
                src="/images/microsoft-logo.png"
                alt="Microsoft"
                width={24}
                height={24}
              />
            }
          >
            Continue with Microsoft
          </Button>
        </VStack>

        <Box
          mt={6}
          p={3}
          bg="#fffcf2"
          borderRadius="12px"
          border="1px solid"
          borderColor="#F5C7CF"
          textAlign="center"
        >
          <Text fontSize="xs" color="#5B6B73" lineHeight="1.4">
            Admin access is granted to specific emails. If your email is
            configured as an admin, sign in normally and then open{" "}
            <Text as="span" fontWeight="600" color="#bc0930">
              /admin
            </Text>
            .
          </Text>
        </Box>

        <HStack justify="space-between" align="center" mt={6}>
          {!isSignup ? (
            <Text fontSize="sm" color="#5B6B73">
              Don't have an account?{" "}
              <Button
                onClick={() => setActiveMode("signup")}
                disabled={isLoggedIn}
                variant="link"
                color="#bc0930"
                fontWeight="600"
                fontSize="sm"
                p={0}
                h="auto"
                _disabled={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                Sign up
              </Button>
            </Text>
          ) : (
            <Text fontSize="sm" color="#5B6B73">
              Already have an account?{" "}
              <Button
                onClick={() => setActiveMode("login")}
                disabled={isLoggedIn}
                variant="link"
                color="#bc0930"
                fontWeight="600"
                fontSize="sm"
                p={0}
                h="auto"
                _disabled={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                Log in now
              </Button>
            </Text>
          )}

          {isLoggedIn && (
            <Button
              onClick={async () => {
                const { supabase } = await import("../lib/supabase");
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              variant="outline"
              size="sm"
              borderColor="#F5C7CF"
              color="#2B2B2B"
              borderRadius="8px"
              leftIcon={<LogOut size={16} />}
              _hover={{
                bg: "#fffcf2",
                borderColor: "#bc0930",
                color: "#bc0930",
              }}
            >
              Sign Out
            </Button>
          )}
        </HStack>
      </Box>
    </Box>
  );
}
