import { PageHeader, Card, Badge, StageNotice } from '@/components/ui';
import { appConfig } from '@/config/app.config';
import { endpoints } from '@/services/api/endpoints';

/** Markaziy ko‘p fanli platforma bilan integratsiya rejasi */
export function AdminIntegrationPage() {
  const ids = [
    ['organization_id', appConfig.organization.id, 'Ta’lim muassasasi'],
    ['subject_id', appConfig.subject.id, 'Fan (har bir fan sayti o‘z identifikatoriga ega)'],
    ['topic_id', 'in1-t01 … in2-t13', 'Mavzu (25 ta)'],
    ['concept_id', '2-bosqichda', 'Tushuncha'],
    ['learner_id', 'lrn-…', 'Talaba (barcha fanlar uchun yagona)'],
    ['activity_id', 'test-… / game-…', 'Test, o‘yin yoki so‘rovnoma'],
    ['attempt_id', 'server yaratadi', 'Har bir urinish'],
  ];
  const sample = `GET /api/${appConfig.api.version}${endpoints.federation.export}
X-Organization-Id: ${appConfig.organization.id}
X-Subject-Id: ${appConfig.subject.id}

{
  "subject_id": "${appConfig.subject.id}",
  "learner_id": "lrn-…",
  "activity_id": "test-in1-t06",
  "attempt_id": "att-…",
  "responses": [
    { "question_id": "q-…", "concept_id": "c-…",
      "is_correct": false, "error_type_id": "e-…", "confidence": 4 }
  ]
}`;

  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Markaziy platforma bilan integratsiya"
        description="Bu sayt kelajakdagi ko‘p fanli ta’lim ekotizimining birinchi moduli. Quyida ma’lumot almashinuvi uchun tayyorlangan identifikatorlar va API tuzilmasi."
        badges={<Badge tone="info">API {appConfig.api.version} · ulanmagan</Badge>}
      />
      <StageNotice stage={9}>Markaziy platformaga ulanish oxirgi bosqichda. Hozir faqat ma’lumotlar modeli va API kontrakti tayyorlangan.</StageNotice>
      <div className="grid grid--2 mt-5">
        <Card title="Global identifikatorlar" padded={false}>
          <div className="table-wrap table-wrap--flush">
            <table className="table">
              <thead><tr><th>Maydon</th><th>Qiymat</th><th>Ma’nosi</th></tr></thead>
              <tbody>
                {ids.map(([k, v, d]) => (
                  <tr key={k}><td className="mono">{k}</td><td className="mono small">{v}</td><td className="small">{d}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Ma’lumot almashinuvi namunasi" subtitle="Himoyalangan, versiyalangan API (rejada)">
          <pre className="code">{sample}</pre>
        </Card>
      </div>
    </>
  );
}
