import type { AppConfig } from "@/lib/config";
import type {
  CertificateUploadRow,
  StaffCompletionLookup,
  StaffRow,
  TrainingDetail,
  TrainingEventRow,
  TrainingMaterialRow
} from "@/types/training";
import type { MyTrainingLookupResult } from "@/lib/my-training-lookup";

export type AppsScriptAction =
  | "getAppConfig"
  | "getTrainings"
  | "getTrainingDetail"
  | "getMaterials"
  | "getMaterialsByEvent"
  | "getTrainingMaterials"
  | "getGroupTrainings"
  | "findStaff"
  | "lookupMyTrainingStatus"
  | "getMyTrainingHistory"
  | "checkAttendanceEligibility"
  | "submitQrAttendance"
  | "uploadCertificate"
  | "getMyUploads"
  | "getUploadStatus";

export interface SubmitQrAttendanceInput {
  mode: "single" | "group";
  eventId?: string;
  eventIds?: string[];
  groupId?: string;
  staffId: string;
  staffName?: string;
  department?: string;
  position?: string;
  signature?: string;
  signatureDataUrl?: string;
}

export interface CheckAttendanceEligibilityInput {
  mode?: "single" | "group";
  eventId?: string;
  eventIds?: string[];
  groupId?: string;
  staffId: string;
}

export type AttendanceEligibilityStatus = "can_sign" | "already_attended" | "not_target" | "signature_excluded";

export interface AttendanceEligibilityItem {
  eventId: string;
  trainingTitle?: string;
  eligible: boolean;
  status: AttendanceEligibilityStatus;
  attendanceId?: string;
  message: string;
}

export interface AttendanceEligibilityResult {
  eligible: boolean;
  status: AttendanceEligibilityStatus;
  message: string;
  canSignCount: number;
  alreadyCount: number;
  notTargetCount: number;
  excludedCount: number;
  blockedCount: number;
  results: AttendanceEligibilityItem[];
}

export type AppsScriptRequest =
  | { action: "getAppConfig" }
  | { action: "getTrainings"; year: string }
  | { action: "getTrainingDetail"; eventId: string }
  | { action: "getMaterials"; eventId?: string }
  | { action: "getMaterialsByEvent"; eventId?: string }
  | { action: "getTrainingMaterials"; eventId?: string }
  | { action: "getGroupTrainings"; groupId: string }
  | { action: "findStaff"; name: string; department?: string }
  | { action: "lookupMyTrainingStatus"; staffId?: string; staffName: string; department?: string; year: string }
  | { action: "getMyTrainingHistory"; staffId: string; query?: string; year: string }
  | ({ action: "checkAttendanceEligibility" } & CheckAttendanceEligibilityInput)
  | ({ action: "submitQrAttendance" } & SubmitQrAttendanceInput)
  | ({ action: "uploadCertificate" } & UploadCertificateInput)
  | { action: "getMyUploads"; staffId: string; query?: string; year?: string }
  | { action: "getUploadStatus"; uploadId: string }
  | { action: "getAttendanceSummary"; eventId: string }
  | { action: "downloadAttendanceReport"; eventId: string };

export interface SubmitAttendanceResult {
  ok: boolean;
  attendanceId?: string;
  message: string;
  status?: "completed" | "already" | "notTarget" | "excluded" | "notFound";
  eventId?: string;
  attendedAt?: string;
  completedCount?: number;
  skippedCount?: number;
  blockedCount?: number;
  signatureId?: string;
  signatureFileId?: string;
  signatureImageUrl?: string;
}

export interface SubmitGroupAttendanceResult {
  ok: boolean;
  message: string;
  completedCount: number;
  skippedCount: number;
  blockedCount?: number;
  results: SubmitAttendanceResult[];
}

export interface UploadCertificateInput {
  eventId: string;
  staffId: string;
  staffName?: string;
  name?: string;
  department?: string;
  fileName: string;
  fileBase64?: string;
  fileId?: string;
  fileUrl?: string;
  fileLink?: string;
  certificateNumber?: string;
  trainingTitle?: string;
  completedAt?: string;
  trainingHours?: string;
  issuer?: string;
  rawText?: string;
  confidence?: number;
  aiReviewStatus?: "pending" | "extracted" | "needReview" | "failed";
  memo?: string;
}

