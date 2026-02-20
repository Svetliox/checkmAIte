import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "checkmAIte - AI-Powered Chess Analysis",
    template: "%s | checkmAIte",
  },
  description:
    "Master your chess game with AI-powered analysis. Get real-time insights, identify your best moves, and track your improvement with Stockfish-powered evaluation.",
  keywords: [
    "chess",
    "chess analysis",
    "stockfish",
    "chess AI",
    "chess engine",
    "chess improvement",
    "chess training",
  ],
  authors: [{ name: "checkmAIte" }],
  creator: "checkmAIte",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://checkmaite.app",
    siteName: "checkmAIte",
    title: "checkmAIte - AI-Powered Chess Analysis",
    description:
      "Master your chess game with AI-powered analysis. Get real-time insights and improve your play.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "checkmAIte - Chess Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "checkmAIte - AI-Powered Chess Analysis",
    description:
      "Master your chess game with AI-powered analysis. Get real-time insights and improve your play.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
