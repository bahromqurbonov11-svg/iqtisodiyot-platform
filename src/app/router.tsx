
import { createHashRouter } from 'react-router-dom';
import { RouteErrorPage } from './RouteErrorPage';

import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { HomePage } from '@/modules/public/HomePage';
import { AboutPage } from '@/modules/public/AboutPage';
import { NotFoundPage } from '@/modules/public/NotFoundPage';





import { LoginPage } from '@/modules/auth/LoginPage';
import { RegisterPage } from '@/modules/auth/RegisterPage';
import { ResetPasswordPage } from '@/modules/auth/ResetPasswordPage';

import { CabinetOverviewPage } from '@/modules/student/CabinetOverviewPage';
import { CabinetResultsPage } from '@/modules/student/CabinetResultsPage';
import { CabinetProfilePage } from '@/modules/student/CabinetProfilePage';

import { AdminOverviewPage } from '@/modules/admin/AdminOverviewPage';
import { AdminLearnersPage } from '@/modules/admin/AdminLearnersPage';
import { AdminContentPage } from '@/modules/admin/AdminContentPage';
import { AdminIntegrationPage } from '@/modules/admin/AdminIntegrationPage';


/**
 * Platforma GitHub Pages orqali ishlaydi.
 * Shu sababli Hash Router ishlatiladi.
 *
 * Masalan:
 * /#/kirish
 * /#/parolni-tiklash
 * /#/kabinet
 * /#/admin
 */

export const router = createHashRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/fan-haqida',
        element: <AboutPage />,
      },
      {
        path: '/mavzular',
        lazy: async () => ({ Component: (await import('@/modules/catalog/TopicsPage')).TopicsPage }),
      },
      {
        path: '/mavzular/:topicId',
        lazy: async () => ({ Component: (await import('@/modules/catalog/TopicDetailPage')).TopicDetailPage }),
      },
      {
        path: '/materiallar',
        lazy: async () => ({ Component: (await import('@/modules/materials/MaterialsPage')).MaterialsPage }),
      },
      {
        path: '/testlar',
        lazy: async () => ({ Component: (await import('@/modules/tests/TestsPage')).TestsPage }),
      },
      {
        path: '/testlar/:testId',
        lazy: async () => ({ Component: (await import('@/modules/tests/TestDetailPage')).TestDetailPage }),
      },
      {
        path: '/oyinlar',
        lazy: async () => ({ Component: (await import('@/modules/games/GamesPage')).GamesPage }),
      },
      { path: '/simulyator', lazy: async () => ({ Component: (await import('@/modules/public/SimulatorPage')).SimulatorPage }) },
      { path: '/oyinlar/dars-rejimi', lazy: async () => ({ Component: (await import('@/modules/games/ClassroomPage')).ClassroomPage }) },
      { path: '/oyinlar/biznes-yolak', lazy: async () => ({ Component: (await import('@/modules/games/business/BusinessGame')).BusinessGamePage }) },
      { path: '/oyinlar/marraga-yugurish', lazy: async () => ({ Component: (await import('@/modules/games/RunnerPage')).RunnerPage }) },
      { path: '/oyinlar/mergan', lazy: async () => ({ Component: (await import('@/modules/games/InteractiveGames')).TargetGamePage }) },
      { path: '/oyinlar/grafikni-boshqar', lazy: async () => ({ Component: (await import('@/modules/games/GraphGame')).GraphGamePage }) },
      {
        path: '/oyinlar/:slug',
        lazy: async () => ({ Component: (await import('@/modules/games/GameDetailPage')).GameDetailPage }),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },

  // Kirish va ro'yxatdan o'tish
  {
    path: '/kirish',
    element: <LoginPage />,
  },
  {
    path: '/royxatdan-otish',
    element: <RegisterPage />,
  },

  // Parolni tiklash
  {
    path: '/parolni-tiklash',
    element: <ResetPasswordPage />,
  },

  // Talaba kabineti
  {
    path: '/kabinet',
    element: <DashboardLayout role="student" />,
    children: [
      {
        index: true,
        element: <CabinetOverviewPage />,
      },
      {
        path: 'natijalar',
        element: <CabinetResultsPage />,
      },
      {
        path: 'profil',
        element: <CabinetProfilePage />,
      },
    ],
  },

  // Administrator paneli
  {
    path: '/admin',
    element: <DashboardLayout role="admin" />,
    children: [
      {
        index: true,
        element: <AdminOverviewPage />,
      },
      {
        path: 'talabalar',
        element: <AdminLearnersPage />,
      },
      {
        path: 'kontent',
        element: <AdminContentPage />,
      },
      {
        path: 'analitika',
        element: <CabinetResultsPage admin />,
      },
      {
        path: 'integratsiya',
        element: <AdminIntegrationPage />,
      },
    ],
  },
]);
