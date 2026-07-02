"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eraser, Home, LoaderCircle, PenLine, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import { useStaffSession, type StaffSession } from "@/components/staff-session-provider";

export interface QrAttendanceEventInfo {
  eventId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  department: string;
}

type FlowStep = "confirm" | "signature" | "saving" | "done";

interface AttendanceResult {
  message?: string;
  status?: "completed" | "already";
  completedCount?: number;
  skippedCount?: number;
  results?: {
    eventId?: string;
    status?: "completed" | "already";
    message?: string;
  }[];
}

export function QrAttendanceConfirm({
  event,
  events,
  groupId
}: {
  event?: QrAttendanceEventInfo;
  events?: QrAttendanceEventInfo[];
  groupId?: string;
}) {
  const { staff } = useStaffSession();
  const attendanceEvents = events?.length ? events : event ? [event] : [];
  const isGroup = Boolean(groupId) || attendanceEvents.length > 1;
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [step, setStep] = useState<FlowStep>("confirm");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AttendanceResult | null>(null);

  const goToSignature = () => {
    if (!staff) {
      setIsLookupOpen(true);
      return;
    }

    setMessage("");
    setStep("signature");
  };

  const submitAttendance = async () => {
    if (!staff) {
      setIsLookupOpen(true);
      return;
    }

    if (!signature) {
      setMessage("전자서명을 입력해주세요.");
      return;
    }

    setMessage("");
    setStep("saving");
    const startedAt = Date.now();

    try {
      const response = await fetch("/api/attendance/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: isGroup ? "group" : "single",
          eventId: isGroup ? undefined : attendanceEvents[0]?.eventId,
          eventIds: isGroup ? attendanceEvents.map((item) => item.eventId) : undefined,
          groupId,
          staffId: staff.staffId,
          staffName: staff.staffName,
          department: staff.department,
          position: staff.position,
          signature
        })
      });
      const payload = (await response.json()) as AttendanceResult & { message?: string };
      const elapsed = Date.now() - startedAt;

      if (elapsed < 650) {
        await new Promise((resolve) => setTimeout(resolve, 650 - elapsed));
      }

      if (!response.ok) {
        throw new Error(payload.message ?? "출석 처리 중 오류가 발생했습니다.");
      }

      setResult(payload);
      setMessage(payload.message ?? "출석이 완료되었습니다.");
      setStep("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "출석 처리 중 오류가 발생했습니다.");
      setStep("signature");
    }
  };

  return (
    <>
      {step === "confirm" ? (
        <AttendanceConfirmScreen
          events={attendanceEvents}
          isGroup={isGroup}
          staff={staff}
          onLookup={() => setIsLookupOpen(true)}
          onContinue={goToSignature}
        />
      ) : null}
      {step === "signature" ? (
        <SignatureScreen
          isGroup={isGroup}
          eventCount={attendanceEvents.length}
          signature={signature}
          message={message}
          onBack={() => setStep("confirm")}
          onChange={setSignature}
          onSubmit={submitAttendance}
        />
      ) : null}
      {step === "saving" ? <SavingScreen /> : null}
      {step === "done" && staff ? (
        <DoneScreen events={attendanceEvents} staffName={staff.staffName} message={message} result={result} />
      ) : null}
      {isLookupOpen ? <MyTrainingLookupModal onClose={() => setIsLookupOpen(false)} /> : null}
    </>
  );
}

