import type { Metadata } from "next";
import "./globals.css";
import { FoundationBrandingProvider } from "@/components/foundation-branding-provider";
import { getFoundationBranding } from "@/lib/foundation-settings";

export const metadata: Metadata = {
  title: "SPMB Yayasan Alfida - Penerimaan Peserta Didik Baru",
  description: "Sistem Penerimaan Peserta Didik Baru (SPMB) Yayasan Alfida",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getFoundationBranding();

  return (
    <html lang="id">
      <head>
        <link rel="icon" href={branding.faviconUrl || branding.logoUrl || "/favicon.ico"} />
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
      <body className="min-h-screen bg-neutral text-primary font-body antialiased">
        <FoundationBrandingProvider branding={branding}>{children}</FoundationBrandingProvider>
      </body>
    </html>
  );
}
