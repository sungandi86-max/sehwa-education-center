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
      description: "이수·미이수·제출 상태를 확인합니다.",
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
      <div className="rounded-[28px] border border-white/80 bg-white/[0.74] p-2.5 shadow-[0_22px_66px_rgba(23,59,115,0.09)] backdrop-blur md:rounded-[36px] md:p-5">
        <div className="space-y-3 rounded-[24px] border border-slateblue-100/80 bg-gradient-to-b from-white to-[#FBFCFF] p-3 md:space-y-5 md:rounded-[32px] md:p-7">
          <section className="rounded-[18px] border border-slateblue-100 bg-white/88 px-3 py-2 shadow-[0_8px_22px_rgba(23,59,115,0.04)] md:rounded-[24px] md:px-5 md:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <p className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F2EEFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5E4BE8] md:px-3 md:py-1.5 md:text-xs">
                <Bell size={12} />
                공지
              </p>
              {mainNotice ? (
                <p className="min-w-0 truncate text-[13px] font-medium text-slate-600 md:text-[15px]">
                  <span className="font-semibold text-brand-900">{mainNotice.제목}</span>
                  {mainNotice.내용 ? <span className="ml-2 text-slate-500">{mainNotice.내용}</span> : null}
                </p>
              ) : (
                <p className="min-w-0 truncate text-[13px] font-medium text-slate-500 md:text-[15px]">현재 표시할 공지사항이 없습니다.</p>
              )}
              <ArrowRight className="ml-auto shrink-0 text-brand-500" size={16} />
            </div>
          </section>

          <section className="grid gap-2.5 md:grid-cols-3 md:gap-5">
            {portalCards.map((card) => (
              <PortalCard key={card.href} {...card} />
            ))}
          </section>

          <section className="flex items-start gap-3 rounded-[20px] border border-slateblue-100 bg-white/78 px-3.5 py-3 text-[13px] leading-5 text-slate-500 shadow-[0_10px_24px_rgba(23,59,115,0.035)] md:items-center md:rounded-[28px] md:px-6 md:py-5 md:text-sm md:leading-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#E9FFF5] to-[#DDF5EA] text-[#18A866] shadow-[0_10px_22px_rgba(24,168,102,0.13)] md:size-[52px] md:rounded-[20px]">
              <ShieldCheck size={20} strokeWidth={1.85} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-brand-900 md:text-base">안전하게 저장됩니다.</p>
              <p className="mt-0.5 text-slate-500 md:mt-1">전자서명과 제출 기록은 연수 증빙용으로 저장되며, 개인정보는 안전하게 보호됩니다.</p>
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
      className={`group relative flex min-h-[104px] overflow-hidden rounded-[24px] border border-slateblue-100 bg-gradient-to-br ${surface} p-4 shadow-[0_14px_38px_rgba(23,59,115,0.065),0_3px_10px_rgba(23,59,115,0.03)] transition duration-[250ms] ease-out hover:-translate-y-1 hover:border-brand-900 hover:shadow-[0_28px_80px_rgba(23,59,115,0.13),0_6px_20px_rgba(23,59,115,0.06)] md:min-h-[236px] md:rounded-[32px] md:p-7`}
    >
      <div className="grid w-full grid-cols-[44px_1fr_22px] items-center gap-3 md:flex md:flex-col md:items-stretch">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br ${iconTone} text-white shadow-[0_12px_24px_rgba(23,59,115,0.14)] ring-1 ring-white/80 md:size-16 md:rounded-[22px]`}>
          <Icon size={24} strokeWidth={1.75} className="md:size-[33px]" />
        </div>

        <div className="min-w-0 md:mt-7 md:flex-1">
          <h2 className="text-[1.12rem] font-semibold leading-tight tracking-tight text-brand-900 md:text-[2rem]">{title}</h2>
          <p className="mt-1 max-w-none text-[13px] font-medium leading-5 text-slate-600 md:mt-3 md:max-w-[16rem] md:text-[15px] md:leading-7">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end md:mt-8 md:justify-between">
          <p className={`hidden text-[15px] font-semibold md:block ${actionTone}`}>{action}</p>
          <ArrowRight className={`transition duration-[250ms] ease-out group-hover:translate-x-1 ${actionTone}`} size={22} />
        </div>
      </div>
    </Link>
  );
}