function AttendanceConfirmScreen({
  events,
  isGroup,
  staff,
  onLookup,
  onContinue
}: {
  events: QrAttendanceEventInfo[];
  isGroup: boolean;
  staff: StaffSession | null;
  onLookup: () => void;
  onContinue: () => void;
}) {
  const mainEvent = events[0];

  return (
    <section className="quiet-card animate-soft-in overflow-hidden">
      <div className="bg-gradient-to-br from-white via-white to-brand-50/80 p-6 sm:p-7">
        <p className="text-sm font-semibold text-brand-600">{isGroup ? "묶음 QR 출석" : "교육 정보 확인"}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-brand-900">
          {isGroup ? "한 번의 서명으로 여러 교육에 출석합니다." : mainEvent.title}
        </h1>
        {isGroup ? (
          <p className="mt-3 text-sm leading-7 text-slate-600">이번 서명으로 아래 교육에 출석 처리됩니다.</p>
        ) : null}
      </div>

      <div className="space-y-5 p-6">
        {isGroup ? (
          <div className="space-y-3">
            {events.map((item, index) => (
              <div key={item.eventId} className="rounded-[22px] border border-slateblue-100 bg-white/80 p-4">
                <p className="text-xs font-semibold text-brand-600">{index + 1}번째 교육</p>
                <p className="mt-1 text-lg font-semibold text-brand-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.date} {item.time} · {item.location} · {item.department}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="일시" value={`${mainEvent.date} ${mainEvent.time}`} />
            <InfoRow label="장소" value={mainEvent.location} />
            <InfoRow label="담당부서" value={mainEvent.department} />
          </div>
        )}

        <StaffBox staff={staff} onLookup={onLookup} />

        <p className="text-center text-lg font-semibold text-brand-900">
          {isGroup ? `위 ${events.length}개 교육에 출석하시겠습니까?` : "위 교육에 출석하시겠습니까?"}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/" className="btn-secondary">
            취소
          </Link>
          <button type="button" onClick={onContinue} className="btn-primary">
            출석하기
          </button>
        </div>
      </div>
    </section>
  );
}

function StaffBox({ staff, onLookup }: { staff: StaffSession | null; onLookup: () => void }) {
  return (
    <div className="rounded-[24px] border border-slateblue-100 bg-slateblue-50/70 p-5">
      {staff ? (
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-white text-brand-900 shadow-soft">
            <UserRound size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-900">{staff.staffName} 선생님</p>
            <p className="mt-1 text-sm text-slate-500">
              {staff.department}
              {staff.staffId ? ` · ${staff.staffId}` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-brand-900">출석 전 본인 확인이 필요합니다.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">성명으로 교직원을 조회한 뒤 출석을 진행해주세요.</p>
          <button type="button" onClick={onLookup} className="btn-secondary mt-4 w-full">
            <Search size={17} />
            교직원 조회
          </button>
        </div>
      )}
    </div>
  );
}

function SignatureScreen({
  isGroup,
  eventCount,
  signature,
  message,
  onBack,
  onChange,
  onSubmit
}: {
  isGroup: boolean;
  eventCount: number;
  signature: string;
  message: string;
  onBack: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="quiet-card animate-soft-in p-6">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-900">
        <ArrowLeft size={17} />
        이전으로
      </button>

      <div>
        <p className="text-sm font-semibold text-brand-600">전자서명 안내</p>
        <h2 className="mt-2 text-3xl font-semibold text-brand-900">전자서명</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          연수 증빙용으로 사용됩니다. {isGroup ? `서명 한 번으로 ${eventCount}개 교육에 같은 서명이 연결됩니다.` : "아래 영역에 서명해주세요."}
        </p>
      </div>

      <div className="mt-7">
        <SignaturePad onChange={onChange} />
      </div>

      {message ? <p className="mt-6 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{message}</p> : null}

      <button type="button" onClick={onSubmit} disabled={!signature} className="btn-primary mt-8 min-h-14 w-full">
        <PenLine size={17} />
        서명 완료 및 저장
      </button>
    </section>
  );
}

function SavingScreen() {
  return (
    <section className="quiet-card animate-soft-in p-8 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-50 text-brand-900">
        <LoaderCircle size={38} className="animate-spin" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-brand-900">출석 정보를 저장하고 있습니다...</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">잠시만 기다려주세요.</p>
    </section>
  );
}

function DoneScreen({
  events,
  staffName,
  message,
  result
}: {
  events: QrAttendanceEventInfo[];
  staffName: string;
  message: string;
  result: AttendanceResult | null;
}) {
  const completedCount = result?.completedCount ?? (result?.status === "already" ? 0 : events.length === 1 ? 1 : 0);
  const skippedCount = result?.skippedCount ?? (result?.status === "already" ? 1 : 0);
  const resultByEventId = new Map((result?.results ?? []).map((item) => [item.eventId, item]));

  return (
    <section className="quiet-card animate-soft-in overflow-hidden text-center">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-brand-50 p-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white text-emerald-600 shadow-soft">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-brand-900">출석이 완료되었습니다.</h2>
        <p className="mt-3 text-base font-medium leading-7 text-slate-600">
          {staffName} 선생님, 감사합니다.
          <br />
          {message}
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCount label="완료" value={completedCount} tone="text-emerald-700" />
          <ResultCount label="이미 출석" value={skippedCount} tone="text-amber-700" />
        </div>

        <div className="mt-5 space-y-3 text-left">
          {events.map((event) => {
            const eventResult = resultByEventId.get(event.eventId);
            const status = eventResult?.status ?? result?.status;
            const statusLabel = status === "already" ? "이미 출석" : status === "completed" ? "완료" : "처리됨";
            const statusClass =
              status === "already" ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100";

            return (
              <div key={event.eventId} className="rounded-[22px] border border-slateblue-100 bg-slateblue-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-600">교육명</p>
                    <p className="mt-1 text-lg font-semibold text-brand-900">{event.title}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}>{statusLabel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {event.date} {event.time} · {event.location}
                </p>
                {eventResult?.message ? <p className="mt-2 text-sm font-medium text-slate-600">{eventResult.message}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/" className="btn-secondary">
            <Home size={17} />
            홈으로
          </Link>
          <Link href="/my" className="btn-primary">
            내 이수 확인
          </Link>
        </div>
      </div>
    </section>
  );
}

function ResultCount({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-[22px] border border-slateblue-100 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value}건</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-brand-900">{value}</p>
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const preventScroll = (event: TouchEvent) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.scale(scale, scale);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 3.5;
      context.strokeStyle = "#173B73";
    };

    resize();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("resize", resize);
    return () => {
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const point = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    onChange(canvas.toDataURL("image/png"));
  };

  const stopDrawing = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    event?.preventDefault();
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="select-none overscroll-contain">
      <div className="rounded-[24px] border border-slateblue-100 bg-white p-3 shadow-inner">
        <canvas
          ref={canvasRef}
          className="h-64 w-full touch-none select-none overscroll-contain rounded-[18px] bg-white sm:h-80"
          style={{
            touchAction: "none",
            overscrollBehavior: "contain",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
      <div className="mt-5 flex justify-end pb-2">
      <button type="button" onClick={clear} className="btn-secondary min-h-12 w-auto px-5">
        <Eraser size={17} />
        다시쓰기
      </button>
      </div>
    </div>
  );
}
