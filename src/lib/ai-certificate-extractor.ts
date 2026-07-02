import type { AiCertificateExtraction, AiCertificateExtractor } from "./types";

const extractionByFileId: Record<string, AiCertificateExtraction> = {
  "cert-001": {
    certificateNumber: "SAFE-2026-0142",
    trainingTitle: "학교 안전교육 기본 과정",
    staffName: "최민정",
    completedAt: "2026-06-25",
    trainingHours: "3시간",
    issuer: "한국교육안전연수원",
    rawText: "이수증 번호 SAFE-2026-0142. 성명 최민정. 학교 안전교육 기본 과정. 이수일자 2026-06-25. 총 3시간. 발급기관 한국교육안전연수원.",
    confidence: 0.94,
    aiReviewStatus: "extracted"
  },
  "cert-002": {
    certificateNumber: "SAFE-2026-0188",
    trainingTitle: "온라인 안전교육 심화",
    staffName: "정다은",
    completedAt: "2026-06-28",
    trainingHours: "2시간",
    issuer: "교육부 중앙교육연수원",
    rawText: "온라인 안전교육 심화. 성명 정다은. 이수일자 2026-06-28. 발급기관 교육부 중앙교육연수원. 일부 영역 흐림.",
    confidence: 0.72,
    aiReviewStatus: "needReview"
  },
  "cert-003": {
    trainingTitle: "안전교육",
    staffName: "한유진",
    rawText: "성명 한유진. 안전교육. 이수 시간 및 번호 영역 식별 불가.",
    confidence: 0.41,
    aiReviewStatus: "needReview"
  }
};

export const mockAiCertificateExtractor: AiCertificateExtractor = {
  async extract(file) {
    return (
      extractionByFileId[file.fileId] ?? {
        rawText: `${file.fileName}에서 읽은 mock OCR 텍스트입니다. 실제 연동 시 OpenAI Vision API 또는 Google Drive OCR 결과로 교체합니다.`,
        confidence: 0,
        aiReviewStatus: "pending"
      }
    );
  }
};
