import { AppHeader } from "@/components/app-header";
import { APP_CONFIG } from "@/lib/config";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slateblue-50 print:bg-white">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-2.5 md:px-8 md:py-10 print:max-w-none print:p-0">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-3 text-xs leading-6 text-slate-400 md:px-8 print:hidden">
        <p className="font-semibold text-slate-500">{APP_CONFIG.schoolName}</p>
        <p>문의: 담당 부서 · Copyright {new Date().getFullYear()} {APP_CONFIG.shortSchoolName}</p>
      </footer>
    </div>
  );
}
