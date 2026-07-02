# Next Work

## Immediate Operations Checklist

- Keep Google Sheet headers aligned with [ARCHITECTURE.md](./ARCHITECTURE.md).
- Confirm the deployed Apps Script supports these standard actions:
  - `getAppConfig`
  - `getNotices`
  - `getTrainings`
  - `getTrainingDetail`
  - `getGroupTrainings`
  - `getMaterialsByEvent`
  - `findStaff`
  - `getMyTrainingHistory`
  - `getMyUploads`
  - `submitQrAttendance`
  - `uploadCertificate`
- Keep `getMaterials` as a compatibility alias while older Apps Script deployments exist.
- For group QR tests, make sure `교육목록.eventGroupId` contains every event that should be included.
- For duplicate attendance tests, use a staff/event pair that is not already in `교육참석` when testing new append.

## Recommended Apps Script Cleanup

- Add `getTrainingDetail` if the deployed script does not already include it.
- Add `getMaterialsByEvent` as the canonical material action and keep `getMaterials` as an alias.
- Add a helper for canonical header reads if sheet headers drift.
- Add a `getSheetSchema` or admin-only `getHeaders` diagnostic action for future audits.
- Convert QR signature base64 to PNG in Apps Script before writing sheet rows.
- Never store long base64 directly in Google Sheet.
- Store group QR signature once in Drive and write shared `signatureId`, `signatureFileId`, and `signatureImageUrl` to each attendance row.
- Keep `이수증업로드` as a simple submission log: `업로드일시`, `성명`, `연수명`, `이수증번호`, `이수기관`, `이수일자`, `파일링크`, `상태`, `AI추출상태`.

## Data Quality Tasks

- Fill `eventGroupId` consistently in `교육목록`.
- Decide whether `묶음과정매핑` is canonical or supplemental.
- Normalize status values:
  - Training: `진행중`, `예정`, `완료`, `보관`
  - Upload: `제출완료`, `확인중`, `승인`, `반려`
  - Attendance: `이수`
- Confirm `교육이력_VIEW` includes both QR attendance and approved certificate uploads.

## Final Evidence Export

최종 목표는 교육 종료 후 담당자가 서명 이미지가 포함된 명단 엑셀을 다운로드하고, 그 엑셀을 PDF로 저장해 연수 증빙으로 사용할 수 있게 하는 것입니다.

Recommended export columns:

- 연수명
- 일시
- 장소
- 성명
- 소속부서
- 직책
- 참석일시
- 서명 이미지
- signatureImageUrl

## Product Tasks

- Finish real Drive file upload for certificates.
- Add staff-facing duplicate certificate confirmation with previous upload details.
- Add final roster export with embedded signature images.
- Add lightweight production smoke tests for:
  - `/print/qr/TR-2026-001`
  - `/qr/TR-2026-001`
  - `/qr/group/GRP-2026-CPR`
  - `/my`
  - `/upload`
- Add a small operations page or script that checks Apps Script health and required action availability.
