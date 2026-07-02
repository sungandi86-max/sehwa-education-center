import { Award, CheckCircle2, CircleSlash, Clock3, ExternalLink, Link2, UserCheck, Users } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AttendanceReportActions } from "@/components/attendance-report-actions";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";
import type { AttendanceReportStatus, AttendanceSummaryRow } from "@/lib/api/appsScriptAdapter";
import type { TrainingEventRow, TrainingMaterialRow } from "@/types/training";

export default async function TrainingDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const [trainings, materials, attendanceSummary] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getMaterials(),
    appsScriptClient.getAttendanceSummary(eventId).catch(() => null)
  ]);

  const event = trainings.find((item) => item.eventId === eventId);

  if (!event) {
    notFound();
  }

  const title = readEvent(event, ["교육명", "제목", "title", "?쒕ぉ"], event.eventId);
  const description = readEvent(event, ["교육내용", "설명", "description", "?ㅻ챸"]);
  const status = readEvent(event, ["상태", "status", "?곹깭"], "draft");
  const startsAt = readEvent(event, ["시작일시", "startAt", "?쒖옉?쇱떆"]);
  const endsAt = readEvent(event, ["종료일시", "endAt", "醫낅즺?쇱떆"]);
  const place = readEvent(event, ["장소", "place", "?μ냼"], "장소 미정");
  const department = readEvent(event, ["담당부서", "department", "?대떦遺??"], "담당부서 미정");
  const eventMaterials = materials.filter((material) => {
    const isPublic = readMaterial(material, ["공개여부", "public", "怨듦컻?щ?"], "true") !== "false";

    return material.eventId === eventId && isPublic;
  });

  return (
    <div className="space-y-8">
      <PageHeader title="교육 상세" description="교육 정보, 자료, 출석 증빙을 확인합니다." />

      <section className="quiet-card overflow-hidden">
        <div className="bg-gradient-to-br from-white via-white to-brand-50/70 p-7 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <StatusBadge value={status as TrainingEventRow["상태"]} />
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-brand-900 md:text-4xl">{title}</h1>
              {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
            </div>
            <div className="md:w-[420px]">
              <AttendanceReportActions eventId={event.eventId} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slateblue-100 p-7 md:grid-cols-3 md:p-8">
          <InfoItem label="일시" value={`${formatDateTime(startsAt)} - ${formatDateTime(endsAt)}`} />
          <InfoItem label="장소" value={place} />
          <InfoItem label="담당부서" value={department} />
        </div>
      </section>

      {attendanceSummary ? (
        <section id="attendance-summary" className="quiet-card overflow-hidden">
          <div className="border-b border-slateblue-100 px-7 py-5 md:px-8">
            <p className="text-sm font-bold text-brand-600">관리자 출석현황</p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-900">{attendanceSummary.trainingTitle || title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">교육 종료 후 대상자별 출석 상태와 전자서명 증빙을 확인합니다.</p>
          </div>
          <div className="space-y-6 p-7 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryMetric icon={<Users size={18} />} label="대상자 수" value={`${attendanceSummary.targetCount}명`} />
              <SummaryMetric icon={<CheckCircle2 size={18} />} label="출석완료" value={`${attendanceSummary.attendedCount}명`} tone="text-emerald-700" />
              <SummaryMetric icon={<Clock3 size={18} />} label="미출석" value={`${attendanceSummary.absentCount}명`} tone="text-amber-700" />
              <SummaryMetric icon={<Award size={18} />} label="이미 인정" value={`${attendanceSummary.recognizedCount}명`} tone="text-sky-700" />
              <SummaryMetric icon={<CircleSlash size={18} />} label="서명제외" value={`${attendanceSummary.excludedCount}명`} tone="text-rose-700" />
              <SummaryMetric icon={<UserCheck size={18} />} label="출석률" value={`${attendanceSummary.attendanceRate}%`} tone="text-brand-900" />
            </div>

            <div className="overflow-hidden rounded-[24px] border border-slateblue-100 bg-white">
              <div className="hidden grid-cols-[1.1fr_1fr_0.7fr_0.8fr_1fr_1fr_0.8fr] gap-3 border-b border-slateblue-100 bg-slateblue-50 px-4 py-3 text-xs font-bold text-slate-500 lg:grid">
                <span>성명</span>
                <span>소속부서</span>
                <span>직책</span>
                <span>상태</span>
                <span>출석일시</span>
                <span>예외사유</span>
                <span>서명</span>
              </div>
              <div className="divide-y divide-slateblue-100">
                {attendanceSummary.rows.map((row) => (
                  <AttendanceRow key={`${row.eventId}-${row.staffId}`} row={row} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="quiet-card overflow-hidden">
        <div className="border-b border-slateblue-100 px-7 py-5 md:px-8">
          <h2 className="text-xl font-semibold text-brand-900">교육자료</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">해당 교육에 등록된 자료 링크입니다.</p>
        </div>
        <div className="grid gap-4 p-7 md:grid-cols-2 md:p-8">
          {eventMaterials.length > 0 ? (
            eventMaterials.map((material) => (
              <a
                key={material.materialId}
                href={readMaterial(material, ["자료URL", "url", "link", "?먮즺URL"], "#")}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[24px] border border-slateblue-100 bg-gradient-to-br from-white via-white to-[#EEF3F8] p-5 shadow-[0_16px_44px_rgba(23,59,115,0.055)] transition duration-[250ms] ease-out hover:-translate-y-1 hover:border-brand-900 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                      {readMaterial(material, ["자료유형", "type", "?먮즺?좏삎"], "링크")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-brand-900">{readMaterial(material, ["자료명", "제목", "title", "?쒕ぉ"], "교육자료")}</h3>
                  </div>
                  <ExternalLink className="shrink-0 text-brand-700 transition duration-[250ms] group-hover:translate-x-0.5" size={19} />
                </div>
              </a>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slateblue-100 bg-white/70 p-8 text-center md:col-span-2">
              <p className="font-semibold text-brand-900">등록된 교육자료가 없습니다.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">자료가 등록되면 이 교육 상세 화면에 표시됩니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slateblue-100 bg-white/80 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-brand-900">{value}</p>
    </div>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  tone = "text-brand-900"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[22px] border border-slateblue-100 bg-white/80 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-brand-600">{icon}</span>
        <p className="text-xs font-bold">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function AttendanceRow({ row }: { row: AttendanceSummaryRow }) {
  const statusClass = getAttendanceStatusClass(row.attendanceStatus);
  const signatureUrl = row.signatureImageUrl;

  return (
    <div className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.1fr_1fr_0.7fr_0.8fr_1fr_1fr_0.8fr] lg:items-center">
      <div>
        <p className="font-extrabold text-brand-900">{row.staffName || "-"}</p>
        <p className="mt-1 text-xs font-medium text-slate-500 lg:hidden">{row.staffId}</p>
      </div>
      <DataCell label="소속부서" value={row.department || "-"} />
      <DataCell label="직책" value={row.position || "-"} />
      <div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass}`}>{row.attendanceStatus}</span>
      </div>
      <DataCell label="출석일시" value={formatDateTime(row.attendedAt) || "-"} />
      <DataCell label="예외사유" value={row.exceptionReason || "-"} />
      <div>
        {signatureUrl ? (
          <a href={signatureUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900">
            <Link2 size={15} />
            서명 확인
          </a>
        ) : (
          <span className="text-sm font-medium text-slate-400">-</span>
        )}
      </div>
    </div>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 lg:hidden">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-600 lg:mt-0">{value}</p>
    </div>
  );
}

function getAttendanceStatusClass(status: AttendanceReportStatus) {
  if (status === "출석완료") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "인정완료") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (status === "서명제외") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (status === "비대상") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}

function readEvent(event: TrainingEventRow, keys: string[], fallback = "") {
  return readRecord(event as unknown as Record<string, unknown>, keys, fallback);
}

function readMaterial(material: TrainingMaterialRow, keys: string[], fallback = "") {
  return readRecord(material as unknown as Record<string, unknown>, keys, fallback);
}

function readRecord(record: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }

  return fallback;
}
