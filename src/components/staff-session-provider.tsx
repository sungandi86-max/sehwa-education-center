"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface StaffSession {
  staffId: string;
  staffName: string;
  department: string;
  position?: string;
  email?: string;
}

interface StaffSessionContextValue {
  staff: StaffSession | null;
  setStaff: (staff: StaffSession) => void;
  clearStaff: () => void;
}

const StaffSessionContext = createContext<StaffSessionContextValue | undefined>(undefined);

export function StaffSessionProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaffState] = useState<StaffSession | null>(null);

  const value = useMemo<StaffSessionContextValue>(
    () => ({
      staff,
      setStaff: setStaffState,
      clearStaff: () => setStaffState(null)
    }),
    [staff]
  );

  return <StaffSessionContext.Provider value={value}>{children}</StaffSessionContext.Provider>;
}

export function useStaffSession() {
  const context = useContext(StaffSessionContext);

  if (!context) {
    throw new Error("useStaffSession must be used within StaffSessionProvider.");
  }

  return context;
}

export function StaffSessionBanner({ compact = false }: { compact?: boolean }) {
  const { staff, clearStaff } = useStaffSession();

  if (!staff) {
    return compact ? null : (
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
        내 이수 확인 카드에서 성명으로 본인 확인을 하면 이수 확인과 이수증 제출에 같은 교직원 정보가 사용됩니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
      <p>
        <span className="font-bold text-slateblue-900">{staff.staffName} 선생님</span>
        <span className="ml-2 text-slate-600">
          {staff.department}
          {staff.staffId ? ` · ${staff.staffId}` : ""}
        </span>
      </p>
      {!compact ? (
        <button type="button" onClick={clearStaff} className="w-fit font-semibold text-slateblue-900 hover:text-brand-700">
          본인 확인 초기화
        </button>
      ) : null}
    </div>
  );
}

export function StaffSessionFields() {
  const { staff } = useStaffSession();

  if (!staff) {
    return null;
  }

  return (
    <>
      <input type="hidden" name="staffId" value={staff.staffId} />
      <input type="hidden" name="staffName" value={staff.staffName} />
      <input type="hidden" name="department" value={staff.department} />
    </>
  );
}
