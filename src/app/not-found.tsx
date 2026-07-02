import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-semibold text-brand-600">세화 교직원 교육센터</p>
      <h1 className="mt-3 text-3xl font-semibold text-brand-900">해당 교육을 찾을 수 없습니다.</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        QR 주소가 올바른지 확인해주세요. 계속 문제가 있으면 교육 담당자에게 문의해주세요.
      </p>
      <Link href="/" className="btn-primary mt-7">
        홈으로
      </Link>
    </main>
  );
}
