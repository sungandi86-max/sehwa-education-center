"use client";

import QRCode from "react-qr-code";

export function QrDisplayCode({ value, large = false }: { value: string; large?: boolean }) {
  return (
    <div
      className={`mx-auto flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none ${
        large ? "max-w-[560px] p-7 print:p-0" : "max-w-[460px] p-8"
      }`}
    >
      <QRCode value={value} size={380} className="h-full w-full" viewBox="0 0 256 256" />
    </div>
  );
}
