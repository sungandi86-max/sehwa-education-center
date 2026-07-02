# Sehwa Education Center

세화 교직원 교육센터는 교직원이 짧게 접속해 교육 업무를 처리하는 MVP 포털입니다.

관리자는 웹사이트에서 교육을 생성하지 않습니다. Google Sheet를 CMS처럼 사용하고, Apps Script가 API 서버 역할을 하며, Next.js/Vercel은 교직원용 화면만 제공합니다.

## Current MVP

- 메인 3개 카드: QR 출석, 이수증 제출, 내 이수현황
- 단일 QR 출석: `/qr/[eventId]`
- 묶음 QR 출석: `/qr/group/[groupId]`
- A4 QR 출력: `/print/qr/[eventId]`, `/print/qr/group/[groupId]`
- 전자서명 1회 저장 요청
- 내 이수현황 조회
- 이수증 제출 기록 저장
- Apps Script 연동 및 Mock Adapter fallback

## Runtime

- Google Sheet: 관리자 CMS
- Apps Script: API 서버
- Next.js/Vercel: 교직원 포털

환경변수:

```bash
NEXT_PUBLIC_APPS_SCRIPT_API_URL=https://script.google.com/macros/s/.../exec
```

환경변수가 있으면 Apps Script API를 사용하고, 없으면 Mock Adapter를 사용합니다.

## Operations

1. 교육 담당자는 Google Sheet에서 교육목록, 교육대상, 공지, 자료, 승인/반려를 관리합니다.
2. 교육 당일 `/print/qr/[eventId]` 또는 `/print/qr/group/[groupId]`에서 A4 QR을 출력합니다.
3. 교직원은 QR을 스캔하고 StaffLookupModal에서 본인 확인 후 전자서명합니다.
4. Apps Script는 `교육참석` 또는 `이수증업로드` 탭에 행을 추가합니다.
5. 교직원은 `/my`에서 내 이수현황과 제출 상태를 확인합니다.

## Documentation

- [PROJECT.md](./PROJECT.md): 운영 목적과 MVP 범위
- [ARCHITECTURE.md](./ARCHITECTURE.md): Google Sheet 구조, Apps Script action, 데이터 규칙
- [NEXT.md](./NEXT.md): 다음 작업과 운영 점검 목록

## Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

