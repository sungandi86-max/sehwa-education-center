import Link from "next/link";
import { Bell, ChevronRight, FileUp, QrCode, ShieldCheck, UserRound } from "lucide-react";
import { HomeHeroKpi } from "@/components/home-mobile-dashboard";
import { appsScriptClient, type NoticeRow } from "@/lib/api/appsScriptClient";

const noticeDate = (notice: NoticeRow) => notice.공지일 ?? notice.노출시작일 ?? "";

export default async function PortalHomePage() {
  const notices = await appsScriptClient.getNotices();
  const mainNotice = notices
    .filter((notice) => notice.사용여부 !== "미사용" && notice.홈노출 !== "미사용")
    .sort((a, b) => noticeDate(b).localeCompare(noticeDate(a)))[0];

  const portalCards = [
    {
      title: "QR 출석",
      description: "연수장에서 QR을 스캔하고 전자서명합니다.",
      action: "출석하기",
      href: "/qr",
      icon: QrCode,
      surface: "from-white via-[#F8FCFF] to-[#EAF6FF]",
      iconTone: "bg-[#EAF6FF] text-brand-900"
    },
    {
      title: "이수증 제출",
      description: "외부 연수 이수증을 업로드합니다.",
      action: "제출하기",
      href: "/upload",
      icon: FileUp,
      surface: "from-white via-[#FBFFFD] to-[#E7F8F1]",
      iconTone: "bg-[#E6F7F0] text-brand-900"
    },
    {
      title: "내 이수현황",
      description: "이수, 미이수, 제출 상태를 확인합니다.",
      action: "확인하기",
      href: "/my",
      icon: UserRound,
      surface: "from-white via-[#FFFBFD] to-[#FFEFF5]",
      iconTone: "bg-[#FFEAF2] text-brand-900"
    }
  ];

  return (
    <main className="mx-auto max-w-5xl">
      <div className="space-y-3.5 md:space-y-6">
        <section className="rounded-full border border-softpurple-100 bg-gradient-to-r from-softpurple-50 via-white to-brand-50/80 px-3.5 py-2.5 shadow-[0_10px_30px_rgba(23,59,115,0.035)]">
          <div className="flex min-w-0 items-center gap-3">
            <p className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-softpurple-100">
              <Bell size={12} />
              공지
            </p>
            {mainNotice ? (
              <p className="min-w-0 truncate text-sm font-medium text-slate-600">
                <span className="font-semibold text-brand-900">{mainNotice.제목}</span>
                {mainNotice.내용 ? <span className="ml-2 text-slate-500">{mainNotice.내용}</span> : null}
              </p>
            ) : (
              <p className="min-w-0 truncate text-sm font-medium text-slate-500">현재 표시할 공지사항이 없습니다.</p>
            )}
            <ChevronRight className="ml-auto shrink-0 text-brand-500" size={17} />
          </div>
        </section>

        <HomeHeroKpi />

        <section className="grid gap-3 md:grid-cols-3 md:gap-4">
          {portalCards.map((card) => (
            <PortalCard key={card.href} {...card} />
          ))}
        </section>

        <section className="flex gap-3 rounded-[24px] border border-slateblue-100 bg-white/74 px-4 py-4 text-sm leading-6 text-slate-500 shadow-[0_10px_30px_rgba(23,59,115,0.035)]">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="font-semibold text-brand-900">안전하게 저장됩니다.</p>
            <p className="mt-1">전자서명과 제출 기록은 연수 증빙용으로 저장되며, 개인정보는 안전하게 보호됩니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PortalCard({
  title,
  description,
  action,
  href,
  icon: Icon,
  surface,
  iconTone
}: {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: typeof QrCode;
  surface: string;
  iconTone: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[148px] items-center overflow-hidden rounded-[30px] border border-slateblue-100 bg-gradient-to-br ${surface} p-4 shadow-[0_18px_54px_rgba(23,59,115,0.06),0_4px_14px_rgba(23,59,115,0.03)] transition duration-200 ease-out hover:-translate-y-1 hover:border-brand-900 hover:shadow-lift md:min-h-60 md:flex-col md:items-stretch md:rounded-[32px] md:p-7`}
    >
      <div className="flex w-full items-center gap-4 md:block">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-[22px] shadow-[0_12px_26px_rgba(23,59,115,0.06)] ring-1 ring-white/80 md:size-16 md:rounded-[24px] ${iconTone}`}>
          <Icon size={29} strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 md:mt-10">
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-brand-900 md:text-[1.72rem]">{title}</h2>
          <p className="mt-1.5 line-clamp-1 text-sm font-medium leading-6 text-slate-600 md:mt-4 md:line-clamp-none md:text-[0.98rem] md:leading-7">
            {description}
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-800 md:mt-5">→ {action}</p>
        </div>

        <ChevronRight className="shrink-0 text-brand-700 transition duration-[250ms] ease-out group-hover:translate-x-1 md:absolute md:right-7 md:top-8" size={22} />
      </div>
    </Link>
  );
}
