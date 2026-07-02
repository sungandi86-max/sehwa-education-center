import { APP_CONFIG } from "@/lib/config";
import { trainingEvents } from "@/lib/mock-data";
import { mockAppsScriptAdapter, formatDateTime } from "@/lib/api/mockAppsScriptAdapter";
import type { CertificateUploadRow, CompletionHistoryViewRow, StaffCompletionLookup, StaffRow, TrainingEventRow, TrainingMaterialRow } from "@/types/training";
import type {
  SubmitGroupAttendanceResult,
  SubmitAttendanceResult,
  SubmitQrAttendanceInput,
  UploadCertificateInput,
  UploadCertificateResult
} from "@/lib/api/appsScriptAdapter";
import type { MyTrainingLookupItem, MyTrainingLookupResult } from "@/lib/my-training-lookup";

const APPS_SCRIPT_API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_API_URL?.trim();

export interface NoticeRow {
  noticeId: string;
  제목: string;
  내용: string;
  공지구분?: string;
  링크?: string;
  사용여부?: string;
  홈노출?: string;
  공지일?: string;
  노출시작일?: string;
  작성부서?: string;
  작성자?: string;
}

interface AppsScriptResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

type RawRecord = Record<string, unknown>;

const mockNotices: NoticeRow[] = [
  {
    noticeId: "MOCK-NT-001",
    공지구분: "안내",
    제목: "세화 교직원 교육센터 시범 운영 안내",
    내용: "QR 출석, 내 이수 확인, 이수증 업로드 기능을 시범 운영합니다.",
    사용여부: "사용",
    홈노출: "사용",
    공지일: "2026-07-01",
    작성부서: "교육센터"
  }
];

const APPS_SCRIPT_RETRY_DELAYS = [350, 900];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postAppsScript = async <T>(payload: RawRecord): Promise<T> => {
  if (!APPS_SCRIPT_API_URL) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_API_URL is not configured.");
  }

  const response = await fetchAppsScriptWithRetry(payload);

  if (!response.ok) {
    throw new Error(`Apps Script request failed: ${response.status}`);
  }

  const result = (await response.json()) as AppsScriptResponse<T>;

  if (!result.success) {
    throw new Error(result.error ?? result.message ?? "Apps Script request failed.");
  }

  return result.data as T;
};

const postAppsScriptEnvelope = async <T>(payload: RawRecord): Promise<AppsScriptResponse<T>> => {
  if (!APPS_SCRIPT_API_URL) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_API_URL is not configured.");
  }

  const response = await fetchAppsScriptWithRetry(payload);

  if (!response.ok) {
    throw new Error(`Apps Script request failed: ${response.status}`);
  }

  return response.json() as Promise<AppsScriptResponse<T>>;
};

async function fetchAppsScriptWithRetry(payload: RawRecord) {
  let lastResponse: Response | undefined;
  const apiUrl = APPS_SCRIPT_API_URL as string;

  for (let attempt = 0; attempt <= APPS_SCRIPT_RETRY_DELAYS.length; attempt += 1) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (response.ok || (response.status < 500 && response.status !== 404)) {
      return response;
    }

    lastResponse = response;
    const delay = APPS_SCRIPT_RETRY_DELAYS[attempt];

    if (delay) {
      await wait(delay);
    }
  }

  return lastResponse as Response;
}

const asString = (value: unknown, fallback = "") => (value == null ? fallback : String(value));

const toDateTime = (date?: unknown, time?: unknown) => {
  const dateValue = asString(date);
  const timeValue = asString(time, "00:00");

  if (!dateValue) {
    return new Date().toISOString();
  }

  return `${dateValue}T${timeValue}:00+09:00`;
};

const normalizeTrainingStatus = (value: unknown): TrainingEventRow["상태"] => {
  const status = asString(value);

  if (status === "진행중" || status === "active") {
    return "active";
  }

  if (status === "예정" || status === "scheduled") {
    return "scheduled";
  }

  if (status === "완료" || status === "completed") {
    return "completed";
  }

  if (status === "보관" || status === "archived") {
    return "archived";
  }

  return "draft";
};

const normalizeMaterialType = (value: unknown): TrainingMaterialRow["자료유형"] => {
  const type = asString(value, "외부링크");

  if (type === "PDF") {
    return "PDF";
  }

  if (type === "동영상") {
    return "동영상";
  }

  return "외부링크";
};

