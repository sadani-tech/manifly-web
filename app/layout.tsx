import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { publicConfig } from "@/lib/public-config";

const APP_NAME = "Manifly";
const APP_DESCRIPTION =
  "Catat dan pahami keuangan lewat web atau WhatsApp dengan dashboard, budget, dan analitik Manifly.";

export const metadata: Metadata = {
  metadataBase: new URL(publicConfig.siteUrl),
  title: {
    default: `${APP_NAME} — Uang cepat, mimpi dekat`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: APP_NAME,
    title: "Manifly — Uang cepat, mimpi dekat",
    description: APP_DESCRIPTION,
    url: "/",
    images: [{ url: "/brand/manifly-lockup.png", alt: "Manifly" }],
  },
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: "Manifly",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      // SVG first: modern browsers prefer it and render the tab icon crisply.
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
};

// Viewport must be exported separately in Next.js 16 (App Router metadata API).
// `viewport-fit=cover` lets us paint behind the iOS notch / home indicator;
// the bottom nav already uses `env(safe-area-inset-bottom)`.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#C9F45A" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      // Theme is applied by the tiny head script before the first paint.
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <head suppressHydrationWarning>
        <Script
          src="/theme-init.js"
          strategy="beforeInteractive"
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
