import { APP_CONFIG } from "@/lib/config";
import { certificateUploads, staff, trainingAttendances, trainingEvents } from "@/lib/mock-data";

export type MyTrainingItemStatus = "이수완료" | "미이수" | "승인대기" | "반려";

export interface MyTrainingLookupItem {
  eventId: string;
  title: string;
  department: string;
  status: MyTrainingItemStatus;
  completedAt?: string;
  completionSource?: string;
  uploadStatus?: string;
  uploadFileName?: string;
  rejectReason?: string;
}

export interface MyTrainingLookupResult {
  staff?: {
    staffId: string;
    staffName: string;
    department: string;
  };
  needsDepartment?: boolean;
  departments?: string[];
  summary: {
    completedCount: number;
    incompleteCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
  items: MyTrainingLookupItem[];
}

const emptyResult = (departments?: string[]): MyTrainingLookupResult => ({
  needsDepartment: Boolean(departments?.length),
  departments,
  summary: {
    completedCount: 0,
    incompleteCount: 0,
    pendingCount: 0,
    rejectedCount: 0
  },
  items: []
});

const formatLookupDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Seoul"
      }).format(new Date(value))
    : undefined;

const demoNameToStaffId: Record<string, string> = {
  김인화: "T-1001",
  이연주: "T-1002",
  박수진: "T-1003",
  최민서: "T-1004",
  정다은: "T-1005",
  서유진: "T-1006"
};

export function lookupMyTrainingStatus({
  staffName,
  department,
  year = APP_CONFIG.currentYear
}: {
  staffName: string;
  department?: string;
  year?: number;
}): MyTrainingLookupResult {
  const normalizedName = staffName.trim();

  if (!normalizedName) {
    return emptyResult();
  }

  const nameMatches = staff.filter((member) => member.성명 === normalizedName);
  const fallbackStaff = demoNameToStaffId[normalizedName]
    ? staff.find((member) => member.교직원ID === demoNameToStaffId[normalizedName])
    : undefined;
  const matchedStaff = nameMatches.length > 0 ? nameMatches : fallbackStaff ? [fallbackStaff] : [];

  if (matchedStaff.length === 0) {
    return emptyResult();
  }

  const departmentMatches = department
    ? matchedStaff.filter((member) => member.소속부서 === department)
    : matchedStaff;

  if (matchedStaff.length > 1 && !department) {
    return emptyResult([...new Set(matchedStaff.map((member) => member.소속부서))]);
  }

  const selectedStaff = departmentMatches[0];

  if (!selectedStaff) {
    return emptyResult([...new Set(matchedStaff.map((member) => member.소속부서))]);
  }

  const targetEvents = trainingEvents.filter((event) => event.연도 === year);
  const items = targetEvents.map((event) => {
    const attendance = trainingAttendances.find((row) => row.eventId === event.eventId && row.교직원ID === selectedStaff.교직원ID);
    const upload = certificateUploads.find((row) => row.eventId === event.eventId && row.교직원ID === selectedStaff.교직원ID);
    const approvedUpload = upload?.상태 === "승인" ? upload : undefined;
    const pendingUpload = upload?.상태 === "제출완료" || upload?.상태 === "확인중" ? upload : undefined;
    const rejectedUpload = upload?.상태 === "반려" ? upload : undefined;
    const completedAt = attendance?.참석일시 ?? approvedUpload?.검토일시 ?? approvedUpload?.업로드일시;
    const status: MyTrainingItemStatus = attendance || approvedUpload
      ? "이수완료"
      : pendingUpload
        ? "승인대기"
        : rejectedUpload
          ? "반려"
          : "미이수";

    return {
      eventId: event.eventId,
      title: event.제목,
      department: event.담당부서,
      status,
      completedAt: formatLookupDateTime(completedAt),
      completionSource: attendance?.참석방법 ?? (approvedUpload ? "이수증업로드" : undefined),
      uploadStatus: upload?.상태,
      uploadFileName: upload?.파일명,
      rejectReason: rejectedUpload?.반려사유
    };
  });

  const summary = {
    completedCount: items.filter((item) => item.status === "이수완료").length,
    incompleteCount: items.filter((item) => item.status === "미이수").length,
    pendingCount: items.filter((item) => item.status === "승인대기").length,
    rejectedCount: items.filter((item) => item.status === "반려").length
  };

  return {
    staff: {
      staffId: selectedStaff.교직원ID,
      staffName: normalizedName,
      department: selectedStaff.소속부서
    },
    summary,
    items
  };
}
