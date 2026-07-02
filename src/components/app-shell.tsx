export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slateblue-50 print:bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
