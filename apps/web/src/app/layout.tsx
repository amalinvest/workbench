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
  },
  twitter: {
    card: "summary_large_image",
    title: "Workbench — Open-source BullMQ dashboard",
    description: "A modern, drop-in BullMQ dashboard for any Node backend.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
