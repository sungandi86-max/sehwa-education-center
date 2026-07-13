import { APP_CONFIG } from "./config";
import type {
  CertificateUploadRow,
  CourseBundleMappingRow,
  DepartmentRow,
  ReportRow,
  StaffRow,
  TrainingAttendanceRow,
  TrainingEventRow,
  TrainingMaterialRow,
  TrainingTargetRow
} from "./types";

export const departments: DepartmentRow[] = [
  {
    departmentId: "dept-teaching",
    부서명: "교무기획부",
    담당자ID: "T-1001",
    담당자명: "김세화",
    driveFolderId: "drive-dept-teaching",
    driveFolderUrl: "https://drive.google.com/drive/folders/drive-dept-teaching"
  },
  {
    departmentId: "dept-curriculum",
    부서명: "교육과정부",
    담당자ID: "T-1002",
    담당자명: "이연수",
    driveFolderId: "drive-dept-curriculum",
    driveFolderUrl: "https://drive.google.com/drive/folders/drive-dept-curriculum"
  },
  {
    departmentId: "dept-student",
    부서명: "학생안전부",
    담당자ID: "T-1003",
    담당자명: "박지윤",
    driveFolderId: "drive-dept-student",
    driveFolderUrl: "https://drive.google.com/drive/folders/drive-dept-student"
  }
];

export const staff: StaffRow[] = [
  { 교직원ID: "T-1001", 성명: "김세화", 소속부서: "교무기획부", 직위: "부장", 이메일: "teacher1@example.edu", 재직상태: "재직" },
  { 교직원ID: "T-1002", 성명: "이연수", 소속부서: "교육과정부", 직위: "교사", 이메일: "teacher2@example.edu", 재직상태: "재직" },
  { 교직원ID: "T-1003", 성명: "박지윤", 소속부서: "학생안전부", 직위: "교사", 이메일: "teacher3@example.edu", 재직상태: "재직" },
  { 교직원ID: "T-1004", 성명: "최민정", 소속부서: "창의인성부", 직위: "교사", 이메일: "teacher4@example.edu", 재직상태: "재직" },
  { 교직원ID: "T-1005", 성명: "정다은", 소속부서: "1학년부", 직위: "교사", 이메일: "teacher5@example.edu", 재직상태: "재직" },
  { 교직원ID: "T-1006", 성명: "한유진", 소속부서: "2학년부", 직위: "교사", 이메일: "teacher6@example.edu", 재직상태: "재직" }
];

export const trainingEvents: TrainingEventRow[] = [
  {
    eventId: "EVT-2026-001",
    제목: "2026 교직원 개인정보보호 및 정보보안 연수",
    연도: APP_CONFIG.currentYear,
    담당부서: "교무기획부",
    담당자ID: "T-1001",
    담당자명: "김세화",
    시작일시: "2026-07-02T09:00:00+09:00",
    종료일시: "2026-07-02T10:30:00+09:00",
    장소: "시청각실",
    상태: "active",
    필수여부: true,
    설명: "전 교직원 대상 필수 보안 연수",
    signatureOpenAt: "2026-07-02T08:55:00+09:00",
    signatureCloseAt: "2026-07-02T09:15:00+09:00",
    attendanceSubtitle: "연수 참여 전자서명",
    attendanceNotice: "연수 종료 후 만족도 조사에도 참여해주세요.",
    folderMode: "departmentFolder",
    담당자드라이브폴더ID: "drive-dept-teaching",
    담당자드라이브폴더URL: "https://drive.google.com/drive/folders/drive-dept-teaching",
    서명부파일ID: "sign-2026-001",
    서명부파일URL: "https://drive.google.com/file/d/sign-2026-001/view"
  },
  {
    eventId: "EVT-2026-002",
    제목: "학생 평가 공정성 강화 교원 연수",
    연도: APP_CONFIG.currentYear,
    담당부서: "교육과정부",
    담당자ID: "T-1002",
    담당자명: "이연수",
    시작일시: "2026-07-05T15:30:00+09:00",
    종료일시: "2026-07-05T16:30:00+09:00",
    장소: "회의실 A",
    상태: "scheduled",
    필수여부: true,
    설명: "평가 운영 지침 및 사례 공유",
    folderMode: "eventOwnerFolder",
    담당자드라이브폴더ID: "drive-owner-1002",
    담당자드라이브폴더URL: "https://drive.google.com/drive/folders/drive-owner-1002"
  },
  {
    eventId: "EVT-2026-003",
    제목: "외부 온라인 안전교육 이수증 제출",
    연도: APP_CONFIG.currentYear,
    담당부서: "학생안전부",
    담당자ID: "T-1003",
    담당자명: "박지윤",
    시작일시: "2026-06-20T00:00:00+09:00",
    종료일시: "2026-07-15T23:59:00+09:00",
    장소: "온라인",
    상태: "active",
    필수여부: true,
    설명: "외부 플랫폼 이수 후 이수증 업로드",
    folderMode: "customFolder",
    담당자드라이브폴더ID: "drive-custom-safety",
    담당자드라이브폴더URL: "https://drive.google.com/drive/folders/drive-custom-safety"
  }
];

export const trainingTargets: TrainingTargetRow[] = trainingEvents.flatMap((event) =>
  staff.map((member) => ({
    targetId: `${event.eventId}-${member.교직원ID}`,
    eventId: event.eventId,
    교직원ID: member.교직원ID,
    성명: member.성명,
    소속부서: member.소속부서,
    대상구분: "전체"
  }))
);

