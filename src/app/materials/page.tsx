import { BookOpen, ExternalLink } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, getTrainingTitle } from "@/lib/api/appsScriptClient";

export default async function MaterialsPage() {
  const [materials, trainings] = await Promise.all([appsScriptClient.getMaterials(), appsScriptClient.getTrainings()]);

  return (
    <div className="space-y-8">
      <PageHeader title="교육자료" description="교육자료와 안내 링크를 빠르게 확인합니다." />

      <div className="rounded-[24px] border border-brand-100 bg-gradient-to-r from-brand-50 to-softpurple-50 px-6 py-5 text-sm leading-7 text-slate-700">
        담당자가 Google Sheet에 등록한 교육자료와 안내 링크를 이곳에서 확인할 수 있습니다.
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {materials.map((material) => (
          <a key={material.materialId} href={material.자료URL} className="soft-card group flex min-h-64 flex-col p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-900 ring-1 ring-brand-100">
                <BookOpen size={22} />
              </div>
              <StatusBadge value={material.자료유형} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-brand-900">{material.제목}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{getTrainingTitle(material.eventId, trainings)}</p>
            <div className="mt-auto pt-6">
              <span className="btn-primary">
                자료보기
                <ExternalLink size={17} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
