import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Databuddy Admin",
  description: "Admin dashboard for Databuddy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script src="http://localhost:3000/databuddy.js" data-track-performance="true" data-api-url="http://localhost:4001" strategy="afterInteractive" data-client-id="KLeXlL5zrgyV6P9IlqyL3" data-track-screen-views="true" data-track-performance="true" data-track-errors="true" data-track />
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
