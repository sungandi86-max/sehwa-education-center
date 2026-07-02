export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-h-56 rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
