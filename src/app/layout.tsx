import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StorefrontShell } from "@/components/storefront-shell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ceylon Wall Decor — Handmade Textured Art",
    template: "%s — Ceylon Wall Decor",
  },
  description:
    "Minimal handmade textured wall art, crafted in Sri Lanka and delivered island-wide.",
  openGraph: {
    type: "website",
    title: "Ceylon Wall Decor",
    description: "Handmade textured wall art from Sri Lanka.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.variable}>
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
