
'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

// Note: Metadata is not supported in client components. 
// You can move this to a separate file if needed.
// export const metadata: Metadata = {
//   title: "Chatterbox",
//   description: "A WhatsApp clone built with Next.js and DRF",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <main>{children}</main>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
