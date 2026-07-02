"use client";

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
    >
      인쇄하기
    </button>
  );
}
