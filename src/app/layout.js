import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.scss";
import { CacheProvider } from "@chakra-ui/next-js";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import CartModal from "@/components/CartModal";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${playfair.variable}`}
    >
      <head>
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
      <body className={plusJakarta.className}>
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
