import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Force Tracker",
  description: "Efficiently track sales visits and performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <LanguageProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
