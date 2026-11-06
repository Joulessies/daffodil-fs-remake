"use client";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Badge,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  MessageSquare,
  BarChart3,
  FileText,
  Store,
  Menu,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  {
    label: "Analytics",
    href: "/admin/analytics/sales",
    icon: BarChart3,
    subItems: [
      { label: "Sales Analytics", href: "/admin/analytics/sales" },
      { label: "Product Performance", href: "/admin/analytics/products" },
      { label: "Customer Insights", href: "/admin/analytics/customers" },
    ],
  },
  {
    label: "CMS & Content",
    href: "/admin/cms",
    icon: FileText,
    subItems: [
      { label: "CMS Overview", href: "/admin/cms", exact: true },
      { label: "Homepage Sections", href: "/admin/cms/homepage" },
      { label: "About Page", href: "/admin/cms/pages" },
      { label: "Promotions & Banners", href: "/admin/cms/promotions" },
    ],
  },
];

export default function AdminNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  return (
    <>
      <Box bg="#FFF8F3" borderBottom="1px solid #F5C7CF" px={4} py={1.5}>
        <Flex maxW="1600px" mx="auto" justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack spacing={2} fontSize="xs">
            <Badge colorScheme="blue" variant="subtle" fontSize="2xs">LOCAL HOST</Badge>
            <Text color="#4A5568" fontWeight="600">Presented through localhost:3000 (Production domain expired)</Text>
          </HStack>
          <HStack spacing={2} fontSize="xs">
            <Badge colorScheme="purple" variant="subtle" fontSize="2xs">ACCESS SEPARATION</Badge>
            <Text color="#742A2A" fontWeight="600">Web: Company & Admin Only | Customer: Mobile App (APK)</Text>
          </HStack>
        </Flex>
      </Box>

      <Box
        as="header"
        bg="white"
        borderBottom="1px solid"
        borderColor="#F5C7CF"
        position="sticky"
        top={0}
        zIndex={100}
        shadow="xs"
      >
        <Flex
          maxW="1600px"
          mx="auto"
          px={{ base: 4, sm: 6 }}
          py={3}
          align="center"
          justify="space-between"
        >
          <HStack spacing={3}>
            <IconButton
              aria-label="Open navigation menu"
              icon={<Menu size={20} />}
              variant="outline"
              size="sm"
              borderColor="#F5C7CF"
              color="#bc0930"
              _hover={{ bg: "#FFF8F3" }}
              onClick={onOpen}
            />
            <Link href="/admin">
              <HStack spacing={2} cursor="pointer">
                <Text
                  fontWeight="800"
                  fontSize={{ base: "md", sm: "lg" }}
                  color="#bc0930"
                  letterSpacing="-0.02em"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  WEB AND MOBILE
                </Text>
                <Badge
                  colorScheme="red"
                  bg="#bc093018"
                  color="#bc0930"
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="700"
                >
                  COMPANY / ADMIN
                </Badge>
              </HStack>
            </Link>
          </HStack>

          {/* Quick Desktop Pills (hidden on mobile, visible on lg+) */}
          <HStack
            spacing={1}
            display={{ base: "none", lg: "flex" }}
            overflowX="auto"
            py={1}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const IconComp = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    size="xs"
                    variant={active ? "solid" : "ghost"}
                    bg={active ? "#bc0930" : "transparent"}
                    color={active ? "white" : "#5B6B73"}
                    _hover={{
                      bg: active ? "#a10828" : "#FFF8F3",
                      color: active ? "white" : "#bc0930",
                    }}
                    leftIcon={<IconComp size={14} />}
                    borderRadius="full"
                    px={3}
                    fontWeight="600"
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </HStack>

          <HStack spacing={3}>
            {user && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="#5B6B73" display={{ base: "none", md: "block" }}>
                  {user.email}
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="#F5C7CF"
                  color="#bc0930"
                  _hover={{ bg: "#FFF8F3" }}
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </HStack>
            )}
            <Badge
              colorScheme="purple"
              variant="subtle"
              fontSize="xs"
              px={3}
              py={1.5}
              borderRadius="md"
              fontWeight="600"
            >
              Customer Shopping: Mobile App (APK)
            </Badge>
          </HStack>
        </Flex>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
        <DrawerContent bg="#FFFDF7" maxW={{ base: "290px", sm: "320px" }}>
          <DrawerCloseButton
            top={3}
            right={3}
            color="#5B6B73"
            _hover={{ color: "#bc0930", bg: "#FFF8F3" }}
          />
          <DrawerHeader borderBottom="1px solid #F5C7CF" py={4} px={5}>
            <HStack spacing={2}>
              <Box
                p={2}
                borderRadius="10px"
                bg="#bc0930"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Sparkles size={16} />
              </Box>
              <Box>
                <Text
                  fontWeight="800"
                  fontSize="md"
                  color="#bc0930"
                  lineHeight="1.2"
                  style={{ fontFamily: "var(--font-rothek)" }}
                >
                  Web and Mobile
                </Text>
                <Text fontSize="xs" color="#5B6B73" fontWeight="500">
                  Company & Admin Portal
                </Text>
              </Box>
            </HStack>
          </DrawerHeader>

          <DrawerBody px={3} py={4} overflowY="auto">
            <VStack spacing={1} align="stretch">
              <Text
                fontSize="2xs"
                fontWeight="700"
                color="#8A9AA3"
                textTransform="uppercase"
                letterSpacing="wider"
                px={3}
                mb={1}
              >
                Navigation
              </Text>

              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                const IconComp = item.icon;

                return (
                  <Box key={item.href}>
                    <Link href={item.href} onClick={onClose}>
                      <Flex
                        align="center"
                        justify="space-between"
                        p={2.5}
                        borderRadius="10px"
                        bg={active ? "#bc0930" : "transparent"}
                        color={active ? "white" : "#2D3748"}
                        _hover={{
                          bg: active ? "#a10828" : "#FFF8F3",
                          color: active ? "white" : "#bc0930",
                        }}
                        transition="all 0.15s"
                        cursor="pointer"
                        fontWeight="600"
                        fontSize="sm"
                      >
                        <HStack spacing={3}>
                          <IconComp
                            size={18}
                            color={active ? "white" : "#bc0930"}
                          />
                          <Text>{item.label}</Text>
                        </HStack>
                        <ChevronRight
                          size={14}
                          color={active ? "white" : "#A0AEC0"}
                        />
                      </Flex>
                    </Link>

                    {/* Sub-items if active or parent match */}
                    {item.subItems && active && (
                      <VStack
                        spacing={0.5}
                        align="stretch"
                        pl={8}
                        pr={2}
                        pt={1}
                        pb={2}
                      >
                        {item.subItems.map((sub) => {
                          const subActive = sub.exact
                            ? pathname === sub.href
                            : pathname?.startsWith(sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onClose}
                            >
                              <Flex
                                align="center"
                                py={1.5}
                                px={2.5}
                                borderRadius="8px"
                                bg={subActive ? "#bc093015" : "transparent"}
                                color={subActive ? "#bc0930" : "#5B6B73"}
                                fontWeight={subActive ? "700" : "500"}
                                fontSize="xs"
                                _hover={{
                                  bg: "#FFF8F3",
                                  color: "#bc0930",
                                }}
                              >
                                {sub.label}
                              </Flex>
                            </Link>
                          );
                        })}
                      </VStack>
                    )}
                  </Box>
                );
              })}

              <Divider my={3} borderColor="#F5C7CF" />

              <Text
                fontSize="2xs"
                fontWeight="700"
                color="#8A9AA3"
                textTransform="uppercase"
                letterSpacing="wider"
                px={3}
                mb={1}
              >
                Quick Links
              </Text>

              <Link href="/" onClick={onClose} target="_blank">
                <Flex
                  align="center"
                  p={2.5}
                  borderRadius="10px"
                  color="#2D3748"
                  _hover={{ bg: "#FFF8F3", color: "#bc0930" }}
                  transition="all 0.15s"
                  fontWeight="600"
                  fontSize="sm"
                >
                  <HStack spacing={3}>
                    <Store size={18} color="#0f8f4d" />
                    <Text>View Live Shop</Text>
                  </HStack>
                </Flex>
              </Link>

              {user?.email && (
                <Box mt={4} p={3} bg="#FFF8F3" borderRadius="10px" border="1px solid #F5C7CF">
                  <Text fontSize="2xs" color="#8A9AA3" fontWeight="600">
                    LOGGED IN AS
                  </Text>
                  <Text
                    fontSize="xs"
                    color="#2D3748"
                    fontWeight="600"
                    noOfLines={1}
                    wordBreak="break-all"
                  >
                    {user.email}
                  </Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
