import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, getTrainingTitle } from "@/lib/api/appsScriptClient";

export default async function MaterialsPage() {
  const [materials, trainings] = await Promise.all([appsScriptClient.getMaterials(), appsScriptClient.getTrainings()]);

  return (
    <div className="space-y-5">
      <PageHeader title="교육자료" description="교육자료와 안내 링크를 빠르게 확인합니다." />

      <div className="rounded-md border border-teal-100 bg-teal-50 px-5 py-3 text-sm leading-6 text-slate-700">
        담당자가 등록한 교육자료와 안내 링크를 빠르게 확인할 수 있습니다.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {materials.map((material) => (
          <a key={material.materialId} href={material.자료URL} className="group rounded-md border border-slate-200 bg-white p-5 shadow-soft hover:border-brand-200 hover:bg-brand-50">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-teal-700">자료 링크</p>
              <StatusBadge value={material.자료유형} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slateblue-900">{material.제목}</h2>
            <p className="mt-3 min-h-10 text-sm leading-6 text-slate-600">{getTrainingTitle(material.eventId, trainings)}</p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <span className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
                자료보기
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
