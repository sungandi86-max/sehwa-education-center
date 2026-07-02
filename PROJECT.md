# Project

## Purpose

세화 교직원 교육센터 MVP는 교직원이 교육 출석, 이수증 제출, 이수현황 확인을 빠르게 처리하도록 만든 업무 포털입니다.

웹사이트는 관리자 대시보드가 아닙니다. 관리자 업무는 Google Sheet에서 처리하고, 포털은 교직원 경험에 집중합니다.

## Product Principles

- 로그인 없이 StaffLookupModal로 본인 확인
- Staff Session은 임시 클라이언트 세션
- 화면은 업무 처리 앱처럼 짧고 명확하게
- 교육 생성/승인/반려는 Google Sheet에서 처리
- Apps Script 장애 또는 데이터 없음 상황에서 개발자 문구를 노출하지 않음

## MVP Feature Scope

- QR 출석
- 그룹 QR 출석
- 전자서명
- A4 QR 출력
- 내 이수현황
- 이수증 제출
- Google Sheet / Apps Script 연동

## Evidence Storage Rule

- Google Sheet에는 사람이 이해할 수 있는 기록과 Drive 링크만 저장합니다.
- 전자서명 base64 원문은 `교육참석` 시트에 저장하지 않습니다.
- Apps Script는 전자서명을 PNG로 변환해 Google Drive에 저장합니다.
- `교육참석`에는 `signatureId`, `signatureFileId`, `signatureImageUrl`을 저장합니다.
- 그룹 QR 출석은 전자서명 1개를 공유하고, 교육 개수만큼 참석 행을 저장합니다.
- 이수증 제출은 제출 기록 중심으로 단순하게 저장합니다.

## Staff Session Rule

- 로그인은 사용하지 않습니다.
- StaffLookupModal에서 성명과 필요 시 소속부서로 본인 확인합니다.
- 조회된 Staff 객체 하나를 화면의 single source of truth로 사용합니다.
- Staff Session은 브라우저 `sessionStorage`에 임시 저장됩니다.
- 새 브라우저 세션 또는 세션 초기화 시 다시 조회할 수 있습니다.
- `다른 사용자 조회`를 누르면 기존 Staff와 이전 조회 결과를 비웁니다.

## Out of Scope

- 웹 관리자 교육 생성
- 웹 관리자 승인/반려 UI
- 정식 로그인/SSO
- 보고서 자동 생성 고도화

## Deployment

- Repository: `sungandi86-max/sehwa-education-center`
- Branch: `main`
- Hosting: Vercel Production
- Production URL: `https://sehwa-education-center.vercel.app`
- Required env var: `NEXT_PUBLIC_APPS_SCRIPT_API_URL`
