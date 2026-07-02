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
  | "getTrainingMaterials"
  | "findStaff"
  | "lookupMyTrainingStatus"
  | "getMyTrainingHistory"
  | "submitQrAttendance"
  | "uploadCertificate"
  | "getMyUploads"
  | "getUploadStatus";

export type AppsScriptRequest =
  | { action: "getAppConfig" }
  | { action: "getTrainings"; year: string }
  | { action: "getTrainingDetail"; eventId: string }
  | { action: "getTrainingMaterials"; eventId?: string }
  | { action: "findStaff"; query: string }
  | { action: "lookupMyTrainingStatus"; staffName: string; department?: string; year: string }
  | { action: "getMyTrainingHistory"; query: string; year: string }
  | { action: "submitQrAttendance"; eventId: string; staffId: string }
  | { action: "uploadCertificate"; eventId: string; staffId: string; fileName: string; fileBase64: string }
  | { action: "getMyUploads"; query: string; year?: string }
  | { action: "getUploadStatus"; uploadId: string };

export interface SubmitAttendanceResult {
  ok: boolean;
  attendanceId?: string;
  message: string;
}

export interface UploadCertificateResult {
  ok: boolean;
  uploadId?: string;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  aiReviewStatus: "pending" | "extracted" | "needReview" | "failed";
  message: string;
}

export interface AppsScriptAdapter {
  request<T>(payload: AppsScriptRequest): Promise<T>;
  getAppConfig(): Promise<AppConfig>;
  getTrainings(year: number): Promise<TrainingEventRow[]>;
  getTrainingDetail(eventId: string): Promise<TrainingDetail | undefined>;
  getTrainingMaterials(eventId?: string): Promise<TrainingMaterialRow[]>;
  findStaff(query: string): Promise<StaffRow | undefined>;
  lookupMyTrainingStatus(input: { staffName: string; department?: string; year: number }): Promise<MyTrainingLookupResult>;
  getMyTrainingHistory(query: string, year: number): Promise<StaffCompletionLookup>;
  submitQrAttendance(eventId: string, staffId: string): Promise<SubmitAttendanceResult>;
  uploadCertificate(input: {
    eventId: string;
    staffId: string;
    fileName: string;
    fileBase64: string;
  }): Promise<UploadCertificateResult>;
  getMyUploads(query: string, year?: number): Promise<CertificateUploadRow[]>;
  getUploadStatus(uploadId: string): Promise<CertificateUploadRow | undefined>;
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
    getTrainingMaterials: (eventId) => post({ action: "getTrainingMaterials", eventId }),
    findStaff: (query) => post({ action: "findStaff", query }),
    lookupMyTrainingStatus: (input) =>
      post({ action: "lookupMyTrainingStatus", staffName: input.staffName, department: input.department, year: String(input.year) }),
    getMyTrainingHistory: (query, year) => post({ action: "getMyTrainingHistory", query, year: String(year) }),
    submitQrAttendance: (eventId, staffId) => post({ action: "submitQrAttendance", eventId, staffId }),
    uploadCertificate: (input) => post({ action: "uploadCertificate", ...input }),
    getMyUploads: (query, year) => post({ action: "getMyUploads", query, year: year ? String(year) : undefined }),
    getUploadStatus: (uploadId) => post({ action: "getUploadStatus", uploadId })
  };
}
