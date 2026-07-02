import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-white shadow-[0_10px_24px_rgba(23,59,115,0.08)]">
        <Image
          src="/brand/교표.svg"
          alt={`${APP_CONFIG.schoolName} 교표`}
          width={32}
          height={32}
          className="max-h-8 max-w-8 object-contain"
          priority
        />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-brand-900">{APP_CONFIG.appName}</p>
          <p className="truncate text-sm text-slate-500">{APP_CONFIG.schoolName}</p>
        </div>
      ) : null}
    </div>
  );
}
