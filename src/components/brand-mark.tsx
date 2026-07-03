import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 md:gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[15px] border border-brand-100 bg-white shadow-[0_8px_20px_rgba(23,59,115,0.07)] md:size-12 md:rounded-2xl md:shadow-[0_10px_24px_rgba(23,59,115,0.08)]">
        <Image
          src="/brand/교표.svg"
          alt={`${APP_CONFIG.schoolName} 교표`}
          width={32}
          height={32}
          className="max-h-7 max-w-7 object-contain md:max-h-8 md:max-w-8"
          priority
        />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-brand-900 md:text-base md:font-extrabold">{APP_CONFIG.appName}</p>
          <p className="truncate text-xs text-slate-500 md:text-sm">{APP_CONFIG.schoolName}</p>
        </div>
      ) : null}
    </div>
  );
}
