import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Àmì by Kòkò",
  description:
    "A multilingual phonics and early learning app for Nigerian children aged 0–8, guided by Àmì and her talking parrot Kòkò.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  // Prevent zoom on input focus — important for touch-first children's UX
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-bg antialiased">
        {children}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
