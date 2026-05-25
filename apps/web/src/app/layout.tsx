import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistPixelLine } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://getworkbench.dev"),
  title: "Workbench — The missing dashboard for BullMQ",
  description:
    "A local-first, native desktop app to inspect, debug, and replay your BullMQ queues. Discover queues automatically, watch runs in real time, and never SSH into Redis again.",
  openGraph: {
    title: "Workbench — The missing dashboard for BullMQ",
    description:
      "Native macOS app. Local-first. Inspect, debug, and replay your BullMQ queues. MIT licensed, no telemetry.",
    url: "https://getworkbench.dev",
    siteName: "Workbench",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Workbench — a beautiful, open-source BullMQ dashboard for modern Node apps.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workbench — The missing dashboard for BullMQ",
    description:
      "Native macOS app. Local-first. Inspect, debug, and replay your BullMQ queues.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelLine.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