const normalizeTraining = (row: RawRecord): TrainingEventRow => ({
  eventId: asString(row.eventId),
  eventGroupId: asString(row.eventGroupId ?? row.groupId ?? row.bundleId) || undefined,
  제목: asString(row.교육명 ?? row.제목, "교육명 미입력"),
  연도: Number(row.교육연도 ?? row.연도 ?? APP_CONFIG.currentYear),
  담당부서: asString(row.담당부서, "담당부서 미입력"),
  담당자ID: asString(row.담당자ID ?? row.담당자),
  담당자명: asString(row.담당자),
  시작일시: toDateTime(row.일자 ?? row.시작일시, row.시작시간),
  종료일시: toDateTime(row.일자 ?? row.종료일시, row.종료시간),
  장소: asString(row.장소, "장소 미정"),
  상태: normalizeTrainingStatus(row.상태),
  필수여부: asString(row.필수여부, "TRUE") !== "FALSE",
  설명: asString(row.교육내용 ?? row.설명),
  folderMode: asString(row.folderMode, "eventOwnerFolder") as TrainingEventRow["folderMode"],
  담당자드라이브폴더ID: asString(row.담당자드라이브폴더ID),
  담당자드라이브폴더URL: asString(row.담당자드라이브폴더URL),
  서명부파일ID: asString(row.서명부파일ID),
  서명부파일URL: asString(row.서명부파일URL)
});

const normalizeMaterial = (row: RawRecord): TrainingMaterialRow => ({
  materialId: asString(row.materialId),
  eventId: asString(row.eventId),
  제목: asString(row.자료명 ?? row.제목, "자료명 미입력"),
  자료유형: normalizeMaterialType(row.자료유형),
  자료URL: asString(row.링크 ?? row.자료URL, "#"),
  공개여부: asString(row.사용여부, "사용") !== "미사용"
});

const normalizeStaff = (row: RawRecord): StaffRow => ({
  교직원ID: asString(row.교직원ID),
  성명: asString(row.성명),
  소속부서: asString(row.소속부서),
  직위: asString(row.직책),
  이메일: asString(row.이메일),
  재직상태: "재직"
});

export const getTrainingTitle = (eventId: string, trainings: TrainingEventRow[] = trainingEvents) =>
  trainings.find((event) => event.eventId === eventId)?.제목 ?? eventId;

