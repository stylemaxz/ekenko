import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-ibm-plex-sans-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sales Force Tracker",
  description: "Efficiently track sales visits and performance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ekenko",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={ibmPlexSansThai.variable}>
      <head>
      </head>
      <body className="font-sans antialiased">
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
