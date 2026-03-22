import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://askfivestar.io"),
  title: {
    default: "AskFiveStar — Get More 5-Star Google Reviews on Autopilot",
    template: "%s | AskFiveStar",
  },
  description:
    "The simplest way for small businesses to collect 5-star Google reviews. Set up in under 5 minutes, get more reviews on autopilot. Just $29/month.",
  keywords: [
    "Google reviews",
    "review management",
    "small business reviews",
    "get more reviews",
    "5-star reviews",
    "review link generator",
    "reputation management",
    "local SEO",
  ],
  authors: [{ name: "AskFiveStar" }],
  creator: "AskFiveStar",
  publisher: "AskFiveStar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://askfivestar.io",
    siteName: "AskFiveStar",
    title: "AskFiveStar — Get More 5-Star Google Reviews on Autopilot",
    description:
      "The simplest way for small businesses to collect 5-star Google reviews. Set up in under 5 minutes. Just $29/month.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AskFiveStar — More 5-Star Reviews, Less Effort",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AskFiveStar — Get More 5-Star Google Reviews on Autopilot",
    description:
      "The simplest way for small businesses to collect 5-star Google reviews. Set up in under 5 minutes. Just $29/month.",
    images: ["/og-image.png"],
    creator: "@askfivestar",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} antialiased`}
    >
      <body className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}