export const appsScriptClient = {
  isLiveConfigured: Boolean(APPS_SCRIPT_API_URL),

  async getNotices(): Promise<NoticeRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      return mockNotices;
    }

    const rows = await postAppsScript<RawRecord[]>({ action: "getNotices" });

    return rows.map((row) => ({
      noticeId: asString(row.noticeId),
      공지구분: asString(row.공지구분),
      제목: asString(row.제목, "공지사항"),
      내용: asString(row.내용),
      링크: asString(row.링크),
      사용여부: asString(row.사용여부, "사용"),
      홈노출: asString(row.홈노출, "사용"),
      공지일: asString(row.공지일 ?? row.노출시작일),
      노출시작일: asString(row.노출시작일),
      작성부서: asString(row.작성부서),
      작성자: asString(row.작성자)
    }));
  },

  async getTrainings(): Promise<TrainingEventRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.getTrainings(APP_CONFIG.currentYear);
    }

    const rows = await postAppsScript<RawRecord[]>({ action: "getTrainings" });

    return rows.map(normalizeTraining);
  },

  async getMaterials(): Promise<TrainingMaterialRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.getTrainingMaterials();
    }

    const rows = await postAppsScript<RawRecord[]>({ action: "getMaterials" });

    return rows.map(normalizeMaterial);
  },

  async getGroupTrainings(groupId: string): Promise<TrainingEventRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.getGroupTrainings(groupId);
    }

    try {
      const rows = await postAppsScript<RawRecord[]>({ action: "getGroupTrainings", groupId });

      return rows.map(normalizeTraining);
    } catch {
      const rows = await postAppsScript<RawRecord[]>({ action: "getTrainings" });
      const groupedEvents = rows
        .map(normalizeTraining)
        .filter((event) => event.eventGroupId === groupId);

      return groupedEvents.length > 0 ? groupedEvents : mockAppsScriptAdapter.getGroupTrainings(groupId);
    }
  },

  async findStaff({ name, department }: { name: string; department?: string }): Promise<StaffRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      const member = await mockAppsScriptAdapter.findStaff(name);
      if (member) {
        return [member];
      }

      if (name.trim() === "박숙현") {
        return [
          {
            교직원ID: "T001",
            성명: "박숙현",
            소속부서: department || "보건실",
            직위: "보건교사",
            이메일: "",
            재직상태: "재직"
          }
        ];
      }

      return [];
    }

    const rows = await postAppsScript<RawRecord[]>({
      action: "findStaff",
      name,
      department
    });

    return rows.map(normalizeStaff);
  },

  async lookupMyTrainingStatus(input: { staffId?: string; staffName: string; department?: string; year: number }): Promise<MyTrainingLookupResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.lookupMyTrainingStatus(input);
    }

    try {
      return await postAppsScript<MyTrainingLookupResult>({
        action: "lookupMyTrainingStatus",
        staffId: input.staffId,
        staffName: input.staffName,
        department: input.department,
        year: String(input.year)
      });
    } catch {
      return composeLiveMyTrainingStatus(input);
    }
  },

  getTrainingDetail: mockAppsScriptAdapter.getTrainingDetail.bind(mockAppsScriptAdapter),
  async getMyTrainingHistory(query: string, year: number): Promise<StaffCompletionLookup> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.getMyTrainingHistory(query, year);
    }

    const data = await postAppsScript<CompletionHistoryViewRow[] | StaffCompletionLookup>({
      action: "getMyTrainingHistory",
      staffId: query,
      query,
      year: String(year)
    });

    if (Array.isArray(data)) {
      return {
        completions: data,
        uploads: []
      };
    }

    return data;
  },
  async submitQrAttendance(input: SubmitQrAttendanceInput): Promise<SubmitAttendanceResult | SubmitGroupAttendanceResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.submitQrAttendance(input);
    }

    if (input.mode === "single" && !input.eventId) {
      return {
        ok: false,
        message: "교육 정보가 필요합니다."
      };
    }

    if (input.mode === "group") {
      return submitGroupQrAttendanceToAppsScript(input);
    }

    return submitSingleQrAttendance(input as SubmitQrAttendanceInput & { eventId: string });
  },
  async submitGroupQrAttendance(input: {
    groupId: string;
    eventIds: string[];
    staffId: string;
    staffName?: string;
    department?: string;
    position?: string;
    signature?: string;
  }): Promise<SubmitGroupAttendanceResult> {
    return appsScriptClient.submitQrAttendance({
      mode: "group",
      groupId: input.groupId,
      eventIds: input.eventIds,
      staffId: input.staffId,
      staffName: input.staffName,
      department: input.department,
      position: input.position,
      signature: input.signature
    }) as Promise<SubmitGroupAttendanceResult>;
  },
  async uploadCertificate(input: UploadCertificateInput): Promise<UploadCertificateResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.uploadCertificate(input);
    }

    const result = await postAppsScriptEnvelope<RawRecord>({
      action: "uploadCertificate",
      eventId: input.eventId,
      staffId: input.staffId,
      name: input.name ?? input.staffName,
      staffName: input.staffName ?? input.name,
      department: input.department,
      fileName: input.fileName,
      fileBase64: input.fileBase64,
      fileId: input.fileId,
      fileUrl: input.fileUrl,
      certificateNumber: input.certificateNumber,
      trainingTitle: input.trainingTitle,
      completedAt: input.completedAt,
      trainingHours: input.trainingHours,
      issuer: input.issuer,
      rawText: input.rawText,
      confidence: input.confidence,
      aiReviewStatus: input.aiReviewStatus,
      memo: input.memo
    });
    const data = result.data ?? {};

    if (!result.success) {
      return {
        ok: false,
        status: "submitted",
        aiReviewStatus: input.aiReviewStatus ?? "pending",
        message: result.message ?? result.error ?? "이수증 제출에 실패했습니다."
      };
    }

    return {
      ok: true,
      uploadId: getRecordString(data, ["uploadId", "업로드ID"]),
      status: "submitted",
      aiReviewStatus: (getRecordString(data, ["aiReviewStatus"], input.aiReviewStatus ?? "pending") as UploadCertificateResult["aiReviewStatus"]),
      message: result.message ?? "이수증 제출이 완료되었습니다."
    };
  },
  async getMyUploads(query: string, year?: number): Promise<CertificateUploadRow[]> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.getMyUploads(query, year);
    }

    return postAppsScript<CertificateUploadRow[]>({
      action: "getMyUploads",
      staffId: query,
      query,
      year: year ? String(year) : undefined
    });
  },
  getUploadStatus: mockAppsScriptAdapter.getUploadStatus.bind(mockAppsScriptAdapter)
};