export const trainingAttendances: TrainingAttendanceRow[] = [
  {
    attendanceId: "ATT-001",
    eventId: "EVT-2026-001",
    교직원ID: "T-1001",
    성명: "김세화",
    소속부서: "교무기획부",
    참석일시: "2026-07-02T09:03:00+09:00",
    참석방법: "QR"
  },
  {
    attendanceId: "ATT-002",
    eventId: "EVT-2026-001",
    교직원ID: "T-1002",
    성명: "이연수",
    소속부서: "교육과정부",
    참석일시: "2026-07-02T09:05:00+09:00",
    참석방법: "관리자",
    처리자: "김세화"
  },
  {
    attendanceId: "ATT-003",
    eventId: "EVT-2026-003",
    교직원ID: "T-1004",
    성명: "최민정",
    소속부서: "창의인성부",
    참석일시: "2026-06-25T14:20:00+09:00",
    참석방법: "이수증업로드",
    uploadId: "UP-001"
  }
];

export const certificateUploads: CertificateUploadRow[] = [
  {
    uploadId: "UP-001",
    eventId: "EVT-2026-003",
    교직원ID: "T-1004",
    성명: "최민정",
    소속부서: "창의인성부",
    파일명: "최민정_안전교육_이수증.pdf",
    파일URL: "https://drive.google.com/file/d/cert-001/view",
    파일ID: "cert-001",
    업로드일시: "2026-06-25T14:10:00+09:00",
    상태: "승인",
    certificateNumber: "SAFE-2026-0142",
    trainingTitle: "학교 안전교육 기본 과정",
    completedAt: "2026-06-25",
    trainingHours: "3시간",
    issuer: "한국교육안전연수원",
    rawText: "이수증 번호 SAFE-2026-0142. 성명 최민정. 학교 안전교육 기본 과정. 이수일자 2026-06-25. 총 3시간. 발급기관 한국교육안전연수원.",
    confidence: 0.94,
    aiReviewStatus: "extracted",
    검토자: "박지윤",
    검토일시: "2026-06-25T15:00:00+09:00"
  },
  {
    uploadId: "UP-002",
    eventId: "EVT-2026-003",
    교직원ID: "T-1005",
    성명: "정다은",
    소속부서: "1학년부",
    파일명: "정다은_온라인안전교육.png",
    파일URL: "https://drive.google.com/file/d/cert-002/view",
    파일ID: "cert-002",
    업로드일시: "2026-06-28T10:40:00+09:00",
    상태: "확인중",
    certificateNumber: "SAFE-2026-0188",
    trainingTitle: "온라인 안전교육 심화",
    completedAt: "2026-06-28",
    trainingHours: "2시간",
    issuer: "교육부 중앙교육연수원",
    rawText: "온라인 안전교육 심화. 성명 정다은. 이수일자 2026-06-28. 발급기관 교육부 중앙교육연수원. 일부 영역 흐림.",
    confidence: 0.72,
    aiReviewStatus: "needReview"
  },
  {
    uploadId: "UP-003",
    eventId: "EVT-2026-003",
    교직원ID: "T-1006",
    성명: "한유진",
    소속부서: "2학년부",
    파일명: "한유진_이수증.pdf",
    파일URL: "https://drive.google.com/file/d/cert-003/view",
    파일ID: "cert-003",
    업로드일시: "2026-06-29T12:15:00+09:00",
    상태: "반려",
    trainingTitle: "안전교육",
    rawText: "성명 한유진. 안전교육. 이수 시간 및 번호 영역 식별 불가.",
    confidence: 0.41,
    aiReviewStatus: "needReview",
    반려사유: "이수 시간이 확인되지 않습니다.",
    검토자: "박지윤",
    검토일시: "2026-06-29T13:00:00+09:00"
  }
];

export const trainingMaterials: TrainingMaterialRow[] = [
  {
    materialId: "MAT-001",
    eventId: "EVT-2026-001",
    제목: "개인정보보호 연수 자료 PDF",
    자료유형: "PDF",
    자료URL: "https://drive.google.com/file/d/material-001/view",
    공개여부: true
  },
  {
    materialId: "MAT-002",
    eventId: "EVT-2026-002",
    제목: "평가 공정성 사례 영상",
    자료유형: "동영상",
    자료URL: "https://video.example.edu/evaluation",
    공개여부: true
  },
  {
    materialId: "MAT-003",
    eventId: "EVT-2026-003",
    제목: "외부 안전교육 플랫폼",
    자료유형: "외부링크",
    자료URL: "https://training.example.edu/safety",
    공개여부: true
  }
];

export const courseBundleMappings: CourseBundleMappingRow[] = [
  {
    mappingId: "MAP-2026-001-01",
    groupId: "GRP-2026-001",
    bundleId: "GRP-2026-001",
    bundleName: "7월 교직원 필수연수 묶음",
    eventId: "EVT-2026-001",
    sortOrder: 1
  },
  {
    mappingId: "MAP-2026-001-02",
    groupId: "GRP-2026-001",
    bundleId: "GRP-2026-001",
    bundleName: "7월 교직원 필수연수 묶음",
    eventId: "EVT-2026-002",
    sortOrder: 2
  },
  {
    mappingId: "MAP-2026-001-03",
    groupId: "GRP-2026-001",
    bundleId: "GRP-2026-001",
    bundleName: "7월 교직원 필수연수 묶음",
    eventId: "EVT-2026-003",
    sortOrder: 3
  }
];

export const reports: ReportRow[] = [
  {
    reportId: "REP-001",
    eventId: "EVT-2026-001",
    보고서명: "개인정보보호 연수 참석 보고서",
    생성상태: "완료",
    파일ID: "report-001",
    파일URL: "https://drive.google.com/file/d/report-001/view",
    생성일시: "2026-07-02T10:45:00+09:00"
  },
  {
    reportId: "REP-002",
    eventId: "EVT-2026-003",
    보고서명: "온라인 안전교육 이수 현황",
    생성상태: "대기"
  }
];
