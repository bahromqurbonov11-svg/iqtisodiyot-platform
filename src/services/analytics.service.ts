import type { Sourced } from '@/models';
import * as demo from '@/data/demo/analytics';
import { demoLearners, demoGroups } from '@/data/demo/learners';

/**
 * Analitika va talabalar servisi.
 * HOZIR: barcha javoblar origin: 'demo'. Interfeys bu belgini ko‘rib,
 * "DEMO" yorlig‘ini avtomatik chiqaradi.
 * 7-bosqichda: apiRequest('GET', endpoints.analytics...) bilan almashtiriladi.
 */
const D = <T,>(data: T): Sourced<T> => ({ data, origin: 'demo' });

export const analyticsService = {
  groups: () => D(demoGroups),
  groupTopicMastery: () => D(demo.groupTopicMastery),
  conceptErrors: () => D(demo.conceptErrors),
  misconceptions: () => D(demo.misconceptions),
  weeklyTrend: () => D(demo.weeklyTrend),
  calibration: () => D({ levels: demo.calibration, quadrants: demo.calibrationQuadrants }),
  prerequisiteLinks: () => D(demo.prerequisiteLinks),
  insights: () => D(demo.insights),
  learnerRows: () => D(demo.learnerRows),
  currentLearnerTopics: () => D(demo.currentLearnerTopics),
  levelOf: demo.levelOf,
};

export const learnersService = {
  list: () => D(demoLearners),
};
