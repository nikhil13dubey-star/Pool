import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pool — Split expenses with friends",
  description: "Split expenses, settle via UPI. No ads, no limits.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pool",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased" style={{ background: "#050505" }}>
        <div
          style={{
            position: "relative",
            margin: "0 auto",
            minHeight: "100%",
            maxWidth: 430,
            overflowX: "hidden",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
