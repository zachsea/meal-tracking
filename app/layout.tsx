import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Tracking",
  description: "Track food",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            {session ? (
              <AppShell>{children}</AppShell>
            ) : (
              // Login page renders without the sidebar/topbar shell
              children
            )}
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
