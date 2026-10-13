import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMPEG - Sistem Informasi Kepegawaian Alfida",
  description: "Layanan pengelolaan kepegawaian, penugasan unit, absensi GPS, cuti dan pembinaan Yayasan Alfida",
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
