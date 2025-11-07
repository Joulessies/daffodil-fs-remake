"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Stack as CStack,
  Button as CButton,
  Box as CBox,
  useDisclosure,
  HStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Avatar,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Badge,
  Divider,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  LayoutGrid,
  Search,
  ShoppingBag,
  Heart,
  Home,
  Grid2x2,
  Package,
} from "lucide-react";
import CartButton from "./CartButton";
import { useWishlist } from "./WishlistContext";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { AnimatePresence, motion } from "framer-motion";

export default function NavigationBar() {
  const { user, isAdmin } = useAuth();
  const wishlist = useWishlist();
  const toast = useToast();
  const displayName = useMemo(() => {
    const name =
      user?.user_metadata?.full_name || user?.user_metadata?.name || "";
    const email = user?.email || "";
    return name || email;
  }, [user]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onOpenProfile,
    onClose: onCloseProfile,
  } = useDisclosure();
  const [query, setQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Avoid SSR/client mismatch by rendering only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Link styles with hover effects
  const linkStyle = {
    textDecoration: "none",
    color: "#2d3748",
    fontSize: 14,
    fontFamily: "var(--font-rothek)",
    fontWeight: 500,
    position: "relative",
    transition: "color 0.2s ease",
    display: "inline-block",
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    color: "#2d3748",
    fontSize: 14,
    fontFamily: "var(--font-rothek)",
    fontWeight: 500,
    cursor: "pointer",
    position: "relative",
    transition: "color 0.2s ease",
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import("../lib/supabase");
      if (supabase && supabase.auth) {
        await supabase.auth.signOut();
      }
    } catch (err) {
    } finally {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("daffodil-auth");
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("sb-") || k.includes("supabase")) {
              localStorage.removeItem(k);
            }
          });
        }
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("daffodil-auth");
        }
      } catch {}
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (isProfileOpen && user) {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || "";
      const nameParts = fullName.split(" ");
      setFirstName(meta.first_name || nameParts[0] || "");
      setLastName(meta.last_name || nameParts.slice(1).join(" ") || "");
      setProfileUsername(meta.username || "");
      setEditMode(false);
      setProfileError("");
      setPassword1("");
      setPassword2("");
    }
  }, [isProfileOpen, user]);

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    try {
      setAvatarUploading(true);
      const { supabase } = await import("../lib/supabase");
      const extension = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${extension}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      const { error: updErr } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updErr) throw updErr;
      toast({
        title: "Avatar updated",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to upload avatar"
      );
      toast({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Failed to upload avatar",
        status: "error",
        duration: 3000,
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!firstName.trim()) {
      setProfileError("First name is required");
      toast({
        title: "First name required",
        description: "Please enter your first name",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    try {
      setSavingProfile(true);
      const { supabase } = await import("../lib/supabase");
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          username: profileUsername,
        },
      });
      if (error) throw error;
      setEditMode(false);
      toast({
        title: "Profile updated",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
      toast({
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Failed to save profile",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setProfileError("");
    if (password1.length < 6) {
      setProfileError("Password must be at least 6 characters");
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (password1 !== password2) {
      setProfileError("Passwords do not match");
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    try {
      setPasswordSaving(true);
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.updateUser({ password: password1 });
      if (error) throw error;
      setPassword1("");
      setPassword2("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to change password"
      );
      toast({
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Failed to change password",
        status: "error",
        duration: 3000,
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    onClose();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
    else window.location.href = "/search";
  };
  if (!mounted) return null;
  return (
    <>
      <style jsx global>{`
        .nav-link {
          position: relative;
          display: inline-block;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background-color: #bc0930;
          transition: width 0.3s ease, left 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link:hover {
          color: #bc0930 !important;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-button {
          position: relative;
          display: inline-block;
          transition: color 0.3s ease;
        }
        .nav-button::after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background-color: #bc0930;
          transition: width 0.3s ease, left 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-button:hover {
          color: #bc0930 !important;
        }
        .nav-button:hover::after {
          width: 100%;
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fffcf2",
          borderBottom: "1px solid #e8e2d6",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: 1240,
            fontWeight: "500",
          }}
        >
          {/* Mobile Menu Button */}
          <CBox
            style={{ width: "60px", display: "flex", alignItems: "center" }}
          >
            <CBox display={{ base: "block", md: "none" }}>
              <IconButton
                aria-label="Open menu"
                icon={<LayoutGrid size={24} />}
                variant="ghost"
                onClick={onOpen}
                size="lg"
                color="#2d3748"
                _hover={{
                  bg: "#fff8f3",
                  color: "#bc0930",
                }}
              />
            </CBox>
            <CBox display={{ base: "none", md: "block" }}>
              <Link
                prefetch={false}
                href="/shop"
                style={{ textDecoration: "none" }}
              >
                <IconButton
                  aria-label="Shop"
                  icon={<Grid2x2 size={20} />}
                  variant="ghost"
                  color="#2d3748"
                  _hover={{
                    bg: "#fff8f3",
                    color: "#bc0930",
                  }}
                />
              </Link>
            </CBox>
          </CBox>

          {/* Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <Image
                src="/images/logo.svg"
                alt="Daffodil"
                width={180}
                height={50}
                priority
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Link>
          </div>

          {/* Right Side Actions */}
          <CBox
            display="flex"
            style={{
              width: "60px",
              justifyContent: "flex-end",
              gap: "8px",
              color: "#2B2B2B",
            }}
          >
            {/* Mobile Actions */}
            <CBox display={{ base: "flex", md: "none" }} gap="4px">
              <Link
                prefetch={false}
                href="/search"
                style={{ textDecoration: "none" }}
              >
                <IconButton
                  aria-label="Search"
                  icon={<Search size={20} />}
                  variant="ghost"
                  color="#2d3748"
                  size="sm"
                  _hover={{
                    bg: "#fff8f3",
                    color: "#bc0930",
                  }}
                />
              </Link>
              <Link
                prefetch={false}
                href="/wishlist"
                style={{ textDecoration: "none" }}
              >
                <div style={{ position: "relative" }}>
                  <IconButton
                    aria-label="Favorites"
                    icon={<Heart size={20} />}
                    variant="ghost"
                    color="#2d3748"
                    size="sm"
                    _hover={{
                      bg: "#fff8f3",
                      color: "#bc0930",
                    }}
                  />
                  {wishlist?.items?.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        background: "#bc0930",
                        color: "white",
                        borderRadius: "9999px",
                        minWidth: 16,
                        height: 16,
                        padding: "0 4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1,
                        boxShadow: "0 0 0 2px #fffcf2",
                      }}
                    >
                      {Math.min(99, wishlist.items.length)}
                    </span>
                  )}
                </div>
              </Link>
              <CartButton />
            </CBox>

            {/* Desktop Actions */}
            <CBox display={{ base: "none", md: "flex" }} gap="10px">
              <Link
                prefetch={false}
                href="/search"
                style={{ textDecoration: "none" }}
              >
                <IconButton
                  aria-label="Search"
                  icon={<Search size={20} />}
                  variant="ghost"
                  color="#2d3748"
                  _hover={{
                    bg: "#fff8f3",
                    color: "#bc0930",
                  }}
                />
              </Link>
              <Link
                prefetch={false}
                href="/wishlist"
                style={{ textDecoration: "none" }}
              >
                <div style={{ position: "relative" }}>
                  <IconButton
                    aria-label="Favorites"
                    icon={<Heart size={20} />}
                    variant="ghost"
                    color="#2d3748"
                    _hover={{
                      bg: "#fff8f3",
                      color: "#bc0930",
                    }}
                  />
                  {wishlist?.items?.length > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        background: "#bc0930",
                        color: "white",
                        borderRadius: "9999px",
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1,
                        boxShadow: "0 0 0 2px #fffcf2",
                      }}
                    >
                      {Math.min(99, wishlist.items.length)}
                    </span>
                  )}
                </div>
              </Link>
              <CartButton />
            </CBox>
          </CBox>
        </div>

        <CBox
          display={{ base: "none", md: "flex" }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "6px 0",
            gap: 48,
            width: "100%",
            maxWidth: 920,
            color: "#5B6B73",
            letterSpacing: 0.2,
          }}
        >
          <Link href="/" className="nav-link" style={linkStyle}>
            Home
          </Link>
          <Link
            prefetch={false}
            href="/shop"
            className="nav-link"
            style={linkStyle}
          >
            Shop
          </Link>
          <Link
            prefetch={false}
            href="/about"
            className="nav-link"
            style={linkStyle}
          >
            About
          </Link>
          <Link
            prefetch={false}
            href="/customize"
            className="nav-link"
            style={linkStyle}
          >
            Customize
          </Link>
          {user && (
            <button
              onClick={onOpenProfile}
              className="nav-button"
              style={buttonStyle}
              aria-label="Open profile"
            >
              {displayName ? `Hi, ${displayName}` : "Profile"}
            </button>
          )}

          {isAdmin && (
            <Link
              prefetch={false}
              href="/admin"
              className="nav-link"
              style={linkStyle}
            >
              Admin
            </Link>
          )}
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="nav-button"
                style={buttonStyle}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link" style={linkStyle}>
                Login
              </Link>
              <Link href="/signup" className="nav-link" style={linkStyle}>
                Signup
              </Link>
            </>
          )}
        </CBox>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <Drawer
              isOpen={isOpen}
              placement="left"
              onClose={onClose}
              size="xs"
            >
              <DrawerOverlay />
              <DrawerContent>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DrawerHeader>Menu</DrawerHeader>
                  </motion.div>
                  <DrawerBody>
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { staggerChildren: 0.05 },
                        },
                      }}
                    >
                      <CStack spacing={4}>
                        <HStack>
                          <form
                            onSubmit={handleMobileSearch}
                            style={{ width: "100%" }}
                          >
                            <HStack>
                              <Input
                                placeholder="Search flowers..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoComplete="off"
                              />
                              <IconButton
                                aria-label="Search"
                                icon={<Search size={18} />}
                                type="submit"
                              />
                            </HStack>
                          </form>
                          <Link
                            prefetch={false}
                            href="/wishlist"
                            onClick={onClose}
                          >
                            <IconButton
                              aria-label="Favorites"
                              icon={<Heart size={18} />}
                            />
                          </Link>
                          <CartButton />
                        </HStack>
                        <Link
                          href="/"
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <CButton
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                          >
                            Home
                          </CButton>
                        </Link>
                        <Link
                          href="/shop"
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <CButton
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                          >
                            Shop
                          </CButton>
                        </Link>
                        <Link
                          href="/about"
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <CButton
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                          >
                            About
                          </CButton>
                        </Link>
                        <Link
                          href="/customize"
                          onClick={onClose}
                          style={{ textDecoration: "none" }}
                        >
                          <CButton
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                          >
                            Customize
                          </CButton>
                        </Link>
                        {user && (
                          <CButton
                            onClick={() => {
                              onClose();
                              onOpenProfile();
                            }}
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                          >
                            Profile
                          </CButton>
                        )}

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={onClose}
                            style={{ textDecoration: "none" }}
                          >
                            <CButton
                              variant="ghost"
                              width="100%"
                              justifyContent="flex-start"
                            >
                              Admin
                            </CButton>
                          </Link>
                        )}
                        {user ? (
                          <CButton
                            onClick={() => {
                              onClose();
                              handleLogout();
                            }}
                            variant="outline"
                          >
                            Logout
                          </CButton>
                        ) : (
                          <>
                            <Link
                              href="/login"
                              onClick={onClose}
                              style={{ textDecoration: "none" }}
                            >
                              <CButton variant="outline" width="100%">
                                Login
                              </CButton>
                            </Link>
                            <Link
                              href="/signup"
                              onClick={onClose}
                              style={{ textDecoration: "none" }}
                            >
                              <CButton
                                variant="solid"
                                colorScheme="red"
                                width="100%"
                              >
                                Signup
                              </CButton>
                            </Link>
                          </>
                        )}
                      </CStack>
                    </motion.div>
                  </DrawerBody>
                </motion.div>
              </DrawerContent>
            </Drawer>
          )}
        </AnimatePresence>
        {user && (
          <Modal
            isOpen={isProfileOpen}
            onClose={onCloseProfile}
            isCentered
            size="md"
            scrollBehavior="inside"
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
              border="1px solid"
              borderColor="#F5C7CF"
              borderRadius="16px"
              bg="white"
              boxShadow="xl"
              maxH="85vh"
            >
              <ModalHeader
                bg="#fffcf2"
                borderTopRadius="16px"
                borderBottom="1px solid"
                borderColor="#F5C7CF"
              >
                <Text
                  fontSize="xl"
                  fontWeight="700"
                  color="#bc0930"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Profile Settings
                </Text>
              </ModalHeader>
              <ModalCloseButton color="#bc0930" _hover={{ bg: "#fff8f3" }} />
              <ModalBody py={4}>
                {!!profileError && (
                  <Alert status="error" mb={3} borderRadius="md">
                    <AlertIcon />
                    {profileError}
                  </Alert>
                )}
                <VStack spacing={4} align="stretch">
                  {/* User Info Card */}
                  <CBox
                    p={3}
                    bg="#fffcf2"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="#F5C7CF"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        name={displayName || user?.email || "User"}
                        size="md"
                        bg="#bc0930"
                        color="white"
                      />
                      <VStack align="start" spacing={0.5}>
                        <Text fontWeight="600" fontSize="md" color="#2B2B2B">
                          {displayName || "User"}
                        </Text>
                        <Text fontSize="xs" color="#5B6B73">
                          {user?.email}
                        </Text>
                        {isAdmin && (
                          <Badge
                            colorScheme="red"
                            bg="#bc0930"
                            color="white"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                          >
                            Admin
                          </Badge>
                        )}
                      </VStack>
                    </HStack>
                  </CBox>

                  {/* Quick Actions */}
                  <CBox>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      mb={3}
                      color="#bc0930"
                      style={{ fontFamily: "var(--font-rothek)" }}
                    >
                      Quick Actions
                    </Text>
                    <HStack spacing={3}>
                      <Link href="/profile/orders" style={{ flex: 1 }}>
                        <CButton
                          leftIcon={<Package size={16} />}
                          bg="#bc0930"
                          color="white"
                          _hover={{
                            bg: "#a10828",
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                          borderRadius="md"
                          fontWeight="600"
                          transition="all 0.2s"
                          w="full"
                          size="sm"
                        >
                          My Orders
                        </CButton>
                      </Link>
                      <Link href="/wishlist" style={{ flex: 1 }}>
                        <CButton
                          leftIcon={<Heart size={16} />}
                          variant="outline"
                          borderColor="#bc0930"
                          color="#bc0930"
                          _hover={{
                            bg: "#fff8f3",
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                          borderRadius="md"
                          fontWeight="600"
                          transition="all 0.2s"
                          w="full"
                          size="sm"
                        >
                          Wishlist
                        </CButton>
                      </Link>
                    </HStack>
                  </CBox>

                  <Divider borderColor="#F5C7CF" />

                  {/* Profile Form */}
                  <FormControl>
                    <FormLabel color="#5B6B73" fontSize="sm" fontWeight="600">
                      Profile Picture
                    </FormLabel>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      disabled={avatarUploading}
                      onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                      borderColor="#F5C7CF"
                      _hover={{ borderColor: "#bc0930" }}
                      _focus={{
                        borderColor: "#bc0930",
                        boxShadow: "0 0 0 1px #bc0930",
                      }}
                    />
                    {avatarUploading && (
                      <Text fontSize="xs" color="#5B6B73" mt={1}>
                        Uploading...
                      </Text>
                    )}
                  </FormControl>

                  <HStack spacing={3} align="start">
                    <FormControl>
                      <FormLabel color="#5B6B73" fontSize="sm" fontWeight="600">
                        First Name
                      </FormLabel>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!editMode || savingProfile}
                        placeholder="Enter first name"
                        borderColor="#F5C7CF"
                        _hover={{ borderColor: "#bc0930" }}
                        _focus={{
                          borderColor: "#bc0930",
                          boxShadow: "0 0 0 1px #bc0930",
                        }}
                        _disabled={{
                          bg: "#f9fafb",
                          cursor: "not-allowed",
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="#5B6B73" fontSize="sm" fontWeight="600">
                        Last Name
                      </FormLabel>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!editMode || savingProfile}
                        placeholder="Enter last name"
                        borderColor="#F5C7CF"
                        _hover={{ borderColor: "#bc0930" }}
                        _focus={{
                          borderColor: "#bc0930",
                          boxShadow: "0 0 0 1px #bc0930",
                        }}
                        _disabled={{
                          bg: "#f9fafb",
                          cursor: "not-allowed",
                        }}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel color="#5B6B73" fontSize="sm" fontWeight="600">
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      bg="#f9fafb"
                      borderColor="#e5e7eb"
                      cursor="not-allowed"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="#5B6B73" fontSize="sm" fontWeight="600">
                      Username
                    </FormLabel>
                    <Input
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      disabled={!editMode || savingProfile}
                      placeholder="Enter username (optional)"
                      borderColor="#F5C7CF"
                      _hover={{ borderColor: "#bc0930" }}
                      _focus={{
                        borderColor: "#bc0930",
                        boxShadow: "0 0 0 1px #bc0930",
                      }}
                      _disabled={{
                        bg: "#f9fafb",
                        cursor: "not-allowed",
                      }}
                    />
                  </FormControl>

                  <Divider borderColor="#F5C7CF" />

                  {/* Password Section */}
                  <CBox>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      mb={3}
                      color="#bc0930"
                      style={{ fontFamily: "var(--font-rothek)" }}
                    >
                      Change Password
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <FormControl>
                        <FormLabel
                          color="#2d3748"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          New Password
                        </FormLabel>
                        <Input
                          type="password"
                          placeholder="Enter new password (min. 6 characters)"
                          value={password1}
                          onChange={(e) => setPassword1(e.target.value)}
                          disabled={passwordSaving}
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel
                          color="#2d3748"
                          fontSize="sm"
                          fontWeight="600"
                        >
                          Confirm New Password
                        </FormLabel>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          disabled={passwordSaving}
                          borderColor="#F5C7CF"
                          _hover={{ borderColor: "#bc0930" }}
                          _focus={{
                            borderColor: "#bc0930",
                            boxShadow: "0 0 0 1px #bc0930",
                          }}
                        />
                      </FormControl>
                      <CButton
                        onClick={handleChangePassword}
                        isLoading={passwordSaving}
                        bg="#3182ce"
                        color="white"
                        _hover={{
                          bg: "#2c5aa0",
                          transform: "translateY(-1px)",
                          boxShadow: "md",
                        }}
                        borderRadius="md"
                        fontWeight="600"
                        transition="all 0.2s"
                      >
                        Update Password
                      </CButton>
                    </VStack>
                  </CBox>
                </VStack>
              </ModalBody>
              <ModalFooter
                bg="#fffcf2"
                borderTop="1px solid"
                borderColor="#F5C7CF"
                borderBottomRadius="16px"
              >
                <HStack spacing={3} w="100%" justify="flex-end">
                  {!editMode ? (
                    <>
                      <CButton
                        variant="ghost"
                        onClick={onCloseProfile}
                        color="#2d3748"
                        _hover={{ bg: "#fff8f3" }}
                      >
                        Close
                      </CButton>
                      <CButton
                        onClick={() => setEditMode(true)}
                        bg="#bc0930"
                        color="white"
                        _hover={{
                          bg: "#a10828",
                          transform: "translateY(-1px)",
                          boxShadow: "md",
                        }}
                        borderRadius="md"
                        fontWeight="600"
                        transition="all 0.2s"
                      >
                        Edit Profile
                      </CButton>
                    </>
                  ) : (
                    <>
                      <CButton
                        variant="ghost"
                        onClick={() => {
                          setEditMode(false);
                          setProfileError("");
                          const meta = user?.user_metadata || {};
                          const fullName = meta.full_name || meta.name || "";
                          const nameParts = fullName.split(" ");
                          setFirstName(meta.first_name || nameParts[0] || "");
                          setLastName(
                            meta.last_name || nameParts.slice(1).join(" ") || ""
                          );
                          setProfileUsername(meta.username || "");
                        }}
                        color="#2d3748"
                        _hover={{ bg: "#fff8f3" }}
                      >
                        Cancel
                      </CButton>
                      <CButton
                        onClick={handleSaveProfile}
                        isLoading={savingProfile}
                        bg="#38A169"
                        color="white"
                        _hover={{
                          bg: "#2F855A",
                          transform: "translateY(-1px)",
                          boxShadow: "md",
                        }}
                        borderRadius="md"
                        fontWeight="600"
                        transition="all 0.2s"
                      >
                        Save Changes
                      </CButton>
                    </>
                  )}
                  <CButton
                    onClick={handleLogout}
                    bg="#E53E3E"
                    color="white"
                    _hover={{
                      bg: "#C53030",
                      transform: "translateY(-1px)",
                      boxShadow: "md",
                    }}
                    borderRadius="md"
                    fontWeight="600"
                    transition="all 0.2s"
                  >
                    Sign Out
                  </CButton>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>
    </>
  );
}
