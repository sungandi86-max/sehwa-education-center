import { APP_CONFIG } from "@/lib/config";
import {
  certificateUploads,
  staff,
  trainingAttendances,
  trainingEvents,
  trainingMaterials,
  trainingTargets
} from "@/lib/mock-data";
import type {
  AppsScriptAdapter,
  AppsScriptRequest,
  SubmitAttendanceResult,
  UploadCertificateResult
} from "./appsScriptAdapter";
import type { CertificateUploadRow, CompletionHistoryViewRow } from "@/types/training";
import { lookupMyTrainingStatus } from "@/lib/my-training-lookup";

export const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul"
      }).format(new Date(value))
    : undefined;

const createCompletionHistory = (): CompletionHistoryViewRow[] => {
  return trainingTargets.map((target) => {
    const attendance = trainingAttendances.find(
      (row) => row.eventId === target.eventId && row.교직원ID === target.교직원ID
    );
    const approvedUpload = certificateUploads.find(
      (row) => row.eventId === target.eventId && row.교직원ID === target.교직원ID && row.상태 === "승인"
    );
    const completionSource = attendance?.참석방법 ?? (approvedUpload ? "이수증업로드" : undefined);
    const completedAt = attendance?.참석일시 ?? approvedUpload?.검토일시 ?? approvedUpload?.업로드일시;

    return {
      eventId: target.eventId,
      교직원ID: target.교직원ID,
      성명: target.성명,
      소속부서: target.소속부서,
      이수완료: Boolean(attendance || approvedUpload),
      이수일시: completedAt,
      이수경로: completionSource
    };
  });
};

const completionHistory = createCompletionHistory();

export const getTrainingTitle = (eventId: string) =>
  trainingEvents.find((event) => event.eventId === eventId)?.제목 ?? eventId;

export const mockAppsScriptAdapter: AppsScriptAdapter = {
  async request<T>(payload: AppsScriptRequest): Promise<T> {
    switch (payload.action) {
      case "getAppConfig":
        return this.getAppConfig() as Promise<T>;
      case "getTrainings":
        return this.getTrainings(Number(payload.year)) as Promise<T>;
      case "getTrainingDetail":
        return this.getTrainingDetail(payload.eventId) as Promise<T>;
      case "getTrainingMaterials":
        return this.getTrainingMaterials(payload.eventId) as Promise<T>;
      case "findStaff":
        return this.findStaff(payload.query) as Promise<T>;
      case "lookupMyTrainingStatus":
        return this.lookupMyTrainingStatus({
          staffName: payload.staffName,
          department: payload.department,
          year: Number(payload.year)
        }) as Promise<T>;
      case "getMyTrainingHistory":
        return this.getMyTrainingHistory(payload.query, Number(payload.year)) as Promise<T>;
      case "submitQrAttendance":
        return this.submitQrAttendance(payload.eventId, payload.staffId) as Promise<T>;
      case "uploadCertificate":
        return this.uploadCertificate(payload) as Promise<T>;
      case "getMyUploads":
        return this.getMyUploads(payload.query, payload.year ? Number(payload.year) : undefined) as Promise<T>;
      case "getUploadStatus":
        return this.getUploadStatus(payload.uploadId) as Promise<T>;
    }
  },

  async getAppConfig() {
    return APP_CONFIG;
  },

  async getTrainings(year) {
    return trainingEvents.filter((event) => event.연도 === year);
  },

  async getTrainingDetail(eventId) {
    const event = trainingEvents.find((item) => item.eventId === eventId);

    if (!event) {
      return undefined;
    }

    return {
      event,
      targets: trainingTargets.filter((item) => item.eventId === eventId),
      attendances: trainingAttendances.filter((item) => item.eventId === eventId),
      materials: trainingMaterials.filter((item) => item.eventId === eventId),
      uploads: certificateUploads.filter((item) => item.eventId === eventId),
      completions: completionHistory.filter((item) => item.eventId === eventId)
    };
  },

  async getTrainingMaterials(eventId) {
    return eventId ? trainingMaterials.filter((material) => material.eventId === eventId) : trainingMaterials;
  },

  async findStaff(query) {
    const normalized = query.trim().toLowerCase();

    return staff.find((member) => member.교직원ID.toLowerCase() === normalized || member.성명.toLowerCase() === normalized);
  },

  async lookupMyTrainingStatus(input) {
    return lookupMyTrainingStatus(input);
  },

  async getMyTrainingHistory(query, year) {
    const matchedStaff = await this.findStaff(query);

    if (!matchedStaff) {
      return {
        completions: [],
        uploads: []
      };
    }

    const eventIds = trainingEvents.filter((event) => event.연도 === year).map((event) => event.eventId);

    return {
      staff: matchedStaff,
      completions: completionHistory.filter(
        (row) => row.교직원ID === matchedStaff.교직원ID && eventIds.includes(row.eventId)
      ),
      uploads: certificateUploads.filter(
        (row) => row.교직원ID === matchedStaff.교직원ID && eventIds.includes(row.eventId)
      )
    };
  },

  async submitQrAttendance(eventId, staffId): Promise<SubmitAttendanceResult> {
    const event = trainingEvents.find((item) => item.eventId === eventId);
    const member = staff.find((item) => item.교직원ID === staffId);

    if (!event || !member) {
      return {
        ok: false,
        message: "교육 또는 교직원 정보를 확인할 수 없습니다."
      };
    }

    return {
      ok: true,
      attendanceId: `MOCK-ATT-${eventId}-${staffId}`,
      message: "QR 출석이 확인되었습니다. 담당자가 확인할 수 있도록 출석 기록에 반영됩니다."
    };
  },

  async uploadCertificate(input): Promise<UploadCertificateResult> {
    return {
      ok: true,
      uploadId: `MOCK-UP-${input.eventId}-${input.staffId}`,
      status: "submitted",
      aiReviewStatus: "pending",
      message: "이수증 제출이 접수되었습니다. AI 확인 후 담당자 검토 상태가 표시됩니다."
    };
  },

  async getMyUploads(query, year) {
    const history = await this.getMyTrainingHistory(query, year ?? APP_CONFIG.currentYear);

    return history.uploads;
  },

  async getUploadStatus(uploadId): Promise<CertificateUploadRow | undefined> {
    return certificateUploads.find((upload) => upload.uploadId === uploadId);
  }
};