export { formatDateTime };

async function composeLiveMyTrainingStatus(input: {
  staffId?: string;
  staffName: string;
  department?: string;
  year: number;
}): Promise<MyTrainingLookupResult> {
  let staffId = input.staffId?.trim() ?? "";
  let staffName = input.staffName;
  let department = input.department ?? "";

  if (!staffId) {
    const staffRows = await appsScriptClient.findStaff({
      name: input.staffName,
      department: input.department
    });
    const selectedStaff = staffRows[0] as unknown as RawRecord | undefined;

    staffId = getRecordString(selectedStaff, ["교직원ID", "staffId"]);
    staffName = getRecordString(selectedStaff, ["성명", "staffName"], input.staffName);
    department = getRecordString(selectedStaff, ["소속부서", "department"], input.department ?? "");
  }

  if (!staffId) {
    return {
      staff: {
        staffId: "",
        staffName,
        department
      },
      summary: {
        completedCount: 0,
        incompleteCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      },
      items: []
    };
  }

  const [events, history, uploads] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getMyTrainingHistory(staffId, input.year).catch(() => ({ completions: [], uploads: [] })),
    appsScriptClient.getMyUploads(staffId, input.year).catch(() => [])
  ]);

  const completionRows = Array.isArray(history.completions) ? history.completions : [];
  const uploadRows = [...(Array.isArray(history.uploads) ? history.uploads : []), ...uploads];
  const uniqueUploads = Array.from(
    new Map(
      uploadRows.map((upload) => {
        const uploadRecord = upload as unknown as RawRecord;

        return [getRecordString(uploadRecord, ["uploadId", "업로드ID"]) || `${getEventId(upload)}-${getUploadDate(upload)}`, upload];
      })
    ).values()
  );
  const targetEvents = events.filter((event) => event.연도 === input.year);

  const items = targetEvents.map((event) => {
    const completion = completionRows.find((row) => getEventId(row) === event.eventId && isCompleted(row));
    const upload = uniqueUploads.find((row) => getEventId(row) === event.eventId);
    const uploadStatus = getRecordString(upload as RawRecord | undefined, ["상태", "status"]);
    const approvedUpload = isApproved(uploadStatus) ? upload : undefined;
    const rejectedUpload = isRejected(uploadStatus) ? upload : undefined;
    const pendingUpload = upload && !approvedUpload && !rejectedUpload ? upload : undefined;
    const status = getLookupItemStatus(Boolean(completion), Boolean(approvedUpload), Boolean(pendingUpload), Boolean(rejectedUpload));

    return {
      eventId: event.eventId,
      title: event.제목,
      department: event.담당부서,
      status,
      completedAt: formatDisplayDate(getRecordString(completion as RawRecord | undefined, ["이수일시", "completedAt"]) || getRecordString(approvedUpload as RawRecord | undefined, ["검토일시", "completedAt", "업로드일시"])),
      completionSource: getRecordString(completion as RawRecord | undefined, ["이수경로", "completionSource"]) || (approvedUpload ? "이수증 제출" : undefined),
      uploadStatus: uploadStatus || undefined,
      uploadFileName: getRecordString(upload as RawRecord | undefined, ["파일명", "fileName"]) || undefined,
      rejectReason: getRecordString(rejectedUpload as RawRecord | undefined, ["반려사유", "rejectReason"]) || undefined
    };
  });

  return {
    staff: {
      staffId,
      staffName,
      department
    },
    summary: {
      completedCount: items.filter((item) => normalizeStatusText(item.status).includes("이수완료")).length,
      incompleteCount: items.filter((item) => normalizeStatusText(item.status).includes("미이수")).length,
      pendingCount: items.filter((item) => {
        const status = normalizeStatusText(item.status);
        return status.includes("승인대기") || status.includes("제출완료");
      }).length,
      rejectedCount: items.filter((item) => normalizeStatusText(item.status).includes("반려")).length
    },
    items
  };
}

