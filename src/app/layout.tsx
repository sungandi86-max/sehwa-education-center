import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./print.css";
import { AppShell } from "@/components/app-shell";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { StaffSessionProvider } from "@/components/staff-session-provider";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: `${APP_CONFIG.schoolName} 교직원 교육 및 연수 운영 시스템`,
  manifest: "/manifest.json",
  applicationName: APP_CONFIG.appName,
  appleWebApp: {
    capable: true,
    title: APP_CONFIG.appName,
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#173B73"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <StaffSessionProvider>
          <ServiceWorkerRegister />
          <AppShell>{children}</AppShell>
        </StaffSessionProvider>
      </body>
    </html>
  );
}
