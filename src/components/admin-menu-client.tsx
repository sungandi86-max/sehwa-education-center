"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  Home,
  LockKeyhole,
  LogOut,
  Printer,
  QrCode,
  Settings,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TrainingEventRow } from "@/types/training";

const ADMIN_AUTH_KEY = "sehwa-admin-authenticated";

type AdminMenuClientProps = {
  trainings: TrainingEventRow[];
};

type AdminMenuItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  cta: string;
  tone: string;
  status?: string;
};

const menuItems: AdminMenuItem[] = [
  {
    title: "QR 출력",
    description: "교육별 출석 QR을 생성하고 인쇄합니다.",
    icon: QrCode,
    href: "/qr",
    cta: "QR 메뉴 열기",
    tone: "from-[#EEF3FF] to-[#F8FBFF]"
  },
  {
    title: "출석현황",
    description: "교육별 출석 결과와 전자서명 상태를 확인합니다.",
    icon: ClipboardList,
    href: "#admin-training-list",
    cta: "교육 선택",
    tone: "from-[#EEFDF7] to-white"
  },
  {
    title: "최종 서명부",
    description: "감사와 증빙용 최종 서명부를 생성합니다.",
    icon: FileSpreadsheet,
    href: "#admin-training-list",
    cta: "교육 선택",
    tone: "from-[#FFF7ED] to-white"
  },
  {
    title: "교육목록 관리",
    description: "교육을 등록, 수정하고 활성 상태를 관리합니다.",
    icon: GraduationCap,
    cta: "Google Sheet에서 관리",
    status: "시트 관리",
    tone: "from-[#F5F3FF] to-white"
  },
  {
    title: "교직원 명단",
    description: "교직원 정보를 확인하고 재직 상태를 관리합니다.",
    icon: UsersRound,
    cta: "Google Sheet에서 관리",
    status: "시트 관리",
    tone: "from-[#ECFEFF] to-white"
  },
  {
    title: "설정 관리",
    description: "학교 기본정보, 브랜드, 저장 폴더를 관리합니다.",
    icon: Settings,
    cta: "Google Sheet에서 관리",
    status: "시트 관리",
    tone: "from-[#F8FAFC] to-white"
  }
];

