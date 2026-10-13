import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIYAUM - Program Yaum Ma'al Quran Yayasan Alfida",
  description: "Sistem monitoring pelaksanaan tilawah dan hafalan Al-Quran pegawai Yayasan Alfida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