function getLookupItemStatus(
  hasCompletion: boolean,
  hasApprovedUpload: boolean,
  hasPendingUpload: boolean,
  hasRejectedUpload: boolean
): MyTrainingLookupItem["status"] {
  if (hasCompletion || hasApprovedUpload) {
    return "이수완료" as MyTrainingLookupItem["status"];
  }

  if (hasRejectedUpload) {
    return "반려" as MyTrainingLookupItem["status"];
  }

  if (hasPendingUpload) {
    return "제출완료" as MyTrainingLookupItem["status"];
  }

  return "미이수" as MyTrainingLookupItem["status"];
}

function getEventId(row: unknown) {
  return getRecordString(row as RawRecord | undefined, ["eventId", "교육ID"]);
}

function isCompleted(row: unknown) {
  const record = row as RawRecord | undefined;
  const value = getRecordString(record, ["이수완료", "completed"]);

  return value === "true" || value === "TRUE" || value === "1" || value === "완료" || value === "이수완료";
}

function isApproved(status: string) {
  return status.includes("승인") || status.includes("이수완료");
}

function isRejected(status: string) {
  return status.includes("반려");
}

function getUploadDate(row: unknown) {
  return getRecordString(row as RawRecord | undefined, ["업로드일시", "uploadedAt"]);
}

function getRecordString(record: RawRecord | undefined, keys: string[], fallback = "") {
  if (!record) {
    return fallback;
  }

  for (const key of keys) {
    const value = record[key];

    if (value != null && String(value).trim()) {
      return String(value);
    }
  }

  return fallback;
}

function formatDisplayDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(parsedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatDateTime(date.toISOString());
}

function normalizeStatusText(status: unknown) {
  return status == null ? "" : String(status).replace(/\s/g, "");
}

async function submitGroupQrAttendanceToAppsScript(input: SubmitQrAttendanceInput): Promise<SubmitGroupAttendanceResult> {
  const result = await postAppsScriptEnvelope<RawRecord>({
    ...createQrAttendancePayload(input),
    mode: "group"
  });
  const data = result.data ?? {};
  const results = Array.isArray(data.results)
    ? data.results.map((item) => normalizeAttendanceResult(item as RawRecord))
    : [];
  const completedCount = Number(data.completedCount ?? results.filter((item) => item.status === "completed").length);
  const skippedCount = Number(data.skippedCount ?? results.filter((item) => item.status === "already").length);
  const message = result.message ?? `출석 완료 ${completedCount}건, 이미 출석 처리 ${skippedCount}건`;

  if (!result.success) {
    return {
      ok: false,
      completedCount: 0,
      skippedCount: 0,
      results,
      message
    };
  }

  return {
    ok: true,
    completedCount,
    skippedCount,
    results,
    message
  };
}

async function submitSingleQrAttendance(input: SubmitQrAttendanceInput & { eventId: string }): Promise<SubmitAttendanceResult> {
  const result = await postAppsScriptEnvelope<RawRecord>(createQrAttendancePayload(input));
  const row = result.data ?? {};
  const message = result.message ?? (result.success ? "QR 출석이 기록되었습니다." : "QR 출석 저장에 실패했습니다.");

  if (!result.success) {
    return {
      ok: false,
      eventId: input.eventId,
      message
    };
  }

  return normalizeAttendanceResult(row, input.eventId, message);
}

function createQrAttendancePayload(input: SubmitQrAttendanceInput): RawRecord {
  return {
    action: "submitQrAttendance",
    mode: input.mode,
    eventId: input.eventId,
    eventIds: input.eventIds,
    groupId: input.groupId,
    staffId: input.staffId,
    name: input.staffName,
    staffName: input.staffName,
    department: input.department,
    position: input.position,
    성명: input.staffName,
    소속부서: input.department,
    직책: input.position,
    signature: input.signature
  };
}

function normalizeAttendanceResult(row: RawRecord, fallbackEventId = "", fallbackMessage = "QR 출석이 기록되었습니다."): SubmitAttendanceResult {
  const message = asString(row.message, fallbackMessage);
  const already =
    asString(row.status) === "already" ||
    asString(row.상태) === "already" ||
    asString(row.상태) === "중복" ||
    message.includes("이미") ||
    message.toLowerCase().includes("already");

  return {
    ok: asString(row.ok, "true") !== "false",
    eventId: asString(row.eventId, fallbackEventId),
    attendanceId: asString(row.attendanceId),
    status: already ? "already" : "completed",
    message
  };
}
