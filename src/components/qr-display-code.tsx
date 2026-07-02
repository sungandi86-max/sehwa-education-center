"use client";

import QRCode from "react-qr-code";

export function QrDisplayCode({ value }: { value: string }) {
  return (
    <div className="mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
      <QRCode value={value} size={380} className="h-full w-full" viewBox="0 0 256 256" />
    </div>
  );
}
