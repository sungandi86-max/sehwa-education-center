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
- Store group QR signature once in Drive and write shared `signatureId` or `signatureImageUrl` to each attendance row.

## Data Quality Tasks

- Fill `eventGroupId` consistently in `교육목록`.
- Decide whether `묶음과정매핑` is canonical or supplemental.
- Normalize status values:
  - Training: `진행중`, `예정`, `완료`, `보관`
  - Upload: `제출완료`, `확인중`, `승인`, `반려`
  - Attendance: `이수`
- Confirm `교육이력_VIEW` includes both QR attendance and approved certificate uploads.

## Product Tasks

- Finish real Drive file upload for certificates.
- Add staff-facing duplicate certificate confirmation with previous upload details.
- Add lightweight production smoke tests for:
  - `/print/qr/TR-2026-001`
  - `/qr/TR-2026-001`
  - `/qr/group/GRP-2026-CPR`
  - `/my`
  - `/upload`
- Add a small operations page or script that checks Apps Script health and required action availability.

