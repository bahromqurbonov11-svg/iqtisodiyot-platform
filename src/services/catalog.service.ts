import type { Sourced, Subject, Topic } from '@/models';
import { subject, topics } from '@/data/subject';

/**
 * Fan katalogi servisi.
 * Hozir ma’lumot mahalliy fayldan (sillabus) olinadi. Server tayyor bo‘lganda
 * faqat shu funksiyalar ichi apiRequest(...) bilan almashtiriladi —
 * sahifalar o‘zgarmaydi.
 */
export const catalogService = {
  getSubject(): Sourced<Subject> {
    return { data: subject, origin: 'syllabus' };
  },
  getTopics(partId?: string): Sourced<Topic[]> {
    return { data: partId ? topics.filter((t) => t.partId === partId) : topics, origin: 'syllabus' };
  },
  getTopic(topicId: string): Topic | undefined {
    return topics.find((t) => t.id === topicId);
  },
  getAdjacent(topicId: string): { prev?: Topic; next?: Topic } {
    const i = topics.findIndex((t) => t.id === topicId);
    return { prev: topics[i - 1], next: topics[i + 1] };
  },
};
