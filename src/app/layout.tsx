import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lærerrommet",
  description: "Den digitale kollegaen for norske lærere",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="no" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-full bg-background-subtle text-foreground antialiased">
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
