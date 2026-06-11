import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copa do Mundo 2026",
  description: "Tabela da copa do mundo 2026",
  keywords: ["Copa do Mundo 2026", "Futebol", "Tabela"],
  authors: [{ name: "Felipe Reis" }],
  creator: "Felipe Reis",
  publisher: "Felipe Reis",
  openGraph: {
    title: "Copa do Mundo 2026",
    description: "Tabela da copa do mundo 2026",
    type: "website",
    locale: "pt-BR",
    siteName: "Copa do Mundo 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copa do Mundo 2026",
    description: "Tabela da copa do mundo 2026",
    creator: "Felipe Reis",
  },
};

import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
