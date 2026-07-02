import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { MyTrainingLookupCard } from "@/components/my-training-lookup-modal";
import { StaffSessionBanner } from "@/components/staff-session-provider";
import { StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime, getTrainingTitle } from "@/lib/api/appsScriptClient";

function PortalActionCard({
  label,
  title,
  description,
  status,
  button,
  href
}: {
  label: string;
  title: string;
  description: string;
  status: string;
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
          <p className="font-bold text-slateblue-900">{status}</p>
          <span className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
            {button}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function PortalHomePage() {
  const [notices, events, materials, sampleHistory] = await Promise.all([
    appsScriptClient.getNotices(),
    appsScriptClient.getTrainings(),
    appsScriptClient.getMaterials(),
    appsScriptClient.getMyTrainingHistory("T-1004", 2026)
  ]);
  const openEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");
  const completedCount = sampleHistory.completions.filter((row) => row.이수완료).length;
  const incompleteCount = sampleHistory.completions.length - completedCount;
  const pendingUploads = sampleHistory.uploads.filter((upload) => upload.상태 === "제출완료" || upload.상태 === "확인중").length;
  const recentMaterials = materials.slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
        <BrandMark />
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          교직원 교육·연수 출석, 이수 확인, 이수증 제출을 한 곳에서 확인합니다.
        </p>
      </section>

      <StaffSessionBanner />

      <section className="rounded-md border border-teal-100 bg-teal-50 px-5 py-3 text-sm leading-6 text-slate-700">
        <p className="font-bold text-slateblue-900">공지사항</p>
        {notices.length > 0 ? (
          <div className="mt-1 space-y-1">
            {notices.slice(0, 2).map((notice) => (
              <p key={notice.noticeId}>
                <span className="font-semibold text-slateblue-900">{notice.제목}</span>
                {notice.내용 ? <span className="ml-2">{notice.내용}</span> : null}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-1">
            교육 등록과 대상자 관리는 Google Sheet에서 담당자가 관리합니다. 이 화면은 교직원이 QR 출석, 이수 확인, 이수증 제출,
            교육자료 확인을 하는 포털입니다.
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalActionCard
          label="QR 출석"
          title="QR 출석"
          description="오늘 진행 중인 교육에 QR로 출석합니다."
          status={`출석 가능한 교육 ${openEvents.length}건`}
          button="출석하기"
          href="/qr"
        />
        <MyTrainingLookupCard completedCount={completedCount} incompleteCount={incompleteCount} />
        <PortalActionCard
          label="이수증 제출"
          title="이수증 제출"
          description="외부 연수 또는 온라인 연수 이수증을 제출합니다."
          status={`승인대기 ${pendingUploads}건`}
          button="제출하기"
          href="/upload"
        />
        <PortalActionCard
          label="교육자료"
          title="교육자료"
          description="교육자료와 안내 링크를 확인합니다."
          status={`자료 ${materials.length}건`}
          button="자료보기"
          href="/materials"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slateblue-900">오늘·이번 주 진행 교육</h2>
            <p className="mt-1 text-sm text-slate-500">이번 주 참여 가능한 교육입니다.</p>
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
                  href={`/trainings/${event.eventId}/qr`}
                  className="shrink-0 rounded-md bg-slateblue-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  QR 출석
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slateblue-900">내 교육 현황 미리보기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">이름 또는 교직원ID를 입력하면 내 이수현황을 확인할 수 있습니다.</p>
          <div className="mt-4">
            <StaffSessionBanner compact />
          </div>
          <div className="mt-4 grid gap-3">
            <Link href="/my" className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-brand-200 hover:bg-brand-50">
              <p className="text-sm font-semibold text-slate-500">샘플 조회 상태</p>
              <p className="mt-1 font-bold text-slateblue-900">이수 완료 {completedCount}건 · 미이수 {incompleteCount}건</p>
            </Link>
            <Link href="/upload" className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 hover:border-brand-200 hover:bg-brand-50">
              <p className="text-sm font-semibold text-slate-500">이수증 제출 상태</p>
              <p className="mt-1 font-bold text-slateblue-900">승인 대기 {pendingUploads}건 · AI 추출 결과 표시</p>
            </Link>
          </div>
        </div>
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
