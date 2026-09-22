import type { Metadata } from "next";
import "./globals.css";

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await prisma.foundationSettings.findFirst();
  } catch (e) {
    console.warn("Could not fetch foundation settings during build prerender.");
  }
  
  return {
    title: settings?.foundationName ? `SIAKAD Alfida — ${settings.foundationName}` : "SIAKAD Alfida — Sistem Informasi Akademik & PPDB",
    description: "Sistem Informasi Akademik dan PPDB Yayasan Alfida",
    icons: {
      icon: settings?.logoUrl || "/favicon.ico",
    }
  };
}

import AppProgressBar from "@/components/progress-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-neutral text-primary">
        {children}
        <AppProgressBar />
      </body>
    </html>
  );
}
