/**
 * REJALASHTIRILGAN API ENDPOINTLARI (v1)
 * Bu — server bilan kelishuv (kontrakt). Server yozilganda shu ro‘yxatga amal qilinadi.
 * Markaziy analitika platformasi ham aynan shu identifikatorlar bilan ishlaydi.
 */
export const endpoints = {
  // Autentifikatsiya (3-bosqich)
  auth: {
    register: '/auth/register', // POST → akkaunt "pending" holatida yaratiladi
    login: '/auth/login', // POST
    logout: '/auth/logout', // POST
    me: '/auth/me', // GET
  },
  // Fan tuzilmasi (2-bosqich)
  catalog: {
    subject: (subjectId: string) => `/subjects/${subjectId}`,
    topics: (subjectId: string) => `/subjects/${subjectId}/topics`,
    topic: (topicId: string) => `/topics/${topicId}`,
    concepts: (topicId: string) => `/topics/${topicId}/concepts`,
    materials: (topicId: string) => `/topics/${topicId}/materials`,
  },
  // Faoliyatlar va urinishlar (4–6-bosqich)
  activities: {
    list: (subjectId: string) => `/subjects/${subjectId}/activities`,
    startAttempt: (activityId: string) => `/activities/${activityId}/attempts`, // POST
    saveResponse: (attemptId: string) => `/attempts/${attemptId}/responses`, // POST
    finishAttempt: (attemptId: string) => `/attempts/${attemptId}/finish`, // POST
  },
  // Administrator (3-bosqich)
  admin: {
    learners: '/admin/learners',
    setStatus: (learnerId: string) => `/admin/learners/${learnerId}/status`, // PATCH {status}
  },
  // Analitika (7-bosqich)
  analytics: {
    learner: (learnerId: string) => `/analytics/learners/${learnerId}`,
    group: (group: string) => `/analytics/groups/${group}`,
    topics: (subjectId: string) => `/analytics/subjects/${subjectId}/topics`,
    concepts: (subjectId: string) => `/analytics/subjects/${subjectId}/concepts`,
  },
  // Markaziy platforma uchun eksport (9-bosqich)
  federation: {
    export: '/federation/export', // GET — organization_id, subject_id, learner_id, attempt_id ...
  },
} as const;
