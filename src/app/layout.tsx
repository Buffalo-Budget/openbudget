import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffalo Budget Tracker 2025",
  description: "Tracking Fiscal Year 2025 — General Fund Budget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
        <Script 
          src="https://d3js.org/d3.v7.min.js" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
