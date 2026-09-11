import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { publicConfig } from "@/lib/public-config";

const APP_NAME = "Manifly";
const APP_TITLE = "Manifly - Financial Tracker";
const APP_TAGLINE = "Biar uang nggak asal terbang.";
const APP_DESCRIPTION =
  "Catat lewat web atau WhatsApp, lihat ke mana uang pergi, dan jaga agar tidak habis tanpa terasa bersama Manifly.";
const THEME_INIT_SCRIPT = `
try {
  const raw = localStorage.getItem("manifly:ui");
  const selected = raw ? JSON.parse(raw)?.state?.theme : "system";
  const dark = selected === "dark" ||
    (selected !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
} catch {}
`;

export const metadata: Metadata = {
  metadataBase: new URL(publicConfig.siteUrl),
  title: {
    default: APP_TITLE,
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: APP_NAME,
    title: `Manifly — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `Manifly — ${APP_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Manifly — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    images: ["/opengraph-image.png"],
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
      <head>
        <script
          // Some browser extensions mutate scripts before React starts. Keep
          // this as a direct DOM node so the warning applies to the exact node.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
