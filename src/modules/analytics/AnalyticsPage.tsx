import { PageHeader, Notice } from '@/components/ui';

export function AnalyticsPage() {
  return (
    <>
      <PageHeader eyebrow="Analitika" title="Diagnostik analitika paneli" />
      <Notice kind="info" title="Tahlil uchun natijalar mavjud emas">
        Test natijalari yig‘ilgach, tahlil shu yerda ko‘rinadi.
      </Notice>
    </>
  );
}
