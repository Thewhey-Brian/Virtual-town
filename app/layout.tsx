import type { Metadata, Viewport } from "next";
import { Nunito, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { TownProvider } from "@/lib/town-context";
import { ErrorBoundary } from "@/components/error-boundary";
import Script from "next/script";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://virtual-town-v2.vercel.app'),
  title: {
    default: "虚拟小镇 Virtual Town v3.0",
    template: "%s | 虚拟小镇 Virtual Town",
  },
  description: "AI驱动的虚拟生活模拟 - 实时探索居民们衣食住行的生活故事，体验沉浸式时间流动与互动",
  keywords: [
    "虚拟小镇", 
    "AI模拟", 
    "生活模拟", 
    "Virtual Town", 
    "AI Simulation", 
    "实时模拟", 
    "时间控制",
    "虚拟人物",
    "AI居民",
    "生活故事",
  ],
  authors: [{ name: "Virtual Town", url: "https://virtual-town-v2.vercel.app" }],
  creator: "Virtual Town Team",
  publisher: "Virtual Town",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: "虚拟小镇 Virtual Town",
    title: "虚拟小镇 Virtual Town v3.0",
    description: "AI驱动的虚拟生活模拟 - 实时探索居民们衣食住行的生活故事",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "虚拟小镇 Virtual Town - AI驱动的虚拟生活模拟",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "虚拟小镇 Virtual Town v3.0",
    description: "AI驱动的虚拟生活模拟 - 实时探索居民们衣食住行的生活故事",
    images: ["/og-image.png"],
    creator: "@virtualtown",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "虚拟小镇",
  },
  applicationName: "虚拟小镇 Virtual Town",
  formatDetection: {
    telephone: false,
  },
  category: "games",
  classification: "entertainment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
  colorScheme: "light dark",
};

// Service worker registration script
const serviceWorkerScript = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="zh-CN" 
      suppressHydrationWarning
      className={`${nunito.variable} ${notoSansSC.variable}`}
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        
        {/* PWA tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="虚拟小镇" />
        <meta name="msapplication-TileColor" content="#e59a3d" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="application-name" content="虚拟小镇 Virtual Town" />
        
        {/* Theme color for browsers */}
        <meta name="theme-color" content="#fefbf7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1816" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className="font-sans antialiased min-h-screen bg-background text-foreground"
      >
        <ErrorBoundary>
          <TownProvider>
            {children}
          </TownProvider>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {serviceWorkerScript}
        </Script>
      </body>
    </html>
  );
}
