export type TrainingStatus = "draft" | "scheduled" | "active" | "completed" | "archived";
export type FolderMode = "eventOwnerFolder" | "departmentFolder" | "customFolder";
export type AttendanceMethod = "QR" | "관리자" | "이수증업로드";
export type UploadStatus = "제출완료" | "확인중" | "승인" | "반려";
export type AiReviewStatus = "pending" | "extracted" | "needReview" | "failed";
export type CompletionSource = AttendanceMethod;
export type MaterialType = "PDF" | "동영상" | "외부링크";

export interface SettingsRow {
  key: string;
  value: string;
  description?: string;
}

export interface DepartmentRow {
  departmentId: string;
  부서명: string;
  담당자ID?: string;
  담당자명?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
}

export interface StaffRow {
  교직원ID: string;
  성명: string;
  소속부서: string;
  직위?: string;
  이메일: string;
  재직상태: "재직" | "휴직" | "퇴직";
}

export interface TrainingEventRow {
  eventId: string;
  eventGroupId?: string;
  제목: string;
  연도: number;
  담당부서: string;
  담당자ID: string;
  담당자명: string;
  시작일시: string;
  종료일시: string;
  장소: string;
  상태: TrainingStatus;
  필수여부: boolean;
  설명?: string;
  signatureOpenAt?: string;
  signatureCloseAt?: string;
  attendanceSubtitle?: string;
  attendanceNotice?: string;
  folderMode: FolderMode;
  담당자드라이브폴더ID?: string;
  담당자드라이브폴더URL?: string;
  서명부파일ID?: string;
  서명부파일URL?: string;
}

export interface TrainingTargetRow {
  targetId: string;
  eventId: string;
  교직원ID: string;
  성명: string;
  소속부서: string;
  대상구분: "전체" | "부서" | "개별";
}

export interface TrainingAttendanceRow {
  attendanceId: string;
  eventId: string;
  eventGroupId?: string;
  교직원ID: string;
  성명: string;
  소속부서: string;
  직책?: string;
  참석일시: string;
  참석방법: AttendanceMethod;
  상태?: string;
  처리자?: string;
  uploadId?: string;
  signatureId?: string;
  signatureFileId?: string;
  signatureImageUrl?: string;
  비고?: string;
}

export interface TrainingMaterialRow {
  materialId: string;
  eventId: string;
  제목: string;
  자료유형: MaterialType;
  자료URL: string;
  공개여부: boolean;
}

export interface CourseBundleMappingRow {
  mappingId: string;
  groupId: string;
  bundleId: string;
  bundleName: string;
  eventId: string;
  sortOrder: number;
}

export interface CertificateUploadRow {
  uploadId: string;
  eventId: string;
  교직원ID: string;
  성명: string;
  소속부서: string;
  파일명: string;
  파일ID: string;
  파일URL: string;
  파일링크?: string;
  업로드일시: string;
  상태: UploadStatus;
  certificateNumber?: string;
  이수증번호?: string;
  trainingTitle?: string;
  연수명?: string;
  completedAt?: string;
  이수일자?: string;
  trainingHours?: string;
  issuer?: string;
  이수기관?: string;
  rawText?: string;
  confidence?: number;
  aiReviewStatus: AiReviewStatus;
  AI추출상태?: AiReviewStatus;
  반려사유?: string;
  검토자?: string;
  검토일시?: string;
  비고?: string;
}

export interface CertificateUpload {
  uploadId: string;
  eventId: string;
  staffId: string;
  staffName: string;
  department: string;
  fileName: string;
  fileId: string;
  fileUrl: string;
  uploadedAt: string;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  certificateNumber?: string;
  trainingTitle?: string;
  completedAt?: string;
  trainingHours?: string;
  issuer?: string;
  rawText?: string;
  confidence?: number;
  aiReviewStatus: AiReviewStatus;
  rejectReason?: string;
  reviewer?: string;
  reviewedAt?: string;
  memo?: string;
}

export interface AiCertificateExtraction {
  certificateNumber?: string;
  trainingTitle?: string;
  staffName?: string;
  completedAt?: string;
  trainingHours?: string;
  issuer?: string;
  rawText: string;
  confidence: number;
  aiReviewStatus: AiReviewStatus;
}

export interface AiCertificateExtractor {
  extract(file: {
    fileId: string;
    fileName: string;
    fileUrl: string;
  }): Promise<AiCertificateExtraction>;
}

export interface UploadReviewRow {
  reviewId: string;
  uploadId: string;
  eventId: string;
  검토자: string;
  검토결과: Extract<UploadStatus, "승인" | "반려">;
  검토일시: string;
  반려사유?: string;
  비고?: string;
}

export interface ReportRow {
  reportId: string;
  eventId: string;
  보고서명: string;
  생성상태: "대기" | "생성중" | "완료" | "오류";
  파일ID?: string;
  파일URL?: string;
  생성일시?: string;
}

export interface CompletionHistoryViewRow {
  eventId: string;
  교직원ID: string;
  성명: string;
  소속부서: string;
  이수완료: boolean;
  이수일시?: string;
  이수경로?: CompletionSource;
}

export interface DashboardSummary {
  totalEvents: number;
  activeEvents: number;
  todayEvents: TrainingEventRow[];
  targetCount: number;
  attendedCount: number;
  incompleteCount: number;
  pendingUploads: number;
  attendanceRate: number;
}

export interface TrainingDetail {
  event: TrainingEventRow;
  targets: TrainingTargetRow[];
  attendances: TrainingAttendanceRow[];
  materials: TrainingMaterialRow[];
  uploads: CertificateUploadRow[];
  completions: CompletionHistoryViewRow[];
}

export interface StaffCompletionLookup {
  staff?: StaffRow;
  completions: CompletionHistoryViewRow[];
  uploads: CertificateUploadRow[];
}

export interface SheetsSchema {
  Core: {
    설정: SettingsRow[];
    목록: Record<string, string>[];
    부서관리: DepartmentRow[];
    교직원명단: StaffRow[];
  };
  Workspace: {
    교육목록: TrainingEventRow[];
    교육대상: TrainingTargetRow[];
    교육참석: TrainingAttendanceRow[];
    교육자료: TrainingMaterialRow[];
    묶음과정매핑: CourseBundleMappingRow[];
    교육이력_VIEW: CompletionHistoryViewRow[];
    이수증업로드: CertificateUploadRow[];
    업로드검토: UploadReviewRow[];
    보고서: ReportRow[];
    대시보드: DashboardSummary[];
  };
}
