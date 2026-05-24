import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ShadowTwin — Digital Identity Protection",
    template: "%s | ShadowTwin",
  },
  description: "AI-powered digital identity theft detection and protection platform.",
  keywords: ["cybersecurity", "identity theft", "deepfake detection", "digital protection", "OSINT"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
