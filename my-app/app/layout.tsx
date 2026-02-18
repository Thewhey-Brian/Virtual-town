import type { Metadata, Viewport } from "next";
import { Nunito, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "虚拟小镇 Virtual Town v2.0",
  description: "AI驱动的虚拟生活模拟 - 探索居民们衣食住行的生活故事",
  keywords: ["虚拟小镇", "AI模拟", "生活模拟", "Virtual Town", "AI Simulation"],
  authors: [{ name: "Virtual Town" }],
  openGraph: {
    title: "虚拟小镇 Virtual Town v2.0",
    description: "AI驱动的虚拟生活模拟 - 探索居民们衣食住行的生活故事",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${notoSansSC.variable} font-sans antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
