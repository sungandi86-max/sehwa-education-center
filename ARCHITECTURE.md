# Architecture

## System Overview

```text
Google Sheet
  = 관리자 CMS
Apps Script
  = JSON API server
Next.js / Vercel
  = Staff-facing portal
```

The frontend treats Apps Script rows as raw records and normalizes them into typed frontend models. If `NEXT_PUBLIC_APPS_SCRIPT_API_URL` is missing, the app uses Mock Adapter data only for local development.

## Google Sheet Tabs

| Tab | Purpose | Required / expected headers | Notes |
| --- | --- | --- | --- |
| 설정 | App config | `key`, `value`, `description` | `getAppConfig` returns a key/value object. |
| 공지사항 | Home notice banner | `noticeId`, `제목`, `내용`, `사용여부`, `홈노출`, `공지일`, `작성부서`, `작성자` | Rows should use `사용여부=사용`, `홈노출=사용` to appear. |
| 교직원명단 | Staff lookup | `교직원ID`, `성명`, `소속부서`, `직책` or `직위`, `이메일`, `재직상태` | Frontend maps `직책` to `직위`; `교직원ID` is the stable staff key. |
| 교육목록 | Training CMS | `교육연도`, `eventId`, `eventGroupId`, `사용여부`, `홈노출`, `상태`, `교육명`, `담당부서`, `담당자`, `일자`, `시작시간`, `종료시간`, `장소`, `교육내용`, `folderMode`, `담당자드라이브폴더ID`, `담당자드라이브폴더URL`, `서명부파일ID`, `서명부파일URL`, `자료링크`, `제출유형` | Frontend also accepts `제목`, `연도`, `시작일시`, `종료일시`, `groupId`, `bundleId` aliases. |
| 교육대상 | Training target list | `targetId`, `eventId`, `교직원ID`, `성명`, `소속부서`, `대상구분` | Current MVP mostly derives status from trainings, attendance, and uploads. |
| 교육참석 | QR/admin attendance records | `attendanceId`, `eventId`, `eventGroupId`, `교직원ID`, `성명`, `소속부서`, `직책`, `참석일시`, `참석방법`, `상태`, `전자서명`, `signatureId`, `signatureImageUrl`, `비고` | Duplicate key is `staffId + eventId`. |
| 이수증업로드 | Certificate submissions | `uploadId`, `eventId`, `교직원ID`, `성명`, `소속부서`, `파일명`, `파일ID`, `파일URL`, `업로드일시`, `상태`, `certificateNumber`, `trainingTitle`, `completedAt`, `trainingHours`, `issuer`, `rawText`, `confidence`, `aiReviewStatus`, `반려사유`, `검토자`, `검토일시`, `비고` | MVP may store placeholder file URL until Drive upload is complete. |
| 묶음과정매핑 | Optional group mapping | `mappingId`, `groupId`, `bundleId`, `bundleName`, `eventId`, `sortOrder` | Current Apps Script primarily reads `eventGroupId` from `교육목록`; this tab documents the target structure for later. |
| 교육이력_VIEW | Completion view | `eventId`, `교직원ID`, `성명`, `소속부서`, `이수완료`, `이수일시`, `이수경로` | Used by `getMyTrainingHistory`; can be a formula/query view. |

## Field Mapping Notes

- Training title: `교육명` -> frontend `제목`; fallback accepts `제목`.
- Training year: `교육연도` -> frontend `연도`; fallback accepts `연도`.
- Training datetime: `일자` + `시작시간`/`종료시간` -> frontend `시작일시`/`종료일시`; fallback accepts already combined datetime fields.
- Group id: `eventGroupId` is canonical; `groupId` and `bundleId` are accepted aliases.
- Staff id: `교직원ID` is canonical; API requests use `staffId`.
- Staff name: `성명` is canonical; API requests may use `staffName` or `name`.
- Department: `소속부서` is canonical; API requests use `department`.
- Materials: standard action name is `getMaterialsByEvent`; existing Apps Script name `getMaterials` remains supported as a compatibility alias.

## Apps Script Response Envelope

All actions should return:

```json
{
  "success": true,
  "data": {}
}
```

For errors:

```json
{
  "success": false,
  "message": "사용자에게 보여줄 수 있는 메시지"
}
```

The frontend hides low-level errors and shows user-friendly messages.

## Apps Script Actions

### getAppConfig

Request:

```json
{ "action": "getAppConfig" }
```

Response:

```json
{
  "success": true,
  "data": {
    "currentYear": "2026",
    "schoolName": "세화여자고등학교"
  }
}
```

### getNotices

Request:

```json
{ "action": "getNotices" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "noticeId": "N-001",
      "제목": "교직원 연수 안내",
      "내용": "오늘 연수 QR 출석을 진행해주세요.",
      "사용여부": "사용",
      "홈노출": "사용"
    }
  ]
}
```

### getTrainings

Request:

```json
{ "action": "getTrainings", "year": "2026" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "교육연도": "2026",
      "eventId": "TR-2026-001",
      "eventGroupId": "GRP-2026-CPR",
      "사용여부": "사용",
      "상태": "진행중",
      "교육명": "교직원 심폐소생술 교육",
      "담당부서": "보건실",
      "일자": "2026-07-15",
      "시작시간": "14:00",
      "종료시간": "16:00",
      "장소": "시청각실"
    }
  ]
}
```

### getTrainingDetail

Request:

```json
{ "action": "getTrainingDetail", "eventId": "TR-2026-001" }
```

