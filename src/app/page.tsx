import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { HomeHeaderActions, MyTrainingActionCard, MyTrainingStatusCard } from "@/components/home-staff-widgets";
import { StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime, getTrainingTitle, type NoticeRow } from "@/lib/api/appsScriptClient";

function PortalActionCard({
  label,
  title,
  description,
  status,
  count,
  button,
  href
}: {
  label: string;
  title: string;
  description: string;
  status: string;
  count?: string | number;
  button: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-56 flex-col rounded-md border border-slate-200 bg-white p-5 shadow-soft transition hover:border-brand-200 hover:bg-brand-50"
    >
      <p className="text-sm font-bold text-teal-700">{label}</p>
      <h3 className="mt-2 text-xl font-bold text-slateblue-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-auto border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">{status}</p>
            {count !== undefined ? <p className="mt-1 text-xl font-bold text-slateblue-900">{count}건</p> : null}
          </div>
          <span className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
            {button}
          </span>
        </div>
      </div>
    </Link>
  );
}

const noticeDate = (notice: NoticeRow) => notice.공지일 ?? notice.노출시작일 ?? "";

export default async function PortalHomePage() {
  const [notices, events, materials] = await Promise.all([
    appsScriptClient.getNotices(),
    appsScriptClient.getTrainings(),
    appsScriptClient.getMaterials()
  ]);
  const visibleNotices = notices
    .filter((notice) => notice.사용여부 !== "미사용" && notice.홈노출 !== "미사용")
    .sort((a, b) => noticeDate(b).localeCompare(noticeDate(a)))
    .slice(0, 3);
  const openEvents = events
    .filter((event) => event.상태 === "active" || event.상태 === "scheduled")
    .sort((a, b) => a.시작일시.localeCompare(b.시작일시))
    .slice(0, 3);
  const recentMaterials = materials.slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <BrandMark />
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              교직원 교육·연수 출석, 이수 확인, 이수증 제출을 한 곳에서 확인합니다.
            </p>
          </div>
          <HomeHeaderActions />
        </div>
      </section>

      <section className="rounded-md border border-teal-100 bg-teal-50 px-5 py-3 text-sm leading-6 text-slate-700">
        <p className="font-bold text-slateblue-900">공지사항</p>
        {visibleNotices.length > 0 ? (
          <div className="mt-1 space-y-1">
            {visibleNotices.map((notice) => (
              <p key={notice.noticeId}>
                <span className="font-semibold text-slateblue-900">{notice.제목}</span>
                {notice.내용 ? <span className="ml-2">{notice.내용}</span> : null}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-1">등록된 공지사항이 없습니다.</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalActionCard
          label="QR 출석"
          title="QR 출석"
          description="오늘 진행 중인 교육에 QR로 출석합니다."
          status="오늘 출석 가능한 교육"
          count={openEvents.length}
          button="출석하기"
          href="/qr"
        />
        <MyTrainingActionCard />
        <PortalActionCard
          label="이수증 제출"
          title="이수증 제출"
          description="외부 연수 또는 온라인 연수 이수증을 제출합니다."
          status="제출 상태 확인 가능"
          button="제출하기"
          href="/upload"
        />
        <PortalActionCard
          label="교육자료"
          title="교육자료"
          description="교육자료와 안내 링크를 확인합니다."
          status="자료"
          count={materials.length}
          button="자료보기"
          href="/materials"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slateblue-900">오늘·진행 중 교육</h2>
            <p className="mt-1 text-sm text-slate-500">오늘 또는 진행 중인 교육을 최대 3건까지 표시합니다.</p>
          </div>
          <div className="space-y-3">
            {openEvents.map((event) => (
              <div
                key={event.eventId}
                className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <StatusBadge value={event.상태} />
                  <div className="min-w-0">
                    <p className="font-bold text-slateblue-900">{event.제목}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateTime(event.시작일시)} · {event.장소} · {event.담당부서}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/qr/${event.eventId}`}
                  className="shrink-0 rounded-md bg-slateblue-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  QR 출석
                </Link>
              </div>
            ))}
          </div>
        </div>

        <MyTrainingStatusCard />
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slateblue-900">최근 교육자료</h2>
            <p className="mt-1 text-sm text-slate-500">자주 찾는 자료와 최근 등록 자료입니다.</p>
          </div>
          <Link
            href="/materials"
            className="rounded-md border border-slateblue-900 bg-white px-4 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50"
          >
            자료 링크 전체 보기
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {recentMaterials.map((material) => (
            <Link
              key={material.materialId}
              href="/materials"
              className="rounded-md border border-slate-200 bg-slate-50 p-4 hover:border-brand-200 hover:bg-brand-50"
            >
              <p className="font-bold text-slateblue-900">{material.제목}</p>
              <p className="mt-2 text-sm text-slate-500">{getTrainingTitle(material.eventId, events)}</p>
              <div className="mt-4 border-t border-slate-200 pt-3">
                <span className="rounded-md bg-slateblue-900 px-3 py-2 text-sm font-semibold text-white">자료보기</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
