export const APP_CONFIG = {
  schoolName: "세화여자고등학교",
  shortSchoolName: "세화",
  appName: "세화 교직원 교육센터",
  developerName: "sehwa-education-center",
  currentYear: 2026
} as const;

export type AppConfig = typeof APP_CONFIG;
