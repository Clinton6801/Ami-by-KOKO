import type { Metadata, Viewport } from "next";
import Script from "next/script";
import PWAManager from "@/components/ui/PWAManager";
import "./globals.css";

export const metadata: Metadata = {
  title: "Àmì by Kòkò — Phonics for African Children",
  description:
    "A multilingual phonics and early learning app for African children aged 0–8. Learn letters in English and African languages with Àmì and her talking parrot Kòkò.",
  keywords: ["phonics", "African children", "learning app", "Yoruba", "English", "kids education"],
  authors: [{ name: "Àmì by Kòkò" }],
  openGraph: {
    title: "Àmì by Kòkò — Phonics for African Children",
    description: "Learn letters the fun way with Àmì and her talking parrot Kòkò. Free English phonics, African languages coming.",
    type: "website",
    locale: "en_NG",
    siteName: "Àmì by Kòkò",
    url: "https://ami-by-koko.vercel.app",
    images: [
      {
        url: "https://ami-by-koko.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Àmì by Kòkò — Phonics for African Children",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Àmì by Kòkò — Phonics for African Children",
    description: "Learn letters the fun way with Àmì and her talking parrot Kòkò.",
    images: ["https://ami-by-koko.vercel.app/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F59E0B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-bg antialiased">
        {children}
        <PWAManager />
        <Script 
          src="https://js.paystack.co/v1/inline.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
