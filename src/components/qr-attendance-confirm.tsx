"use client";

import { useState } from "react";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import { useStaffSession } from "@/components/staff-session-provider";

export function QrAttendanceConfirm({ eventId }: { eventId: string }) {
  const { staff } = useStaffSession();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  const submitAttendance = async () => {
    if (!staff) {
      setIsLookupOpen(true);
      return;
    }

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 450));
    setStatus("done");
  };

  if (!staff) {
    return (
      <>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          출석 전 교직원 확인이 필요합니다. 성명으로 조회한 뒤 출석을 진행해주세요.
          <button
            type="button"
            onClick={() => setIsLookupOpen(true)}
            className="mt-3 block rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white"
          >
            교직원 조회
          </button>
        </div>
        {isLookupOpen ? <MyTrainingLookupModal onClose={() => setIsLookupOpen(false)} /> : null}
      </>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-lg font-bold text-emerald-900">출석 완료</p>
        <p className="mt-2 text-sm text-emerald-800">{staff.staffName} 선생님의 출석이 확인되었습니다.</p>
        <p className="mt-1 text-xs text-emerald-700">MVP에서는 완료 상태를 화면에 표시하며, submitQrAttendance adapter로 실제 저장 연동을 이어갈 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">출석 확인</p>
      <p className="mt-2 text-lg font-bold text-slateblue-900">{staff.staffName} 선생님</p>
      <p className="mt-1 text-sm text-slate-600">출석하시겠습니까?</p>
      <button
        type="button"
        onClick={submitAttendance}
        disabled={status === "submitting"}
        className="mt-4 rounded-md bg-slateblue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-400"
      >
        {status === "submitting" ? "출석 처리 중" : "출석"}
      </button>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="staffId" value={staff.staffId} />
    </div>
  );
}
