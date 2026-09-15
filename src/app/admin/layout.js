import AdminNav from "@/components/AdminNav";
import { Box } from "@chakra-ui/react";

export const metadata = {
  title: {
    default: "Admin - Daffodil Flower Shop",
    template: "%s - Daffodil Flower Shop",
  },
};

export default function AdminLayout({ children }) {
  return (
    <Box minH="100vh" bg="#FFFDF7">
      <AdminNav />
      {children}
    </Box>
  );
}

