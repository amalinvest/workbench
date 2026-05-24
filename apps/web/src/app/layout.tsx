import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://getworkbench.dev"),
  title: "Workbench — Open-source BullMQ dashboard",
  description:
    "A modern, drop-in BullMQ dashboard for any Node backend. Flows, metrics, schedulers, search. MIT licensed.",
  openGraph: {
    title: "Workbench — Open-source BullMQ dashboard",
    description:
      "A modern, drop-in BullMQ dashboard for any Node backend. Flows, metrics, schedulers, search.",
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
    title: "Workbench — Open-source BullMQ dashboard",
    description: "A modern, drop-in BullMQ dashboard for any Node backend.",
    images: ["/og.png"],
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
