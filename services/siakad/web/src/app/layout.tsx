import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIAKAD Alfida: Sistem Informasi Akademik",
  description: "Layanan authoritative operasional akademik Yayasan Alfida (SIAKAD)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between font-body text-[#454545] bg-[#F7F8F8]">
        {children}
      </body>
    </html>
  );
}
