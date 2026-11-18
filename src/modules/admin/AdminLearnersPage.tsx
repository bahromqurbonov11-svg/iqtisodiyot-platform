import { PageHeader, Notice } from '@/components/ui';

export function AdminLearnersPage() {
  return (
    <>
      <PageHeader eyebrow="Administrator paneli" title="Talabalar" />
      <Notice kind="info" title="Talabalar ro‘yxati ulanmagan">
        Talaba hisoblarini boshqarish uchun ro‘yxat ma’lumotlar bazasiga ulanishi kerak.
      </Notice>
    </>
  );
}
