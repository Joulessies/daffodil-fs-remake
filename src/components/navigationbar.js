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
} from "@chakra-ui/react";
import { LayoutGrid, Search, ShoppingBag, Heart } from "lucide-react";
import CartButton from "./CartButton";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { AnimatePresence, motion } from "framer-motion";

export default function NavigationBar() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    const { supabase } = await import("../lib/supabase");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    onClose();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
    else window.location.href = "/search";
  };
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
    </div>
  );
}
