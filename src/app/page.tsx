import Link from "next/link";
import { ChevronRight, FileUp, QrCode, UserRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
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
      description: "연수장에서 QR을 스캔하고 전자서명으로 출석을 남깁니다.",
      href: "/qr",
      icon: QrCode,
      surface: "from-white via-[#F8FCFF] to-[#EAF6FF]",
      iconTone: "bg-[#EAF6FF] text-brand-900"
    },
    {
      title: "이수증 제출",
      description: "외부 연수 이수증을 업로드하고 승인 상태를 확인합니다.",
      href: "/upload",
      icon: FileUp,
      surface: "from-white via-[#FCFAFF] to-[#F1ECFF]",
      iconTone: "bg-[#F0E9FF] text-brand-900"
    },
    {
      title: "내 이수현황",
      description: "교육별 이수, 미이수, 제출 및 승인 상태를 한 번에 봅니다.",
      href: "/my",
      icon: UserRound,
      surface: "from-white via-[#FBFFFD] to-[#E8F7F1]",
      iconTone: "bg-[#E6F7F0] text-brand-900"
    }
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center py-6 md:py-10">
      <div className="space-y-6 md:space-y-8">
        <section className="rounded-[32px] border border-slateblue-100 bg-white px-6 py-6 shadow-[0_24px_70px_rgba(23,59,115,0.07)] md:px-8 md:py-7">
          <BrandMark />
          <p className="mt-5 text-sm font-semibold text-brand-600">세화 교직원 교육센터</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-brand-900 md:text-5xl">
            필요한 교육 업무만
            <br />
            빠르게 처리하세요.
          </h1>
        </section>

        <section className="rounded-[28px] border border-brand-100 bg-gradient-to-r from-brand-50/90 via-white to-softpurple-50/90 px-5 py-4 shadow-[0_16px_44px_rgba(23,59,115,0.045)] md:px-6">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">공지</p>
            {mainNotice ? (
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-brand-900">{mainNotice.제목}</h2>
                {mainNotice.내용 ? <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-600">{mainNotice.내용}</p> : null}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500">현재 표시할 공지사항이 없습니다.</p>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {portalCards.map((card) => (
            <PortalCard key={card.href} {...card} />
          ))}
        </section>
      </div>
    </main>
  );
}

function PortalCard({
  title,
  description,
  href,
  icon: Icon,
  surface,
  iconTone
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof QrCode;
  surface: string;
  iconTone: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-64 flex-col overflow-hidden rounded-[32px] border border-slateblue-100 bg-gradient-to-br ${surface} p-7 shadow-[0_24px_72px_rgba(23,59,115,0.07),0_6px_18px_rgba(23,59,115,0.035)] transition duration-[250ms] ease-out hover:-translate-y-1 hover:border-brand-900 hover:shadow-lift md:min-h-72 md:p-8`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-[24px] shadow-[0_14px_32px_rgba(23,59,115,0.075)] ring-1 ring-white/80 ${iconTone}`}>
          <Icon size={32} strokeWidth={1.75} />
        </div>
        <ChevronRight className="mt-3 text-brand-700 transition duration-[250ms] ease-out group-hover:translate-x-1" size={24} />
      </div>

      <div className="relative mt-auto pt-10">
        <h2 className="text-[1.72rem] font-semibold leading-tight tracking-tight text-brand-900">{title}</h2>
        <p className="mt-4 text-[0.98rem] font-medium leading-7 text-slate-600">{description}</p>
      </div>
    </Link>
  );
}
