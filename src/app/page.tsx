import Link from "next/link";
import { ArrowRight, Bell, FileUp, QrCode, ShieldCheck, UserRound } from "lucide-react";
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
      surface: "from-white via-[#F8FBFF] to-[#ECF5FF]",
      iconTone: "from-[#5E6CFF] to-[#3650D8]",
      actionTone: "text-[#4D55E8]"
    },
    {
      title: "이수증 제출",
      description: "외부 연수 이수증을 업로드합니다.",
      action: "제출하기",
      href: "/upload",
      icon: FileUp,
      surface: "from-white via-[#FAFFFD] to-[#EAF8F1]",
      iconTone: "from-[#49C987] to-[#18A866]",
      actionTone: "text-[#17A663]"
    },
    {
      title: "내 이수현황",
      description: "이수, 미이수, 제출 상태를 확인합니다.",
      action: "확인하기",
      href: "/my",
      icon: UserRound,
      surface: "from-white via-[#FFFBFD] to-[#FFF0F6]",
      iconTone: "from-[#F46AA8] to-[#E83E8D]",
      actionTone: "text-[#E83E8D]"
    }
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="app-panel">
        <div className="app-panel-inner space-y-4 md:space-y-5">
          <section className="rounded-[22px] border border-slateblue-100 bg-white/88 px-3.5 py-2.5 shadow-[0_10px_28px_rgba(23,59,115,0.045)] md:rounded-[24px] md:px-5 md:py-3">
            <div className="flex min-w-0 items-center gap-3">
              <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F2EEFF] px-2.5 py-1 text-[11px] font-semibold text-[#5E4BE8] md:px-3 md:py-1.5 md:text-xs">
                <Bell size={14} />
                공지
              </p>
              {mainNotice ? (
                <p className="min-w-0 truncate text-sm font-medium text-slate-600 md:text-[15px]">
                  <span className="font-semibold text-brand-900">{mainNotice.제목}</span>
                  {mainNotice.내용 ? <span className="ml-2 text-slate-500">{mainNotice.내용}</span> : null}
                </p>
              ) : (
                <p className="min-w-0 truncate text-sm font-medium text-slate-500 md:text-[15px]">현재 표시할 공지사항이 없습니다.</p>
              )}
              <ArrowRight className="ml-auto shrink-0 text-brand-500" size={18} />
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3 md:gap-5">
            {portalCards.map((card) => (
              <PortalCard key={card.href} {...card} />
            ))}
          </section>

          <section className="flex items-start gap-3 rounded-[24px] border border-slateblue-100 bg-white/86 px-4 py-3.5 text-sm leading-6 text-slate-500 shadow-[0_12px_30px_rgba(23,59,115,0.045)] md:items-center md:rounded-[28px] md:px-6 md:py-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#E9FFF5] to-[#DDF5EA] text-[#18A866] shadow-[0_12px_28px_rgba(24,168,102,0.16)] md:size-[52px] md:rounded-[20px]">
              <ShieldCheck size={24} strokeWidth={1.85} />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-brand-900">안전하게 저장됩니다.</p>
              <p className="mt-1 text-slate-500">전자서명과 제출 기록은 연수 증빙용으로 저장되며, 개인정보는 안전하게 보호됩니다.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PortalCard({
  title,
  description,
  action,
  href,
  icon: Icon,
  surface,
  iconTone,
  actionTone
}: {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: typeof QrCode;
  surface: string;
  iconTone: string;
  actionTone: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[142px] overflow-hidden rounded-[28px] border border-slateblue-100 bg-gradient-to-br ${surface} p-5 shadow-[0_18px_48px_rgba(23,59,115,0.075),0_4px_14px_rgba(23,59,115,0.035)] transition duration-[250ms] ease-out hover:-translate-y-1 hover:border-brand-900 hover:shadow-[0_28px_80px_rgba(23,59,115,0.13),0_6px_20px_rgba(23,59,115,0.06)] md:min-h-[236px] md:rounded-[32px] md:p-7`}
    >
      <div className="grid w-full grid-cols-[52px_1fr_24px] items-center gap-4 md:flex md:flex-col md:items-stretch">
        <div className={`flex size-[52px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br ${iconTone} text-white shadow-[0_16px_30px_rgba(23,59,115,0.16)] ring-1 ring-white/80 md:size-16 md:rounded-[22px]`}>
          <Icon size={28} strokeWidth={1.75} className="md:size-[33px]" />
        </div>

        <div className="min-w-0 md:mt-7 md:flex-1">
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-brand-900 md:text-[2rem]">{title}</h2>
          <p className="mt-1.5 max-w-[16rem] text-sm font-medium leading-6 text-slate-600 md:mt-3 md:text-[15px] md:leading-7">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end md:mt-8 md:justify-between">
          <p className={`hidden text-[15px] font-semibold md:block ${actionTone}`}>{action}</p>
          <ArrowRight className={`transition duration-[250ms] ease-out group-hover:translate-x-1 ${actionTone}`} size={25} />
        </div>
      </div>
    </Link>
  );
}
