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
} from "@chakra-ui/react";
import { LayoutGrid, Search, ShoppingBag, Heart } from "lucide-react";
import CartButton from "./CartButton";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { AnimatePresence, motion } from "framer-motion";

export default function NavigationBar() {
  const { user, isAdmin } = useAuth();
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
  const [profileName, setProfileName] = useState("");
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
      setProfileName(meta.full_name || meta.name || "");
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
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to upload avatar"
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!profileName.trim()) {
      setProfileError("Name is required");
      return;
    }
    try {
      setSavingProfile(true);
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileName, username: profileUsername },
      });
      if (error) throw error;
      setEditMode(false);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setProfileError("");
    if (password1.length < 6) {
      setProfileError("Password must be at least 6 characters");
      return;
    }
    if (password1 !== password2) {
      setProfileError("Passwords do not match");
      return;
    }
    try {
      setPasswordSaving(true);
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.updateUser({ password: password1 });
      if (error) throw error;
      setPassword1("");
      setPassword2("");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to change password"
      );
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "8px 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fffcf2",
        borderBottom: "1px solid #e8e2d6",
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
        <CBox style={{ width: "100px" }}>
          <CBox display={{ base: "block", md: "none" }}>
            <IconButton
              aria-label="Open menu"
              icon={<LayoutGrid size={22} />}
              variant="ghost"
              onClick={onOpen}
            />
          </CBox>
        </CBox>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src="/images/logo.svg"
            alt="Daffodil"
            width={210}
            height={60}
            priority
          />
        </div>

        <CBox
          display={{ base: "none", md: "flex" }}
          style={{
            width: "100px",
            justifyContent: "flex-end",
            gap: 10,
            color: "#2B2B2B",
          }}
        >
          <Link
            prefetch={false}
            href="/search"
            style={{ textDecoration: "none" }}
          >
            <IconButton
              aria-label="Search"
              icon={<Search size={20} />}
              variant="ghost"
            />
          </Link>
          <Link
            prefetch={false}
            href="/wishlist"
            style={{ textDecoration: "none" }}
          >
            <IconButton
              aria-label="Favorites"
              icon={<Heart size={20} />}
              variant="ghost"
            />
          </Link>
          <CartButton />
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
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Home
        </Link>
        <Link
          prefetch={false}
          href="/shop"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Shop
        </Link>
        <Link
          prefetch={false}
          href="/about"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          About
        </Link>
        <Link
          prefetch={false}
          href="/customize"
          style={{
            textDecoration: "none",
            color: "#5B6B73",
            fontSize: 14,
            fontFamily: "var(--font-rothek)",
            fontWeight: 500,
          }}
        >
          Customize
        </Link>
        {user && (
          <button
            onClick={onOpenProfile}
            style={{
              background: "none",
              border: "none",
              color: "#5B6B73",
              fontSize: 14,
              fontFamily: "var(--font-rothek)",
              fontWeight: 500,
              cursor: "pointer",
            }}
            aria-label="Open profile"
          >
            {displayName ? `Hi, ${displayName}` : "Profile"}
          </button>
        )}

        {isAdmin && (
          <Link
            prefetch={false}
            href="/admin"
            style={{
              textDecoration: "none",
              color: "#5B6B73",
              fontSize: 14,
              fontFamily: "var(--font-rothek)",
              fontWeight: 500,
            }}
          >
            Admin
          </Link>
        )}
        {user ? (
          <>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                textDecoration: "none",
                color: "#5B6B73",
                fontSize: 14,
                fontFamily: "var(--font-rothek)",
                fontWeight: 500,
              }}
            >
              Signup
            </Link>
          </>
        )}
      </CBox>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
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
        <Modal isOpen={isProfileOpen} onClose={onCloseProfile} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {!!profileError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                  }}
                >
                  {profileError}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={displayName || user?.email || "User"} size="md" />
                <div>
                  <div style={{ fontWeight: 600 }}>{displayName || "User"}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {user?.email}
                  </div>
                  {isAdmin && (
                    <div
                      style={{ fontSize: 12, color: "#b45309", marginTop: 4 }}
                    >
                      Admin
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label
                  htmlFor="avatar"
                  style={{
                    fontSize: 14,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Profile picture
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  disabled={avatarUploading}
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
                {avatarUploading && (
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    Uploading...
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={!editMode || savingProfile}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: "#f9fafb",
                  }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  disabled={!editMode || savingProfile}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    outline: "none",
                  }}
                />
              </div>
              <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Change password
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  type="password"
                  placeholder="New password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  disabled={passwordSaving}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                  }}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  disabled={passwordSaving}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                  }}
                />
                <CButton
                  onClick={handleChangePassword}
                  isDisabled={passwordSaving}
                  colorScheme="blue"
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </CButton>
              </div>
            </ModalBody>
            <ModalFooter style={{ display: "flex", gap: 8 }}>
              {!editMode ? (
                <>
                  <CButton variant="ghost" onClick={onCloseProfile}>
                    Close
                  </CButton>
                  <CButton onClick={() => setEditMode(true)}>
                    Edit profile
                  </CButton>
                </>
              ) : (
                <>
                  <CButton
                    variant="ghost"
                    onClick={() => {
                      setEditMode(false);
                      setProfileError("");
                      setProfileName(
                        user?.user_metadata?.full_name ||
                          user?.user_metadata?.name ||
                          ""
                      );
                      setProfileUsername(user?.user_metadata?.username || "");
                    }}
                  >
                    Cancel
                  </CButton>
                  <CButton
                    colorScheme="green"
                    onClick={handleSaveProfile}
                    isDisabled={savingProfile}
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </CButton>
                </>
              )}
              <CButton colorScheme="red" onClick={handleLogout}>
                Sign Out
              </CButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
