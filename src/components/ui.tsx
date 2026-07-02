import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const statusClassMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  scheduled: "bg-brand-50 text-brand-700 ring-brand-100",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  completed: "bg-softpurple-50 text-violet-700 ring-softpurple-100",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
  제출완료: "bg-brand-50 text-brand-700 ring-brand-100",
  확인중: "bg-amber-50 text-amber-700 ring-amber-100",
  승인: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  반려: "bg-rose-50 text-rose-700 ring-rose-100",
  미이수: "bg-rose-50 text-rose-700 ring-rose-100",
  pending: "bg-slate-100 text-slate-600 ring-slate-200",
  extracted: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  needReview: "bg-amber-50 text-amber-700 ring-amber-100",
  failed: "bg-rose-50 text-rose-700 ring-rose-100",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  대기: "bg-slate-100 text-slate-600 ring-slate-200",
  생성중: "bg-brand-50 text-brand-700 ring-brand-100",
  오류: "bg-rose-50 text-rose-700 ring-rose-100"
};

const statusLabelMap: Record<string, string> = {
  draft: "준비중",
  scheduled: "예정",
  active: "진행중",
  completed: "완료",
  archived: "보관",
  pending: "대기",
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
    <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between print:hidden">
      <div>
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 transition hover:text-brand-600">
          <ArrowLeft size={17} />
          뒤로가기
        </Link>
        <h2 className="text-[2rem] font-semibold tracking-tight text-brand-900 md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-[15px] font-medium leading-7 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="app-card p-6">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-brand-900">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClassMap[value] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {statusLabelMap[value] ?? value}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-primary">
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-secondary">
      {children}
    </Link>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="app-card overflow-hidden">
      {title ? <div className="border-b border-slateblue-100 px-6 py-5 text-lg font-semibold text-brand-900">{title}</div> : null}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[26px] border border-dashed border-slateblue-100 bg-white/70 p-8 text-center">
      <p className="font-semibold text-brand-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
