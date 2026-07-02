"use client";

import Link from "next/link";
import { Brain, CheckCircle2, FileUp, LoaderCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import { Panel, StatusBadge } from "@/components/ui";
import { useStaffSession } from "@/components/staff-session-provider";
import { mockAiCertificateExtractor } from "@/lib/ai-certificate-extractor";
import type { AiCertificateExtraction, CertificateUploadRow, TrainingEventRow } from "@/types/training";
import type { MyTrainingLookupResult } from "@/lib/my-training-lookup";

interface UploadState {
  uploadId?: string;
  message: string;
}

export function CertificateUploadClient({ events }: { events: TrainingEventRow[] }) {
  const { staff } = useStaffSession();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.eventId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [extraction, setExtraction] = useState<AiCertificateExtraction | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<UploadState | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [statusResult, setStatusResult] = useState<CertificateUploadRow[]>([]);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const selectedEvent = useMemo(() => events.find((event) => event.eventId === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (!staff || !selectedEventId) {
      return;
    }

    const controller = new AbortController();

    const checkDuplicate = async () => {
      try {
        const response = await fetch("/api/my-training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            staffId: staff.staffId,
            staffName: staff.staffName,
            department: staff.department,
            year: 2026
          }),
          signal: controller.signal
        });
        const payload = (await response.json()) as MyTrainingLookupResult;
        const item = payload.items?.find((entry) => entry.eventId === selectedEventId);

        setDuplicateNotice(item?.uploadStatus ? "이미 제출한 이수증이 있습니다. 다시 제출하면 새 기록으로 저장됩니다." : "");
      } catch {
        setDuplicateNotice("");
      }
    };

    const timeoutId = window.setTimeout(() => {
      void checkDuplicate();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedEventId, staff]);

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setFileBase64("");
    setExtraction(null);
    setCompleted(null);
    setError("");

    if (!nextFile) {
      return;
    }

    setIsExtracting(true);

    try {
      const base64 = await readFileAsBase64(nextFile);
      const extracted = await mockAiCertificateExtractor.extract({
        fileId: `placeholder-${nextFile.name}`,
        fileName: nextFile.name,
        fileUrl: "placeholder://certificate-upload"
      });

      setFileBase64(base64);
      setExtraction({
        ...extracted,
        trainingTitle: extracted.trainingTitle || selectedEvent?.제목,
        staffName: extracted.staffName || staff?.staffName,
        aiReviewStatus: extracted.aiReviewStatus || "pending"
      });
    } catch {
      setError("파일을 읽거나 AI 추출 결과를 준비하지 못했습니다.");
    } finally {
      setIsExtracting(false);
    }
  };

  const submitUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!staff) {
      setIsLookupOpen(true);
      return;
    }

    if (!selectedEvent || !file || !extraction) {
      setError("교육, 파일, AI 추출 결과를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/certificates/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventId: selectedEvent.eventId,
          staffId: staff.staffId,
          staffName: staff.staffName,
          department: staff.department,
          fileName: file.name,
          fileBase64,
          fileId: `placeholder-${Date.now()}`,
          fileUrl: "placeholder://certificate-upload",
          fileLink: "placeholder://certificate-upload",
          certificateNumber: extraction.certificateNumber,
          trainingTitle: extraction.trainingTitle || selectedEvent.제목,
          completedAt: extraction.completedAt,
          trainingHours: extraction.trainingHours,
          issuer: extraction.issuer,
          rawText: extraction.rawText,
          confidence: extraction.confidence,
          aiReviewStatus: extraction.aiReviewStatus,
          memo: duplicateNotice || undefined
        })
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: UploadState;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "이수증 제출에 실패했습니다.");
      }

      setCompleted({
        uploadId: payload.data?.uploadId,
        message: payload.data?.message ?? "이수증 제출이 완료되었습니다."
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "이수증 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = statusQuery.trim() || staff?.staffId || "";

    if (!query) {
      setError("조회할 성명 또는 교직원ID를 입력해주세요.");
      return;
    }

    setIsStatusLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/certificates/uploads?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as {
        success?: boolean;
        data?: CertificateUploadRow[];
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "제출 상태 조회에 실패했습니다.");
      }

      setStatusResult(payload.data ?? []);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "제출 상태 조회에 실패했습니다.");
    } finally {
      setIsStatusLoading(false);
    }
  };

  if (completed) {
    return (
      <Panel>
        <div className="py-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#E9FFF5] to-[#DDF5EA] text-emerald-700 shadow-[0_18px_42px_rgba(24,168,102,0.18)]">
            <CheckCircle2 size={34} />
          </div>
          <h2 className="mt-5 text-[1.7rem] font-semibold text-brand-900">이수증 제출이 완료되었습니다.</h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">상태: 제출완료</p>
          {completed.uploadId ? <p className="mt-1 text-xs font-semibold text-slate-400">접수번호: {completed.uploadId}</p> : null}
          <p className="mt-5 text-sm leading-7 text-slate-500">담당자가 확인 후 승인/반려 처리합니다.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/my" className="btn-primary">
              내 이수현황 보기
            </Link>
            <Link href="/" className="btn-secondary">
              홈으로
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="이수증 제출">
          <div className="mb-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-500">
            <StepChip active label="파일 선택" />
            <StepChip active={Boolean(extraction) || isExtracting} label="AI 확인" />
            <StepChip active={Boolean(completed) || isSubmitting} label="제출 완료" />
          </div>

          {!staff ? (
            <div className="mb-5 rounded-[26px] border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 text-sm leading-7 text-brand-900">
              본인 확인 후 이수증을 제출할 수 있습니다.
              <button type="button" onClick={() => setIsLookupOpen(true)} className="btn-primary mt-4 w-full sm:w-auto">
                교직원 조회
              </button>
            </div>
          ) : (
            <div className="mb-5 rounded-[26px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-softpurple-50 p-5 text-sm">
              <p className="font-semibold text-brand-900">{staff.staffName} 선생님</p>
              <p className="mt-1 font-semibold text-slate-600">
                {staff.department}
                {staff.staffId ? ` · ${staff.staffId}` : ""}
              </p>
            </div>
          )}

          <form onSubmit={submitUpload} className="grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-brand-900">
              제출 대상 교육
              <select
                value={selectedEventId}
                onChange={(event) => {
                  setSelectedEventId(event.target.value);
                  setExtraction(null);
                  setCompleted(null);
                }}
                className="input-soft font-normal"
              >
                {events.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.제목}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-brand-900">
              이수증 파일
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                className="input-soft font-normal file:mr-4 file:rounded-[14px] file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-900"
              />
            </label>

            {duplicateNotice ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{duplicateNotice}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

            {isExtracting ? (
              <div className="rounded-[26px] border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 text-sm font-semibold text-brand-900">
                <LoaderCircle className="mr-2 inline animate-spin" size={17} />
                AI가 이수증 정보를 확인 중입니다.
              </div>
            ) : extraction ? (
              <AiExtractionPanel extraction={extraction} fallbackTitle={selectedEvent?.제목 ?? ""} fallbackName={staff?.staffName ?? ""} />
            ) : (
              <div className="rounded-[26px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-softpurple-50 p-5 text-sm leading-7 text-slate-700">
                <div className="mb-2 flex items-center gap-2 font-semibold text-brand-900">
                  <Sparkles size={18} />
                  파일 선택 후 AI 추출 결과를 확인합니다
                </div>
                MVP에서는 파일 URL을 placeholder로 저장하고, 추출 정보는 제출 기록에 함께 저장합니다.
              </div>
            )}

            <button disabled={isSubmitting || isExtracting || !staff || !file || !extraction} className="btn-primary">
              {isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <FileUp size={17} />}
              제출
            </button>
          </form>
        </Panel>

        <Panel title="내 제출 상태 확인">
          <form onSubmit={loadStatus} className="mb-5 flex flex-col gap-3 md:flex-row">
            <input
              value={statusQuery}
              onChange={(event) => setStatusQuery(event.target.value)}
              className="input-soft min-w-0 flex-1"
              placeholder={staff ? `${staff.staffId} 또는 성명` : "성명 또는 교직원ID"}
            />
            <button className="btn-primary">
              {isStatusLoading ? <LoaderCircle className="animate-spin" size={17} /> : <Search size={17} />}
              조회
            </button>
          </form>

          <div className="space-y-4">
            {statusResult.length > 0 ? (
              statusResult.map((upload) => (
                <UploadStatusCard key={upload.uploadId} upload={upload} trainingTitle={events.find((event) => event.eventId === upload.eventId)?.제목 ?? upload.trainingTitle ?? upload.eventId} />
              ))
            ) : (
              <p className="rounded-[20px] bg-slateblue-50 p-5 text-sm text-slate-500">제출 상태를 조회해주세요.</p>
            )}
          </div>
        </Panel>
      </div>

      {isLookupOpen ? <MyTrainingLookupModal onClose={() => setIsLookupOpen(false)} /> : null}
    </>
  );
}

function AiExtractionPanel({
  extraction,
  fallbackTitle,
  fallbackName
}: {
  extraction: AiCertificateExtraction;
  fallbackTitle: string;
  fallbackName: string;
}) {
  return (
    <div className="rounded-[26px] border border-slateblue-100 bg-gradient-to-br from-white to-slateblue-50 p-5 shadow-[0_12px_30px_rgba(23,59,115,0.045)]">
      <p className="mb-4 font-semibold text-brand-900">AI 추출 결과 확인</p>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <AiField label="이수증 번호" value={extraction.certificateNumber ?? "확인 필요"} />
        <AiField label="연수명" value={extraction.trainingTitle ?? fallbackTitle} />
        <AiField label="성명" value={extraction.staffName ?? fallbackName} />
        <AiField label="이수일자" value={extraction.completedAt ?? "확인 필요"} />
        <AiField label="이수시간" value={extraction.trainingHours ?? "확인 필요"} />
        <AiField label="발급기관" value={extraction.issuer ?? "확인 필요"} />
        <AiField label="신뢰도" value={`${Math.round((extraction.confidence ?? 0) * 100)}%`} icon={<Brain size={16} />} />
      </div>
    </div>
  );
}

function UploadStatusCard({ upload, trainingTitle }: { upload: CertificateUploadRow; trainingTitle: string }) {
  const certificateNumber = upload.이수증번호 ?? upload.certificateNumber;
  const submittedTrainingTitle = upload.연수명 ?? upload.trainingTitle ?? trainingTitle;
  const completedAt = upload.이수일자 ?? upload.completedAt;
  const issuer = upload.이수기관 ?? upload.issuer;
  const fileLink = upload.파일링크 ?? upload.파일URL;

  return (
    <div className="rounded-[26px] border border-slateblue-100 bg-gradient-to-br from-white to-slateblue-50 p-5 shadow-[0_12px_32px_rgba(23,59,115,0.045)] transition hover:-translate-y-1 hover:border-brand-900 hover:bg-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-brand-900">{submittedTrainingTitle}</p>
          <p className="mt-1 text-sm text-slate-500">
            {upload.파일명} · {formatSimpleDate(upload.업로드일시)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={upload.상태} />
          <StatusBadge value={upload.aiReviewStatus} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slateblue-100 pt-5 text-sm md:grid-cols-3">
        <AiField label="이수증 번호" value={certificateNumber ?? "확인 중"} />
        <AiField label="연수명" value={submittedTrainingTitle} />
        <AiField label="성명" value={upload.성명} />
        <AiField label="이수일자" value={completedAt ?? "확인 중"} />
        <AiField label="이수시간" value={upload.trainingHours ?? "확인 중"} />
        <AiField label="발급기관" value={issuer ?? "확인 중"} />
        <AiField label="파일링크" value={fileLink || "확인 중"} />
        <AiField label="신뢰도" value={`${Math.round((Number(upload.confidence) || 0) * 100)}%`} icon={<Brain size={16} />} />
      </div>
    </div>
  );
}

function AiField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_20px_rgba(23,59,115,0.035)]">
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </span>
      <p className="mt-2 font-semibold text-brand-900">{value}</p>
    </div>
  );
}

function StepChip({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`rounded-full px-3 py-2 ${active ? "bg-brand-50 text-brand-900 ring-1 ring-brand-100" : "bg-slateblue-50 text-slate-400"}`}>
      {label}
    </div>
  );
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSimpleDate(value?: string) {
  if (!value) {
    return "업로드일시 확인 중";
  }

  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(date);
}
