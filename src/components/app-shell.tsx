export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slateblue-50 print:bg-white">
      <main className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-6 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
