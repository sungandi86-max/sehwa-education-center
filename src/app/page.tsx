import Link from "next/link";
import { FileUp, QrCode, UserRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { appsScriptClient, type NoticeRow } from "@/lib/api/appsScriptClient";

const noticeDate = (notice: NoticeRow) => notice.공지일 ?? notice.노출시작일 ?? "";

export default async function PortalHomePage() {
  const [notices, trainings] = await Promise.all([
    appsScriptClient.getNotices(),
    appsScriptClient.getTrainings()
  ]);

  const mainNotice = notices
    .filter((notice) => notice.사용여부 !== "미사용" && notice.홈노출 !== "미사용")
    .sort((a, b) => noticeDate(b).localeCompare(noticeDate(a)))[0];
  const openTrainingCount = trainings.filter((event) => event.상태 === "active" || event.상태 === "scheduled").length;

  const portalCards = [
    {
      title: "QR 출석",
      description: "교육 참석 및 전자서명",
      detail: "교육장 QR을 스캔하고 서명까지 한 번에 완료합니다.",
      status: `출석 가능 ${openTrainingCount}건`,
      cta: "→ QR 출석하기",
      href: "/qr",
      icon: QrCode,
      surface: "from-white via-[#FDFEFF] to-[#EEF7FF]",
      iconTone: "bg-gradient-to-br from-[#EAF6FF] to-[#F8FCFF] text-brand-900 ring-[#D6EAFE]"
    },
    {
      title: "이수증 제출",
      description: "외부 연수 이수증 제출",
      detail: "파일을 올리면 AI가 이수 정보를 먼저 확인합니다.",
      status: "제출 상태 확인",
      cta: "→ 이수증 제출하기",
      href: "/upload",
      icon: FileUp,
      surface: "from-white via-[#FFFDFF] to-[#F5F0FF]",
      iconTone: "bg-gradient-to-br from-[#F0E9FF] to-[#FEFCFF] text-brand-900 ring-[#E4D9FF]"
    },
    {
      title: "내 이수현황 확인",
      description: "이수 내역 및 제출 상태 조회",
      detail: "성명으로 조회하고 올해 연수 이수 상태를 확인합니다.",
      status: "성명 조회",
      cta: "→ 내 이수현황 보기",
      href: "/my",
      icon: UserRound,
      surface: "from-white via-[#FDFFFE] to-[#ECF8F3]",
      iconTone: "bg-gradient-to-br from-[#E6F7F0] to-[#FBFFFD] text-brand-900 ring-[#D7EEE4]"
    }
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center py-8 md:py-10">
      <div className="space-y-11 md:space-y-14">
        <section className="quiet-card overflow-hidden shadow-[0_22px_64px_rgba(23,59,115,0.065),0_6px_18px_rgba(23,59,115,0.035)]">
          <div className="bg-gradient-to-br from-white via-white to-brand-50/70 p-7 md:p-9">
            <div>
                <BrandMark />
                <p className="mt-5 text-sm font-semibold text-brand-600">오늘 필요한 연수 업무를 차분하게 처리하세요.</p>
                <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-slate-600">
                  QR 출석, 이수증 제출, 내 이수현황 확인을 한 곳에서 이용하세요.
                </p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-brand-100 bg-gradient-to-r from-brand-50/85 via-white to-softpurple-50/85 px-6 py-5 shadow-[0_18px_48px_rgba(23,59,115,0.045)] md:px-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">공지사항</p>
            {mainNotice ? (
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-brand-900 md:text-lg">{mainNotice.제목}</h2>
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
  detail,
  status,
  cta,
  href,
  icon: Icon,
  surface,
  iconTone
}: {
  title: string;
  description: string;
  detail: string;
  status: string;
  cta: string;
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-white/30" />
      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-[22px] ring-1 shadow-[0_14px_32px_rgba(23,59,115,0.075)] transition duration-[250ms] ease-out group-hover:scale-[1.035] group-hover:bg-white ${iconTone}`}>
          <Icon size={33} strokeWidth={1.7} />
        </div>
        <span className="rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-brand-700 shadow-[0_8px_18px_rgba(23,59,115,0.035)] ring-1 ring-white/90">
          {status}
        </span>
      </div>

      <div className="relative mt-7 min-w-0">
        <h2 className="text-[1.72rem] font-semibold leading-tight tracking-tight text-brand-900">{title}</h2>
        <p className="mt-3 text-base font-medium leading-6 text-slate-600">{description}</p>
        <p className="mt-4 text-[0.95rem] font-normal leading-7 text-slate-500">{detail}</p>
      </div>

      <p className="relative mt-auto pt-7 text-sm font-semibold text-brand-900 transition duration-[250ms] ease-out group-hover:translate-x-1">{cta}</p>
    </Link>
  );
}
