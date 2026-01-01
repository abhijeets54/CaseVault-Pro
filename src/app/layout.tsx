import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./icon-fix.css";
import { ClerkProvider } from "@clerk/nextjs";
import ClientLayout from "@/components/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaseVault Pro - Enterprise Evidence Intelligence Platform",
  description: "Professional forensics tool for law enforcement, legal teams, and compliance. Secure evidence analysis with cryptographic chain of custody.",
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} h-full`}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
