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
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <main className="flex-1">{children}</main>
        <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200">
          Hak Cipta &copy; {new Date().getFullYear()} Yayasan Alfida. Seluruh hak cipta dilindungi.
        </footer>
      </body>
    </html>
  );
}
