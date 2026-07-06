"use client";

import { Camera, LoaderCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ScanState = "idle" | "starting" | "scanning" | "error";

interface BarcodeDetectorResult {
  rawValue?: string;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): {
    detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
  };
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function QrScanLauncher() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState("idle");
  };

  const startScanner = async () => {
    setMessage("");
    setState("starting");

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setMessage("카메라를 사용할 수 없는 환경입니다. 휴대폰 카메라 앱으로 QR을 스캔하거나 아래 교육을 선택해주세요.");
      return;
    }

    if (!window.BarcodeDetector) {
      setState("error");
      setMessage("이 브라우저는 실시간 QR 인식을 지원하지 않습니다. 휴대폰 기본 카메라 앱으로 QR을 스캔하거나 아래 교육을 선택해주세요.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Video element is not ready.");
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setState("scanning");

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const scan = async () => {
        const currentVideo = videoRef.current;
        if (!currentVideo || !streamRef.current) {
          return;
        }

        try {
          const results = await detector.detect(currentVideo);
          const rawValue = results[0]?.rawValue?.trim();

          if (rawValue) {
            stopScanner();
            router.push(resolveQrTarget(rawValue));
            return;
          }
        } catch {
          setState("error");
          setMessage("QR 코드를 읽지 못했습니다. 화면을 밝게 하고 QR 코드에 카메라를 가까이 가져가 주세요.");
          return;
        }

        frameRef.current = requestAnimationFrame(scan);
      };

      frameRef.current = requestAnimationFrame(scan);
    } catch {
      setState("error");
      setMessage("카메라 권한을 확인해주세요. 권한을 허용한 뒤 다시 시도할 수 있습니다.");
    }
  };

  const isStarting = state === "starting";
  const isScanning = state === "scanning";

  return (
    <div className="rounded-[28px] border border-slateblue-100 bg-white p-6 shadow-[0_24px_70px_rgba(23,59,115,0.07)]">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-[22px] bg-[#EEF1FF] text-brand-900">
          <Camera size={27} />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-brand-900">QR 스캔을 시작하세요</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">연수장에 비치된 QR 코드를 휴대폰 카메라로 스캔하여 출석을 진행하세요.</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] bg-slate-950">
        <video ref={videoRef} muted playsInline className={isScanning ? "aspect-video w-full object-cover" : "hidden"} />
      </div>

      {message ? <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">{message}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {isScanning ? (
          <button type="button" onClick={stopScanner} className="btn-secondary sm:col-span-2">
            <X size={18} />
            스캔 중지
          </button>
        ) : (
          <button type="button" onClick={() => void startScanner()} disabled={isStarting} className="btn-primary sm:col-span-2">
            {isStarting ? <LoaderCircle className="animate-spin" size={18} /> : <Camera size={18} />}
            {isStarting ? "카메라를 준비하고 있습니다..." : "QR 스캔 시작"}
          </button>
        )}
      </div>
    </div>
  );
}

function resolveQrTarget(rawValue: string) {
  try {
    const url = new URL(rawValue);
    if (url.pathname.startsWith("/qr/")) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    // QR contents may be an event id instead of a full URL.
  }

  if (rawValue.startsWith("/qr/")) return rawValue;
  if (rawValue.startsWith("GRP-")) return `/qr/group/${encodeURIComponent(rawValue)}`;
  return `/qr/${encodeURIComponent(rawValue)}`;
}
