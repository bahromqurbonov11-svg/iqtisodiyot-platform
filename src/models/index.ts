/**
 * MA’LUMOTLAR MODELI
 * --------------------------------------------------------------
 * Ierarxiya: Tashkilot → Fan → Qism → Mavzu → Tushuncha → Ko‘nikma
 *            → Savol → Javob varianti → Xato turi
 * Faoliyat:  Faoliyat (test / o‘yin / so‘rovnoma) → Urinish → Javob
 *
 * Markaziy ko‘p fanli platforma bilan moslik uchun barcha obyektlar
 * global identifikatorlarga ega: organization_id, subject_id, topic_id,
 * concept_id, learner_id, activity_id, attempt_id.
 * Server (keyingi bosqichlar) shu turlarni JSON sifatida qaytaradi.
 */

// ---------- Identifikatorlar ----------
export type OrganizationId = string;
export type SubjectId = string;
export type SubjectPartId = string;
export type TopicId = string;
export type ConceptId = string;
export type SkillId = string;
export type QuestionId = string;
export type OptionId = string;
export type ErrorTypeId = string;
export type LearnerId = string;
export type ActivityId = string;
export type AttemptId = string;

/** Ma’lumot manbasi: sillabusdan olingan haqiqiy ma’lumotmi yoki namunami */
export type DataOrigin = 'syllabus' | 'demo' | 'server' | 'repository';

export interface SourceRef {
  origin: DataOrigin;
  document?: string; // masalan: "IN sillabus 1.docx"
  note?: string;
}

// ---------- Fan tuzilmasi ----------
export interface Organization {
  id: OrganizationId;
  name: string;
}

export interface LearningOutcome {
  code: string; // TN1 ...
  kind: 'knowledge' | 'skill' | 'competence';
  text: string;
}

export interface SubjectPart {
  id: SubjectPartId;
  subjectId: SubjectId;
  order: number;
  title: string;
  credits: number;
  totalHours: number;
  lectureHours: number;
  practiceHours: number;
  selfStudyHours: number;
  goal: string;
  outcomes: LearningOutcome[];
  source: SourceRef;
}

export interface Subject {
  id: SubjectId;
  organizationId: OrganizationId;
  code: string;
  name: string;
  parts: SubjectPart[];
}

export interface Topic {
  id: TopicId; // masalan: "in1-t01"
  subjectId: SubjectId;
  partId: SubjectPartId;
  order: number; // qism ichidagi tartib (1..12 / 1..13)
  globalOrder: number; // 1..25
  title: string;
  subtopics: string[];
  lectureHours: number;
  practiceHours: number;
  references: number[]; // sillabusdagi adabiyot raqamlari
  conceptIds: ConceptId[]; // 2-bosqichda to‘ldiriladi
  source: SourceRef;
}

export interface Concept {
  id: ConceptId;
  topicId: TopicId;
  title: string;
  definition?: string;
  prerequisiteIds: ConceptId[]; // bilimlar bog‘liqligi grafigi uchun
}

export interface Skill {
  id: SkillId;
  conceptId: ConceptId;
  title: string;
  level: 'remember' | 'understand' | 'apply' | 'analyze';
}

// ---------- O‘quv materiallari ----------
export type MaterialCategoryId = 'slides'; // keyinchalik: 'lectures' | 'glossary' | 'cases' ...

/** Repozitoriydagi haqiqiy fayl (public/materials/<topicId>/<turkum>/) */
export interface MaterialFile {
  topicId: TopicId;
  category: MaterialCategoryId;
  fileName: string;
  title: string;
  ext: string; // pptx | ppt | ppsx | pdf
  lang: 'uz' | 'ru';
  size: number; // bayt
  path: string; // sayt ildiziga nisbatan manzil
  updatedAt: string; // ISO sana
}

// ---------- Diagnostik savollar ----------
export interface ErrorType {
  id: ErrorTypeId;
  conceptId: ConceptId;
  title: string; // masalan: "Talab hajmi va talabni chalkashtirish"
  description: string;
}

export interface AnswerOption {
  id: OptionId;
  text: string;
  isCorrect: boolean;
  /** Noto‘g‘ri variant qaysi tushuncha chalkashuvini ko‘rsatadi */
  errorTypeId?: ErrorTypeId;
}

export type QuestionType = 'single' | 'multiple' | 'numeric' | 'ordering' | 'matching';

export interface Question {
  id: QuestionId;
  topicId: TopicId;
  conceptIds: ConceptId[];
  skillIds: SkillId[];
  type: QuestionType;
  stem: string;
  options: AnswerOption[];
  difficulty: 1 | 2 | 3;
}

// ---------- Foydalanuvchilar ----------
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type UserRole = 'student' | 'admin';

export interface Learner {
  id: LearnerId;
  organizationId: OrganizationId;
  fullName: string;
  group: string;
  status: AccountStatus;
  registeredAt: string; // ISO sana
  lastActiveAt?: string;
}

// ---------- Faoliyat va urinishlar ----------
export type ActivityKind = 'diagnostic_test' | 'game' | 'survey';

export type GameType =
  | 'concept_matching'
  | 'logical_sequence'
  | 'compare_contrast'
  | 'situational_decision'
  | 'concept_map';

export interface Activity {
  id: ActivityId;
  subjectId: SubjectId;
  topicIds: TopicId[];
  kind: ActivityKind;
  gameType?: GameType;
  title: string;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface ResponseRecord {
  questionId: QuestionId;
  selectedOptionIds: OptionId[];
  isCorrect: boolean;
  errorTypeId?: ErrorTypeId;
  /** Talabaning o‘z javobiga ishonchi (1–5) */
  confidence?: 1 | 2 | 3 | 4 | 5;
  timeMs: number;
}

export interface Attempt {
  id: AttemptId;
  activityId: ActivityId;
  learnerId: LearnerId;
  startedAt: string;
  finishedAt?: string;
  status: AttemptStatus;
  responses: ResponseRecord[];
}

// ---------- Analitika ----------
/**
 * O‘zlashtirish darajasi. MUHIM: "insufficient_data" — talaba topshiriqni
 * bajarmagan yoki dalil yetarli emas. Bu holat hech qachon 0% deb hisoblanmaydi.
 */
export type MasteryLevel = 'mastered' | 'developing' | 'gap' | 'insufficient_data';

export interface MasteryEstimate {
  learnerId: LearnerId;
  topicId: TopicId;
  conceptId?: ConceptId;
  level: MasteryLevel;
  score?: number; // 0..1, faqat dalil yetarli bo‘lsa
  evidenceCount: number; // nechta javob asosida
}

/** Analitik xulosa: kuzatilgan dalil va taxminni aniq ajratadi */
export interface Insight {
  id: string;
  kind: 'observation' | 'hypothesis' | 'recommendation';
  text: string;
  evidence: string;
}

/** Servislar qaytaradigan javob: ma’lumot qayerdan kelgani doim ko‘rinadi */
export interface Sourced<T> {
  data: T;
  origin: DataOrigin;
}
