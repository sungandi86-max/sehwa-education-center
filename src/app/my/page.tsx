import { MyTrainingPageClient } from "@/components/my-training-page-client";
import { PageHeader } from "@/components/ui";

export default function MyTrainingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="내 이수현황" description="본인 확인 후 교육별 이수 내역과 이수증 제출 상태를 확인합니다." />
      <MyTrainingPageClient />
    </div>
  );
}
