import Link from "next/link";
import { ExternalLink, FileUp, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { AttendanceReportActions } from "@/components/attendance-report-actions";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";
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
            <div className="grid gap-2 sm:grid-cols-2 md:w-[360px] md:grid-cols-1">
              <Link href={`/qr/${event.eventId}`} className="btn-primary">
                <QrCode size={18} />
                QR 출석
              </Link>
              <Link href="/upload" className="btn-secondary">
                <FileUp size={18} />
                이수증 제출
              </Link>
              <div className="sm:col-span-2 md:col-span-1">
                <AttendanceReportActions eventId={event.eventId} />
              </div>
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
            <h2 className="text-xl font-semibold text-brand-900">출석현황</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              대상 {attendanceSummary.targetCount}명 · 출석 {attendanceSummary.attendedCount}명 · 미출석 {attendanceSummary.absentCount}명 · 출석률{" "}
              {attendanceSummary.attendanceRate}%
            </p>
          </div>
          <div className="grid gap-3 p-7 md:p-8">
            {attendanceSummary.rows.slice(0, 12).map((row) => (
              <div key={`${row.eventId}-${row.staffId}`} className="flex flex-col gap-2 rounded-[22px] border border-slateblue-100 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-brand-900">{row.staffName}</p>
                  <p className="text-sm text-slate-500">
                    {row.department} · {row.staffId}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-brand-800">{row.attendanceStatus}</span>
              </div>
            ))}
            {attendanceSummary.rows.length > 12 ? (
              <p className="text-sm text-slate-500">전체 명단은 최종 명단 다운로드 파일에서 확인할 수 있습니다.</p>
            ) : null}
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
