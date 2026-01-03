import type { Metadata } from "next";
import { Trirong } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";

const trirong = Trirong({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['thai', 'latin'],
  variable: '--font-trirong',
  display: 'swap',
});

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
      <head>
      </head>
      <body className={`${trirong.variable} font-sans antialiased`}>
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
