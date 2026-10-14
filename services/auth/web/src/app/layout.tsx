import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alfida ID: Layanan Autentikasi Terpadu Yayasan Alfida",
  description: "Pintu masuk terpadu sistem informasi manajemen Yayasan Alfida",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between font-body text-primary bg-neutral">
        <main className="flex-1">{children}</main>
        <footer className="py-4 text-center text-xs text-gray-500 border-t border-border bg-white">
          Hak Cipta &copy; {new Date().getFullYear()} Yayasan Alfida. Seluruh hak cipta dilindungi.
        </footer>
      </body>
    </html>
  );
}
