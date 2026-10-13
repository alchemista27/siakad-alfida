import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMAKIN: Sistem Monitoring Kinerja dan Program Kerja Yayasan Alfida",
  description: "Platform pemantauan program kerja, realisasi, dan KPI Yayasan Alfida",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col justify-between bg-neutral">
        <main className="flex-1">{children}</main>
        <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200 bg-white">
          Hak Cipta &copy; {new Date().getFullYear()} Yayasan Alfida. Sistem Monitoring Kinerja (SIMAKIN).
        </footer>
      </body>
    </html>
  );
}
