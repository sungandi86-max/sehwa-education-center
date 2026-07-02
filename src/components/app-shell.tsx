export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slateblue-50">
      <main className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-6">{children}</main>
    </div>
  );
}
