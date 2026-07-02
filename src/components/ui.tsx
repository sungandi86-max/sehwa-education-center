import Link from "next/link";

const statusClassMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  scheduled: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  completed: "bg-indigo-100 text-indigo-800",
  archived: "bg-slate-200 text-slate-600",
  제출완료: "bg-sky-100 text-sky-800",
  확인중: "bg-amber-100 text-amber-800",
  승인: "bg-emerald-100 text-emerald-800",
  반려: "bg-rose-100 text-rose-800",
  미이수: "bg-rose-100 text-rose-800",
  pending: "bg-slate-100 text-slate-700",
  extracted: "bg-emerald-100 text-emerald-800",
  needReview: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  완료: "bg-emerald-100 text-emerald-800",
  대기: "bg-slate-100 text-slate-700",
  생성중: "bg-sky-100 text-sky-800",
  오류: "bg-rose-100 text-rose-800"
};

const statusLabelMap: Record<string, string> = {
  draft: "준비중",
  scheduled: "예정",
  active: "진행중",
  completed: "완료",
  archived: "보관",
  pending: "확인중",
  extracted: "추출완료",
  needReview: "확인필요",
  failed: "실패"
};

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <Link href="/" className="mb-3 inline-flex text-sm font-semibold text-slateblue-900 hover:text-brand-700">
          ← 홈으로
        </Link>
        <h2 className="text-2xl font-bold text-slateblue-900">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slateblue-900">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[value] ?? "bg-slate-100 text-slate-700"}`}>
      {statusLabelMap[value] ?? value}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center justify-center rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center justify-center rounded-md border border-slateblue-900 bg-white px-4 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50">
      {children}
    </Link>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-soft">
      {title ? <div className="border-b border-slate-200 px-5 py-4 text-base font-bold text-slateblue-900">{title}</div> : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-semibold text-slateblue-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
