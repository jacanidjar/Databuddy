import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Databuddy Dashboard",
  description: "Analytics dashboard for Databuddy platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <Script src="/databuddy.js" defer/>
      <Script id="databuddy-init">
        {`
          window.db = window.db || {q: []};
          window.db.q = window.db.q || [];
          window.db.q.push([
            "init", 
            {
              clientId: "5ced32e5-0219-4e75-a18a-ad9826f85698",
              apiUrl: "${process.env.NEXT_PUBLIC_DATABUDDY_API_URL || 'https://api.databuddy.cc'}",
              trackScreenViews: true,
              trackOutgoingLinks: true
            }
          ]);
          window.db("ready");
        `}
      </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster duration={1500} position="top-center" closeButton />
      </body>
    </html>
  );
}
