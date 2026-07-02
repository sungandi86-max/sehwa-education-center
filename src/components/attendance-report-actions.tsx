"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Download, Printer } from "lucide-react";

export function AttendanceReportActions({ eventId }: { eventId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const downloadReport = async () => {
    setIsDownloading(true);
    setMessage("");

    try {
      const response = await fetch("/api/attendance/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ eventId })
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          fileUrl?: string;
          fileName?: string;
        };
      };

      if (!response.ok || !result.success || !result.data?.fileUrl) {
        setMessage(result.message || "최종 명단을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      window.open(result.data.fileUrl, "_blank", "noopener,noreferrer");
      setMessage(`${result.data.fileName || "최종 명단"} 파일을 열었습니다.`);
    } catch {
      setMessage("최종 명단을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Link href={`/print/qr/${eventId}`} className="btn-secondary">
        <Printer size={18} />
        QR 출력
      </Link>
      <a href="#attendance-summary" className="btn-secondary">
        <ClipboardList size={18} />
        출석현황 보기
      </a>
      <button type="button" onClick={downloadReport} disabled={isDownloading} className="btn-primary">
        <Download size={18} />
        {isDownloading ? "생성 중..." : "최종 명단 다운로드"}
      </button>
      {message ? <p className="text-sm leading-6 text-slate-500 sm:col-span-3">{message}</p> : null}
    </div>
  );
}
