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
      <head>
        <link rel="icon" type="image/png" href="https://s3.alfida.or.id/sim-alfida/sim-alfida/foundation/logo-1790054535826" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-neutral text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
