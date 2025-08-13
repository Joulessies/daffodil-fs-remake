import { Inter } from "next/font/google";
import "./globals.scss";
import { CacheProvider } from "@chakra-ui/next-js";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import CartModal from "@/components/CartModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Daffodil Flower Shop",
  description: "Beautiful flowers for every occasion",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-santa-katarina font-rothek`}>
        <CacheProvider>
          <Providers>
            <AuthProvider>
              {children}
              {/* Portal for cart modal */}
              <CartModal />
            </AuthProvider>
          </Providers>
        </CacheProvider>
      </body>
    </html>
  );
}