export function AdminMenuClient({ trainings }: AdminMenuClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(ADMIN_AUTH_KEY) === "true"
  );
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const visibleTrainings = useMemo(
    () =>
      trainings
        .filter((training) => training.상태 !== "archived")
        .slice()
        .sort((a, b) => new Date(b.시작일시).getTime() - new Date(a.시작일시).getTime())
        .slice(0, 8),
    [trainings]
  );

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let mounted = true;

    fetch("/api/admin/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { data?: { adminCodeHint?: string } }) => {
        if (!mounted) return;
        setHint(result.data?.adminCodeHint ?? "");
      })
      .catch(() => {
        if (!mounted) return;
        setHint("");
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const authenticate = async () => {
    const code = pin.trim();

    if (!code || isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });
      const result = (await response.json()) as { success?: boolean; data?: { ok?: boolean; adminCodeHint?: string }; message?: string };

      if (result.data?.adminCodeHint) {
        setHint(result.data.adminCodeHint);
      }

      if (!response.ok || !result.success || !result.data?.ok) {
        setError("관리자 코드가 일치하지 않습니다.");
        return;
      }

      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
      setError("");
      setPin("");
    } catch {
      setError("관리자 인증을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setPin("");
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl">
        <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_72px_rgba(23,59,115,0.1)] md:p-8">
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-brand-900 text-white shadow-[0_16px_36px_rgba(23,59,115,0.18)]">
            <LockKeyhole size={26} strokeWidth={1.8} />
          </div>
          <p className="mt-6 text-sm font-bold text-brand-600">관리자 인증</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-900 md:text-3xl">관리자 메뉴에 접근합니다.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">교육 운영 도구는 관리자 인증 후 사용할 수 있습니다.</p>

          <div className="mt-7 space-y-3">
            <label className="block text-sm font-bold text-brand-900" htmlFor="admin-pin">
              인증 코드
            </label>
            <input
              id="admin-pin"
              type="password"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void authenticate();
                }
              }}
              className="h-14 w-full rounded-[18px] border border-slateblue-100 bg-slateblue-50 px-4 text-base font-semibold text-brand-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              placeholder="관리자 인증 코드를 입력하세요"
            />
            {hint ? <p className="rounded-[18px] bg-slateblue-50 px-4 py-3 text-sm font-medium leading-6 text-slate-600">{hint}</p> : null}
            {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={() => void authenticate()}
              disabled={!pin.trim() || isAuthenticating}
              className="btn-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isAuthenticating ? "확인 중" : "인증하기"}
              <ArrowRight size={18} />
            </button>
            <Link href="/" className="btn-secondary min-h-12">
              <Home size={18} />
              홈으로
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[28px] border border-white bg-white/82 px-5 py-4 shadow-[0_18px_48px_rgba(23,59,115,0.075)] md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[18px] bg-brand-900 text-white">
            <ShieldCheck size={21} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">Admin</p>
            <h1 className="text-xl font-extrabold text-brand-900">관리자 메뉴</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/" className="btn-secondary min-h-11 rounded-[16px] px-4 text-sm">
            <Home size={17} />
            홈으로
          </Link>
          <button type="button" onClick={signOut} className="btn-secondary min-h-11 rounded-[16px] px-4 text-sm">
            <LogOut size={17} />
            인증 해제
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_28px_80px_rgba(23,59,115,0.09)]">
        <div className="bg-gradient-to-br from-white via-[#F8FBFF] to-[#EEF5FF] px-6 py-8 md:px-10 md:py-11">
          <p className="text-sm font-bold text-brand-600">세화 교직원 교육센터</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">교육 운영 도구를 관리합니다.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
            교육목록, QR 출력, 출석현황, 최종 서명부, 교직원 명단과 학교 설정을 한곳에서 관리합니다.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 md:p-8 xl:grid-cols-3">
          {menuItems.map((item) => (
            <AdminMenuCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section id="admin-training-list" className="rounded-[32px] border border-white bg-white p-5 shadow-[0_22px_60px_rgba(23,59,115,0.075)] md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-600">교육별 운영</p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-900">출석현황과 서명부 다운로드</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">{visibleTrainings.length}개 교육 표시</p>
        </div>

        <div className="mt-5 divide-y divide-slateblue-100 overflow-hidden rounded-[24px] border border-slateblue-100">
          {visibleTrainings.length > 0 ? (
            visibleTrainings.map((training) => <AdminTrainingRow key={training.eventId} training={training} />)
          ) : (
            <div className="bg-slateblue-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">표시할 교육이 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminMenuCard({ item }: { item: AdminMenuItem }) {
  const Icon = item.icon;
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-12 items-center justify-center rounded-[20px] bg-brand-900 text-white shadow-[0_14px_28px_rgba(23,59,115,0.14)]">
          <Icon size={23} strokeWidth={1.8} />
        </div>
        {item.status ? (
          <span className="rounded-full bg-white/86 px-3 py-1 text-xs font-bold text-brand-600 ring-1 ring-slateblue-100">{item.status}</span>
        ) : null}
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-extrabold tracking-tight text-brand-900">{item.title}</h3>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{item.description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm font-extrabold text-brand-700">
        <span>{item.cta}</span>
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
    </>
  );
  const className = `group rounded-[28px] border border-slateblue-100 bg-gradient-to-br ${item.tone} p-5 shadow-[0_18px_44px_rgba(23,59,115,0.055)] transition duration-200 hover:-translate-y-1 hover:border-brand-900 hover:shadow-[0_28px_74px_rgba(23,59,115,0.11)]`;

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <div className={className} role="note">
      {body}
    </div>
  );
}

function AdminTrainingRow({ training }: { training: TrainingEventRow }) {
  return (
    <div className="grid gap-4 bg-white px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{training.상태}</span>
          <span className="text-xs font-bold text-slate-500">{training.담당부서}</span>
        </div>
        <h3 className="mt-2 truncate text-lg font-extrabold text-brand-900">{training.제목}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {formatKoreanDate(training.시작일시)} · {training.장소 || "장소 미정"}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:min-w-[320px]">
        <Link href={`/print/qr/${training.eventId}`} className="btn-secondary min-h-11 rounded-[16px] text-sm">
          <Printer size={17} />
          QR 출력
        </Link>
        <Link href={`/trainings/${training.eventId}#attendance-summary`} className="btn-primary min-h-11 rounded-[16px] text-sm">
          출석현황
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

function formatKoreanDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(date);
}
