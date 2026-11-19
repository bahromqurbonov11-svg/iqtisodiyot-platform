/**
 * Barcha sahifa manzillari bitta joyda.
 * Manzilni o‘zgartirish kerak bo‘lsa — faqat shu faylni tahrirlang.
 */
export const paths = {
  home: '/',
  about: '/fan-haqida',
  topics: '/mavzular',
  topic: (id: string) => `/mavzular/${id}`,
  materials: '/materiallar',
  tests: '/testlar',
  test: (id: string) => `/testlar/${id}`,
  games: '/oyinlar',
  simulator: '/simulyator',
  game: (slug: string) => `/oyinlar/${slug}`,
  login: '/kirish',
  register: '/royxatdan-otish',

  cabinet: '/kabinet',
  cabinetResults: '/kabinet/natijalar',
  cabinetProfile: '/kabinet/profil',

  admin: '/admin',
  adminLearners: '/admin/talabalar',
  adminContent: '/admin/kontent',
  adminIntegration: '/admin/integratsiya',
  analytics: '/admin/analitika',
} as const;
