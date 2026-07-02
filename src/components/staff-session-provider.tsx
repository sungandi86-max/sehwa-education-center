"use client";

import Link from "next/link";
import { ChevronDown, RotateCcw, Search, UserRound } from "lucide-react";
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
  const [staff, setStaffState] = useState<StaffSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const saved = window.sessionStorage.getItem("sehwa-staff-session");
    return saved ? (JSON.parse(saved) as StaffSession) : null;
  });

  const setStaff = (nextStaff: StaffSession) => {
    setStaffState(nextStaff);
    window.sessionStorage.setItem("sehwa-staff-session", JSON.stringify(nextStaff));
  };

  const clearStaff = () => {
    setStaffState(null);
    window.sessionStorage.removeItem("sehwa-staff-session");
  };

  const value = useMemo<StaffSessionContextValue>(
    () => ({
      staff,
      setStaff,
      clearStaff
    }),
    [staff]
  );

  return <StaffSessionContext.Provider value={value}>{children}</StaffSessionContext.Provider>;
}

export function HeaderStaffMenu({ onLookup }: { onLookup?: () => void }) {
  const { staff, clearStaff } = useStaffSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!staff) {
    return onLookup ? (
      <button type="button" onClick={onLookup} className="btn-secondary">
        <Search size={17} />
        교직원 조회
      </button>
    ) : null;
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="btn-secondary bg-white/90">
        <UserRound size={17} />
        {staff.staffName} 선생님
        <ChevronDown size={16} />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-20 mt-3 w-56 rounded-[20px] border border-slateblue-100 bg-white p-2 text-sm shadow-lift">
          <Link href="/my" className="flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-brand-50">
            <UserRound size={16} />
            내 교육현황
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              clearStaff();
              onLookup?.();
            }}
            className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-brand-50"
          >
            <RotateCcw size={16} />
            다른 사용자 조회
          </button>
        </div>
      ) : null}
    </div>
  );
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
      <div className="quiet-card px-5 py-4 text-sm leading-6 text-slate-600">
        본인 확인 후 QR 출석, 이수증 제출, 내 이수현황에서 같은 교직원 정보가 사용됩니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-brand-100 bg-gradient-to-r from-brand-50 to-softpurple-50 px-5 py-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
      <p>
        <span className="font-bold text-brand-900">{staff.staffName} 선생님</span>
        <span className="ml-2 text-slate-600">
          {staff.department}
          {staff.staffId ? ` · ${staff.staffId}` : ""}
        </span>
      </p>
      {!compact ? (
        <button type="button" onClick={clearStaff} className="w-fit font-bold text-brand-900 hover:text-brand-600">
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
