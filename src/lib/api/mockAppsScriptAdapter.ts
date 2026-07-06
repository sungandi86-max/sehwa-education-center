import { APP_CONFIG } from "@/lib/config";
import {
  certificateUploads,
  courseBundleMappings,
  staff,
  trainingAttendances,
  trainingEvents,
  trainingMaterials,
  trainingTargets
} from "@/lib/mock-data";
import { lookupMyTrainingStatus } from "@/lib/my-training-lookup";
import type {
  AppsScriptAdapter,
  AppsScriptRequest,
  AttendanceEligibilityResult,
  CheckAttendanceEligibilityInput,
  AttendanceReportResult,
  AttendanceSummary,
  SubmitAttendanceResult,
  SubmitGroupAttendanceResult,
  UploadCertificateResult
} from "./appsScriptAdapter";
import type { CertificateUploadRow, CompletionHistoryViewRow, TrainingAttendanceRow } from "@/types/training";

export const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul"
      }).format(new Date(value))
    : undefined;

const mockAttendances: TrainingAttendanceRow[] = [...trainingAttendances];

const getRecordString = (record: unknown, keys: string[], fallback = "") => {
  const row = record as Record<string, unknown> | undefined;

  if (!row) {
    return fallback;
  }

  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }

  return fallback;
};

const getStaffId = (record: unknown) => getRecordString(record, ["교직원ID", "staffId", "직원번호"]);
const getStaffName = (record: unknown) => getRecordString(record, ["성명", "staffName", "name"]);
const getDepartment = (record: unknown) => getRecordString(record, ["소속부서", "department", "부서"]);
const getTrainingTitle = (eventId: string) => {
  const event = trainingEvents.find((item) => item.eventId === eventId);

  return getRecordString(event, ["제목", "교육명", "title"], eventId);
};

const createCompletionHistory = (): CompletionHistoryViewRow[] =>
  trainingTargets.map((target) => {
    const attendance = mockAttendances.find((row) => row.eventId === target.eventId && getStaffId(row) === getStaffId(target));
    const approvedUpload = certificateUploads.find(
      (row) => row.eventId === target.eventId && getStaffId(row) === getStaffId(target) && getRecordString(row, ["상태", "status"]) === "승인"
    );

    return {
      ...(target as unknown as Record<string, unknown>),
      "이수완료": Boolean(attendance || approvedUpload),
      "이수일시": getRecordString(attendance, ["참석일시", "attendedAt"]) || getRecordString(approvedUpload, ["검토일시", "업로드일시"]),
      "이수경로": getRecordString(attendance, ["참석방법"], approvedUpload ? "이수증업로드" : "")
    } as unknown as CompletionHistoryViewRow;
  });

