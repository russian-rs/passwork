import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic", "latin-ext"],
  preload: false,
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Passwork - Team Vault",
  description: "A secure, shared team vault for passwords and OTPs.",
};

import { I18nProvider } from "@/i18n/I18nProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