export interface UploadCertificateResult {
  ok: boolean;
  uploadId?: string;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  aiReviewStatus: "pending" | "extracted" | "needReview" | "failed";
  message: string;
}

export type AttendanceReportStatus = "출석완료" | "미출석" | "서명제외" | "비대상" | "인정완료";

export interface AttendanceSummaryRow {
  no: number;
  eventId: string;
  staffId: string;
  staffName: string;
  department: string;
  targetStatus: string;
  attendanceStatus: AttendanceReportStatus;
  attendedAt?: string;
  exceptionReason?: string;
  signatureId?: string;
  signatureFileId?: string;
  signatureImageUrl?: string;
}

export interface AttendanceSummary {
  eventId: string;
  trainingTitle: string;
  targetCount: number;
  attendedCount: number;
  absentCount: number;
  excludedCount: number;
  recognizedCount: number;
  attendanceRate: number;
  rows: AttendanceSummaryRow[];
}

export interface AttendanceReportResult {
  fileId: string;
  fileUrl: string;
  fileName: string;
}

export interface AppsScriptAdapter {
  request<T>(payload: AppsScriptRequest): Promise<T>;
  getAppConfig(): Promise<AppConfig>;
  getTrainings(year: number): Promise<TrainingEventRow[]>;
  getTrainingDetail(eventId: string): Promise<TrainingDetail | undefined>;
  getTrainingMaterials(eventId?: string): Promise<TrainingMaterialRow[]>;
  getGroupTrainings(groupId: string): Promise<TrainingEventRow[]>;
  findStaff(query: string): Promise<StaffRow | undefined>;
  lookupMyTrainingStatus(input: { staffName: string; department?: string; year: number }): Promise<MyTrainingLookupResult>;
  getMyTrainingHistory(query: string, year: number): Promise<StaffCompletionLookup>;
  checkAttendanceEligibility(input: CheckAttendanceEligibilityInput): Promise<AttendanceEligibilityResult>;
  submitQrAttendance(input: SubmitQrAttendanceInput): Promise<SubmitAttendanceResult | SubmitGroupAttendanceResult>;
  uploadCertificate(input: UploadCertificateInput): Promise<UploadCertificateResult>;
  getMyUploads(query: string, year?: number): Promise<CertificateUploadRow[]>;
  getUploadStatus(uploadId: string): Promise<CertificateUploadRow | undefined>;
  getAttendanceSummary(eventId: string): Promise<AttendanceSummary>;
  downloadAttendanceReport(eventId: string): Promise<AttendanceReportResult>;
}

export function createAppsScriptHttpAdapter(apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_API_URL ?? ""): AppsScriptAdapter {
  const post = async <T>(payload: AppsScriptRequest): Promise<T> => {
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_APPS_SCRIPT_API_URL is not configured.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Apps Script API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  };

  return {
    request: post,
    getAppConfig: () => post({ action: "getAppConfig" }),
    getTrainings: (year) => post({ action: "getTrainings", year: String(year) }),
    getTrainingDetail: (eventId) => post({ action: "getTrainingDetail", eventId }),
    getTrainingMaterials: (eventId) => post({ action: "getMaterialsByEvent", eventId }),
    getGroupTrainings: (groupId) => post({ action: "getGroupTrainings", groupId }),
    findStaff: (query) => post({ action: "findStaff", name: query }),
    lookupMyTrainingStatus: (input) =>
      post({ action: "lookupMyTrainingStatus", staffName: input.staffName, department: input.department, year: String(input.year) }),
    getMyTrainingHistory: (query, year) => post({ action: "getMyTrainingHistory", staffId: query, query, year: String(year) }),
    checkAttendanceEligibility: (input) => post({ action: "checkAttendanceEligibility", ...input }),
    submitQrAttendance: (input) => post({ action: "submitQrAttendance", ...input }),
    uploadCertificate: (input) => post({ action: "uploadCertificate", ...input }),
    getMyUploads: (query, year) => post({ action: "getMyUploads", staffId: query, query, year: year ? String(year) : undefined }),
    getUploadStatus: (uploadId) => post({ action: "getUploadStatus", uploadId }),
    getAttendanceSummary: (eventId) => post({ action: "getAttendanceSummary", eventId }),
    downloadAttendanceReport: (eventId) => post({ action: "downloadAttendanceReport", eventId })
  };
}