export const mockAppsScriptAdapter: AppsScriptAdapter = {
  async request<T>(payload: AppsScriptRequest): Promise<T> {
    switch (payload.action) {
      case "getAppConfig":
        return this.getAppConfig() as Promise<T>;
      case "getAdminLoginConfig":
        return this.getAdminLoginConfig() as Promise<T>;
      case "verifyAdminAccessCode":
        return this.verifyAdminAccessCode(payload.code) as Promise<T>;
      case "getTrainings":
        return this.getTrainings(Number(payload.year)) as Promise<T>;
      case "getTrainingDetail":
        return this.getTrainingDetail(payload.eventId) as Promise<T>;
      case "getMaterials":
      case "getMaterialsByEvent":
      case "getTrainingMaterials":
        return this.getTrainingMaterials(payload.eventId) as Promise<T>;
      case "getGroupTrainings":
        return this.getGroupTrainings(payload.groupId) as Promise<T>;
      case "findStaff":
        return this.findStaff(payload.name) as Promise<T>;
      case "lookupMyTrainingStatus":
        return this.lookupMyTrainingStatus({
          staffName: payload.staffName,
          department: payload.department,
          year: Number(payload.year)
        }) as Promise<T>;
      case "getMyTrainingHistory":
        return this.getMyTrainingHistory(payload.staffId || payload.query || "", Number(payload.year)) as Promise<T>;
      case "checkAttendanceEligibility":
        return this.checkAttendanceEligibility(payload) as Promise<T>;
      case "submitQrAttendance":
        return this.submitQrAttendance(payload) as Promise<T>;
      case "uploadCertificate":
        return this.uploadCertificate(payload) as Promise<T>;
      case "getMyUploads":
        return this.getMyUploads(payload.staffId || payload.query || "", payload.year ? Number(payload.year) : undefined) as Promise<T>;
      case "getUploadStatus":
        return this.getUploadStatus(payload.uploadId) as Promise<T>;
      case "getAttendanceSummary":
        return this.getAttendanceSummary(payload.eventId) as Promise<T>;
      case "downloadAttendanceReport":
        return this.downloadAttendanceReport(payload.eventId) as Promise<T>;
      default:
        throw new Error(`Unsupported mock Apps Script action: ${(payload as { action?: string }).action ?? "unknown"}`);
    }
  },

  async getAppConfig() {
    return APP_CONFIG;
  },

  async getAdminLoginConfig() {
    return {
      adminCodeHint: process.env.ADMIN_CODE_HINT ?? "관리자 기능은 학교 담당자만 사용할 수 있습니다."
    };
  },

  async verifyAdminAccessCode(code) {
    const expectedCode = process.env.ADMIN_ACCESS_CODE?.trim();
    const inputCode = code.trim();

    return {
      ok: Boolean(expectedCode && inputCode && inputCode === expectedCode),
      adminCodeHint: process.env.ADMIN_CODE_HINT ?? "관리자 기능은 학교 담당자만 사용할 수 있습니다."
    };
  },

  async getTrainings(year) {
    return trainingEvents.filter((event) => Number(getRecordString(event, ["연도", "교육연도"], String(APP_CONFIG.currentYear))) === year);
  },

  async getTrainingDetail(eventId) {
    const event = trainingEvents.find((item) => item.eventId === eventId);

    if (!event) {
      return undefined;
    }

    return {
      event,
      targets: trainingTargets.filter((item) => item.eventId === eventId),
      attendances: mockAttendances.filter((item) => item.eventId === eventId),
      materials: trainingMaterials.filter((item) => item.eventId === eventId),
      uploads: certificateUploads.filter((item) => item.eventId === eventId),
      completions: createCompletionHistory().filter((item) => item.eventId === eventId)
    };
  },

  async getTrainingMaterials(eventId) {
    return eventId ? trainingMaterials.filter((material) => material.eventId === eventId) : trainingMaterials;
  },

  async getGroupTrainings(groupId) {
    const mappings = courseBundleMappings
      .filter((mapping) => mapping.groupId === groupId || mapping.bundleId === groupId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return mappings
      .map((mapping) => trainingEvents.find((event) => event.eventId === mapping.eventId))
      .filter((event): event is NonNullable<typeof event> => Boolean(event));
  },

  async findStaff(query) {
    const normalized = query.trim().toLowerCase();

    return staff.find((member) => getStaffId(member).toLowerCase() === normalized || getStaffName(member).toLowerCase() === normalized);
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

    const eventIds = trainingEvents
      .filter((event) => Number(getRecordString(event, ["연도", "교육연도"], String(APP_CONFIG.currentYear))) === year)
      .map((event) => event.eventId);
    const staffId = getStaffId(matchedStaff);

    return {
      staff: matchedStaff,
      completions: createCompletionHistory().filter((row) => getStaffId(row) === staffId && eventIds.includes(row.eventId)),
      uploads: certificateUploads.filter((row) => getStaffId(row) === staffId && eventIds.includes(row.eventId))
    };
  },

  async checkAttendanceEligibility(input: CheckAttendanceEligibilityInput): Promise<AttendanceEligibilityResult> {
    const eventIds = input.mode === "group" ? input.eventIds ?? [] : input.eventId ? [input.eventId] : [];
    const results = eventIds.map((eventId) => {
      const duplicated = mockAttendances.find((row) => row.eventId === eventId && getStaffId(row) === input.staffId);

      if (duplicated) {
        return {
          eventId,
          trainingTitle: getTrainingTitle(eventId),
          eligible: false,
          status: "already_attended" as const,
          attendanceId: duplicated.attendanceId,
          message: "이미 출석 처리되었습니다."
        };
      }

      return {
        eventId,
        trainingTitle: getTrainingTitle(eventId),
        eligible: true,
        status: "can_sign" as const,
        message: "전자서명이 필요합니다."
      };
    });
    const canSignCount = results.filter((result) => result.status === "can_sign").length;
    const alreadyCount = results.filter((result) => result.status === "already_attended").length;

    return {
      eligible: canSignCount > 0,
      status: canSignCount > 0 ? "can_sign" : "already_attended",
      message: canSignCount > 0 ? "전자서명이 필요합니다." : "이미 출석 처리되었습니다.",
      canSignCount,
      alreadyCount,
      notTargetCount: 0,
      excludedCount: 0,
      blockedCount: 0,
      results
    };
  },

  async submitQrAttendance(input): Promise<SubmitAttendanceResult | SubmitGroupAttendanceResult> {
    const eventIds = input.mode === "group" ? input.eventIds ?? [] : input.eventId ? [input.eventId] : [];
    const signatureId = `MOCK-SIG-${input.staffId}-${Date.now()}`;
    const results: SubmitAttendanceResult[] = eventIds.map((eventId) => submitSingleAttendance(eventId, input.staffId, signatureId));

    if (input.mode === "group") {
      const completedCount = results.filter((result) => result.ok && result.status === "completed").length;
      const skippedCount = results.filter((result) => result.ok && result.status === "already").length;

      return {
        ok: results.every((result) => result.ok),
        completedCount,
        skippedCount,
        results,
        message: `출석 완료 ${completedCount}건, 이미 처리됨 ${skippedCount}건`
      };
    }

    return results[0] ?? {
      ok: false,
      message: "교육 정보가 필요합니다."
    };
  },

  async uploadCertificate(input): Promise<UploadCertificateResult> {
    return {
      ok: true,
      uploadId: `MOCK-UP-${input.eventId}-${input.staffId}`,
      status: "submitted",
      aiReviewStatus: "pending",
      message: "이수증 제출이 접수되었습니다."
    };
  },

  async getMyUploads(query, year) {
    const history = await this.getMyTrainingHistory(query, year ?? APP_CONFIG.currentYear);

    return history.uploads;
  },

  async getUploadStatus(uploadId): Promise<CertificateUploadRow | undefined> {
    return certificateUploads.find((upload) => upload.uploadId === uploadId);
  },

  async getAttendanceSummary(eventId): Promise<AttendanceSummary> {
    const event = trainingEvents.find((item) => item.eventId === eventId);
    const targets = trainingTargets.filter((item) => item.eventId === eventId);
    const rows = targets.map((target, index) => {
      const staffId = getStaffId(target);
      const attendance = mockAttendances.find((item) => item.eventId === eventId && getStaffId(item) === staffId);

      return {
        no: index + 1,
        eventId,
        staffId,
        staffName: getStaffName(target),
        department: getDepartment(target),
        position: getRecordString(target, ["직책", "직위", "position"]),
        targetStatus: "대상",
        attendanceStatus: attendance ? ("출석완료" as const) : ("미출석" as const),
        attendedAt: getRecordString(attendance, ["참석일시", "attendedAt"]),
        exceptionReason: "",
        signatureId: attendance?.signatureId,
        signatureFileId: attendance?.signatureFileId,
        signatureImageUrl: attendance?.signatureImageUrl
      };
    });
    const attendedCount = rows.filter((row) => row.attendanceStatus === "출석완료").length;

    return {
      eventId,
      trainingTitle: event ? getTrainingTitle(eventId) : eventId,
      targetCount: rows.length,
      attendedCount,
      absentCount: rows.length - attendedCount,
      excludedCount: 0,
      recognizedCount: 0,
      attendanceRate: rows.length > 0 ? Math.round((attendedCount / rows.length) * 1000) / 10 : 0,
      rows
    };
  },

  async downloadAttendanceReport(eventId): Promise<AttendanceReportResult> {
    return {
      fileId: `MOCK-REPORT-${eventId}`,
      fileName: `${getTrainingTitle(eventId)}_최종명단.xlsx`,
      fileUrl: "#"
    };
  }
};

function submitSingleAttendance(eventId: string, staffId: string, signatureId: string): SubmitAttendanceResult {
  const event = trainingEvents.find((item) => item.eventId === eventId);
  const member = staff.find((item) => getStaffId(item) === staffId);

  if (!event || !member) {
    return {
      ok: false,
      eventId,
      message: "교육 또는 교직원 정보를 확인할 수 없습니다."
    };
  }

  const duplicated = mockAttendances.find((row) => row.eventId === eventId && getStaffId(row) === staffId);

  if (duplicated) {
    return {
      ok: true,
      eventId,
      attendanceId: duplicated.attendanceId,
      status: "already",
      message: "이미 출석 처리된 교육입니다.",
      signatureId: duplicated.signatureId,
      signatureFileId: duplicated.signatureFileId,
      signatureImageUrl: duplicated.signatureImageUrl
    };
  }

  const attendanceId = `MOCK-ATT-${eventId}-${staffId}-${Date.now()}`;
  mockAttendances.push({
    ...(member as unknown as Record<string, unknown>),
    attendanceId,
    eventId,
    "참석일시": new Date().toISOString(),
    "참석방법": "QR",
    "상태": "출석완료",
    signatureId,
    signatureFileId: "MOCK-SIGNATURE-FILE",
    signatureImageUrl: "#"
  } as unknown as TrainingAttendanceRow);

  return {
    ok: true,
    eventId,
    attendanceId,
    status: "completed",
    message: "출석 처리가 완료되었습니다.",
    signatureId,
    signatureFileId: "MOCK-SIGNATURE-FILE",
    signatureImageUrl: "#"
  };
}
