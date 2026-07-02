import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: `${APP_CONFIG.schoolName} 교직원 교육 및 연수 운영 시스템`
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