Response:

```json
{
  "success": true,
  "data": {
    "event": { "eventId": "TR-2026-001", "교육명": "교직원 심폐소생술 교육" },
    "targets": [],
    "attendances": [],
    "materials": [],
    "uploads": [],
    "completions": []
  }
}
```

### getGroupTrainings

Request:

```json
{ "action": "getGroupTrainings", "groupId": "GRP-2026-CPR" }
```

Response:

```json
{
  "success": true,
  "data": [
    { "eventId": "TR-2026-001", "eventGroupId": "GRP-2026-CPR", "교육명": "교직원 심폐소생술 교육" }
  ],
  "count": 1
}
```

### getMaterialsByEvent

Request:

```json
{ "action": "getMaterialsByEvent", "eventId": "TR-2026-001" }
```

Compatibility request:

```json
{ "action": "getMaterials", "eventId": "TR-2026-001" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "materialId": "MAT-001",
      "eventId": "TR-2026-001",
      "자료명": "연수 자료",
      "자료유형": "PDF",
      "링크": "https://drive.google.com/...",
      "사용여부": "사용"
    }
  ]
}
```

### findStaff

Request:

```json
{ "action": "findStaff", "name": "박숙현", "department": "보건실" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "교직원ID": "T001",
      "성명": "박숙현",
      "소속부서": "보건실",
      "직책": "보건교사",
      "이메일": ""
    }
  ],
  "count": 1
}
```

If multiple rows match the same name, the frontend asks the user to choose or enter a department.

### getMyTrainingHistory

Request:

```json
{ "action": "getMyTrainingHistory", "staffId": "T001", "year": "2026" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "eventId": "TR-2026-001",
      "교직원ID": "T001",
      "이수완료": "완료",
      "이수일시": "2026-07-15 14:05",
      "이수경로": "QR"
    }
  ]
}
```

### getMyUploads

Request:

```json
{ "action": "getMyUploads", "staffId": "T001", "year": "2026" }
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "uploadId": "UP-001",
      "eventId": "TR-2026-001",
      "교직원ID": "T001",
      "파일명": "심폐소생술_이수증.pdf",
      "상태": "제출완료",
      "aiReviewStatus": "extracted"
    }
  ]
}
```

### submitQrAttendance

Single request:

```json
{
  "action": "submitQrAttendance",
  "mode": "single",
  "eventId": "TR-2026-001",
  "staffId": "T001",
  "staffName": "박숙현",
  "department": "보건실",
  "position": "보건교사",
  "signature": "data:image/png;base64,..."
}
```

Group request:

```json
{
  "action": "submitQrAttendance",
  "mode": "group",
  "groupId": "GRP-2026-CPR",
  "eventIds": ["TR-2026-001", "TR-2026-002"],
  "staffId": "T001",
  "staffName": "박숙현",
  "department": "보건실",
  "signature": "data:image/png;base64,..."
}
```

Response:

```json
{
  "success": true,
  "message": "출석 완료 1건, 이미 출석 처리 1건",
  "data": {
    "ok": true,
    "completedCount": 1,
    "skippedCount": 1,
    "results": [
      { "ok": true, "eventId": "TR-2026-001", "status": "completed", "message": "QR 출석이 기록되었습니다." },
      { "ok": true, "eventId": "TR-2026-002", "status": "already", "message": "이미 출석 처리된 교육입니다." }
    ]
  }
}
```

Duplicate rule:

- Duplicate key is `staffId + eventId`.
- Single QR writes one `교육참석` row unless the key already exists.
- Group QR uses one signature, then attempts one row per event.
- Existing rows are returned as `status: "already"` and counted as `skippedCount`.
- New rows are returned as `status: "completed"` and counted as `completedCount`.
- If signature storage is later moved to Drive, all rows in one group submission should share `signatureId` or `signatureImageUrl`.

### uploadCertificate

Request:

```json
{
  "action": "uploadCertificate",
  "eventId": "TR-2026-001",
  "staffId": "T001",
  "staffName": "박숙현",
  "department": "보건실",
  "fileName": "심폐소생술_이수증.pdf",
  "fileId": "placeholder-123",
  "fileUrl": "placeholder://certificate-upload",
  "certificateNumber": "CERT-2026-001",
  "trainingTitle": "교직원 심폐소생술 교육",
  "completedAt": "2026-07-15",
  "trainingHours": "2시간",
  "issuer": "세화여자고등학교",
  "confidence": 0.91,
  "aiReviewStatus": "pending"
}
```

Response:

```json
{
  "success": true,
  "message": "이수증 업로드 기록이 저장되었습니다.",
  "data": {
    "uploadId": "UP-1782983780475",
    "eventId": "TR-2026-001",
    "교직원ID": "T001",
    "상태": "제출완료"
  }
}
```

## QR Group Rules

- `/qr/[eventId]`: single attendance.
- `/qr/group/[groupId]`: group attendance.
- Staff signs once per submission.
- Apps Script appends one `교육참석` row per event.
- Duplicate rows are skipped by `staffId + eventId`.
- Completion screen must show completed/skipped counts and per-event results.

## Frontend API Routes

The browser does not call Apps Script directly for mutating flows.

- `POST /api/attendance/qr` -> `submitQrAttendance`
- `POST /api/certificates/upload` -> `uploadCertificate`
- `GET /api/certificates/uploads?q=T001` -> `getMyUploads`
- `POST /api/staff/find` -> `findStaff`
- `POST /api/my-training` -> composed my-training lookup

