# Arxitektura

## Asosiy tamoyillar

1. **Sahifalar ma’lumotni faqat servislardan oladi.** `modules/*` hech qachon `data/demo`
   ni to‘g‘ridan-to‘g‘ri import qilmaydi. Server tayyor bo‘lganda faqat `services/*`
   ichidagi funksiyalar `apiRequest(...)` bilan almashtiriladi.
2. **Har bir javobda manba ko‘rsatiladi.** Servislar `Sourced<T> = { data, origin }`
   qaytaradi: `syllabus` | `demo` | `server`. Interfeys `demo` bo‘lsa DEMO yorlig‘ini ko‘rsatadi.
3. **Ishlamaydigan funksiya ishlayotgandek ko‘rsatilmaydi.** `appConfig.features` bayroqlari,
   o‘chirilgan tugmalar va `StageNotice` komponenti orqali.
4. **Topshirilmagan ish = “ma’lumot yetarli emas”, 0% emas.** `MasteryLevel` turida
   `insufficient_data` holati; grafiklarda shtrixlangan katak.
5. **Kuzatuv ≠ gipoteza.** `Insight.kind`: `observation` | `hypothesis` | `recommendation`.

## Ma’lumotlar modeli (`src/models/index.ts`)

```
Organization ─┬─ Subject ── SubjectPart ── Topic ── Concept ── Skill
              │                                       │
              │                              Question ── AnswerOption ── ErrorType
              │
              └─ Learner (status: pending | approved | rejected | blocked)
                    │
                 Attempt ── ResponseRecord (javob, to‘g‘riligi, xato turi, ishonch 1–5, vaqt)
                    │
                 Activity (diagnostic_test | game | survey)
```

Global identifikatorlar: `organization_id`, `subject_id`, `topic_id`, `concept_id`,
`learner_id`, `activity_id`, `attempt_id` — markaziy ko‘p fanli platforma uchun.

## API kontrakti (`src/services/api/endpoints.ts`)

Versiyalangan: `/api/v1/...`. Har bir so‘rovda `X-Organization-Id` va `X-Subject-Id`.
Hozir `appConfig.api.enabled = false` — so‘rov yuborilsa aniq `ApiNotConnectedError` chiqadi.

## Autentifikatsiya (`src/services/auth/`)

`AuthProvider` interfeysi: `signIn`, `register`, `signOut`, `getSession`.
Hozir `demoAuthProvider` — haqiqiy kirish yo‘q, faqat “demo ko‘rish rejimi”.
3-bosqichda `ServerAuthProvider` (login-parol, server sessiyasi/cookie) yoziladi va
`AuthProviderRoot` ga beriladi. Tashqi AI akkauntlariga bog‘liq kirish ishlatilmaydi.

## Keyingi bosqichlarda qayerga nima qo‘shiladi

| Bosqich | Joy |
|---|---|
| 2 — materiallar | `data/subject.ts` → `conceptIds`, yangi `services/materials.service.ts`, `TopicDetailPage` slotlari |
| 3 — auth | `services/auth/server-auth.provider.ts`, `DashboardLayout` darvozasi → `/kirish` ga yo‘naltirish |
| 4 — testlar | `modules/tests/engine/`, `Question`/`ErrorType` ma’lumotlari |
| 5, 8 — o‘yinlar | `modules/games/engines/<turi>/`, `GameDetailPage` dagi “O‘yin maydoni” |
| 6 — saqlash | Server + DB; `activities` endpointlari |
| 7 — analitika | `analytics.service.ts` → server hisob-kitoblari |
| 9 — markaziy | `federation/export` endpointi |

## Rus tili

`src/i18n/ru.ts` — `uz.ts` bilan bir xil kalitlar. `appConfig.i18n.availableLocales` ga
`'ru'` qo‘shilgach, til almashtirgich yoqiladi. Mavzu nomlari uchun `IN_sillabus_*_RU.docx` mavjud.
