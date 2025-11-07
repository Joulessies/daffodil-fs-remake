import { Inter } from "next/font/google";
import "./globals.scss";
import { CacheProvider } from "@chakra-ui/next-js";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import CartModal from "@/components/CartModal";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Daffodil Flower Shop",
    template: "%s - Daffodil Flower Shop",
  },
  description: "Beautiful flowers for every occasion",
  icons: {
    icon: "/images/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/santa-catarina"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-rothek`}>
        <CacheProvider>
          <AuthProvider>
            <Providers>
              {children}
              <CartModal />
              <ConditionalFooter />
            </Providers>
          </AuthProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
