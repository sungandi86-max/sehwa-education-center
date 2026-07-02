"use client";

import { Printer } from "lucide-react";

export function PrintPageButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      <Printer size={17} />
      인쇄하기
    </button>
  );
}
