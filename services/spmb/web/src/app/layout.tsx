import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPMB Yayasan Alfida - Penerimaan Peserta Didik Baru",
  description: "Sistem Penerimaan Peserta Didik Baru (SPMB) Yayasan Alfida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F7F8F8] text-[#454545] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
