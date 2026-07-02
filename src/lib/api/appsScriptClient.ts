import { APP_CONFIG } from "@/lib/config";
import { trainingEvents } from "@/lib/mock-data";
import { mockAppsScriptAdapter, formatDateTime } from "@/lib/api/mockAppsScriptAdapter";
import type { StaffRow, TrainingEventRow, TrainingMaterialRow } from "@/types/training";
import type { SubmitGroupAttendanceResult, SubmitAttendanceResult } from "@/lib/api/appsScriptAdapter";
import type { MyTrainingLookupResult } from "@/lib/my-training-lookup";

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

const postAppsScript = async <T>(payload: RawRecord): Promise<T> => {
  if (!APPS_SCRIPT_API_URL) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_API_URL is not configured.");
  }

  const response = await fetch(APPS_SCRIPT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Apps Script request failed: ${response.status}`);
  }

  const result = (await response.json()) as AppsScriptResponse<T>;

  if (!result.success) {
    throw new Error(result.error ?? result.message ?? "Apps Script request failed.");
  }

  return result.data as T;
};

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
      return mockAppsScriptAdapter.getGroupTrainings(groupId);
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

  async lookupMyTrainingStatus(input: { staffName: string; department?: string; year: number }): Promise<MyTrainingLookupResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.lookupMyTrainingStatus(input);
    }

    return postAppsScript<MyTrainingLookupResult>({
      action: "lookupMyTrainingStatus",
      staffName: input.staffName,
      department: input.department,
      year: String(input.year)
    });
  },

  getTrainingDetail: mockAppsScriptAdapter.getTrainingDetail.bind(mockAppsScriptAdapter),
  getMyTrainingHistory: mockAppsScriptAdapter.getMyTrainingHistory.bind(mockAppsScriptAdapter),
  async submitQrAttendance(eventId: string, staffId: string, signature?: string): Promise<SubmitAttendanceResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.submitQrAttendance(eventId, staffId);
    }

    return postAppsScript<SubmitAttendanceResult>({
      action: "submitQrAttendance",
      eventId,
      staffId,
      signature
    });
  },
  async submitGroupQrAttendance(input: { groupId: string; eventIds: string[]; staffId: string; signature?: string }): Promise<SubmitGroupAttendanceResult> {
    if (!APPS_SCRIPT_API_URL) {
      return mockAppsScriptAdapter.submitGroupQrAttendance(input);
    }

    try {
      return await postAppsScript<SubmitGroupAttendanceResult>({
        action: "submitGroupQrAttendance",
        ...input
      });
    } catch {
      const results = [];

      for (const eventId of input.eventIds) {
        results.push(await appsScriptClient.submitQrAttendance(eventId, input.staffId, input.signature));
      }

      const completedCount = results.filter((result) => result.ok && result.status !== "already").length;
      const skippedCount = results.filter((result) => result.ok && result.status === "already").length;

      return {
        ok: results.every((result) => result.ok),
        completedCount,
        skippedCount,
        results,
        message: `출석 완료 ${completedCount}건, 이미 출석 처리 ${skippedCount}건`
      };
    }
  },
  uploadCertificate: mockAppsScriptAdapter.uploadCertificate.bind(mockAppsScriptAdapter),
  getMyUploads: mockAppsScriptAdapter.getMyUploads.bind(mockAppsScriptAdapter),
  getUploadStatus: mockAppsScriptAdapter.getUploadStatus.bind(mockAppsScriptAdapter)
};

export { formatDateTime };
