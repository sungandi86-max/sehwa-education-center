"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { HomeHeaderActions } from "@/components/home-staff-widgets";

const navigation = [
  { href: "/qr", label: "QR 출석" },
  { href: "/upload", label: "이수증 제출" },
  { href: "/my", label: "내 이수현황" }
];

export function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slateblue-100/70 bg-slateblue-50/82 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link href="/" className="min-w-0">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slateblue-100 bg-white/78 p-1 shadow-[0_10px_28px_rgba(23,59,115,0.045)] md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <HomeHeaderActions />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex size-11 items-center justify-center rounded-2xl border border-slateblue-100 bg-white text-brand-900 shadow-[0_10px_24px_rgba(23,59,115,0.06)] md:hidden"
          aria-label="메뉴 열기"
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {isOpen ? (
        <div className="mx-auto max-w-6xl px-4 pb-4 md:hidden">
          <div className="rounded-[24px] border border-slateblue-100 bg-white p-2 shadow-lift">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-[18px] px-4 py-3 text-base font-semibold text-brand-900 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-slateblue-100 p-2">
              <HomeHeaderActions />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
