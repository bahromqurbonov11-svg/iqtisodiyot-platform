
import { createHashRouter } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { HomePage } from '@/modules/public/HomePage';
import { AboutPage } from '@/modules/public/AboutPage';
import { NotFoundPage } from '@/modules/public/NotFoundPage';

import { TopicsPage } from '@/modules/catalog/TopicsPage';
import { TopicDetailPage } from '@/modules/catalog/TopicDetailPage';

import { MaterialsPage } from '@/modules/materials/MaterialsPage';

import { TestsPage } from '@/modules/tests/TestsPage';
import { TestDetailPage } from '@/modules/tests/TestDetailPage';

import { GamesPage } from '@/modules/games/GamesPage';
import { GameDetailPage } from '@/modules/games/GameDetailPage';

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
        element: <TopicsPage />,
      },
      {
        path: '/mavzular/:topicId',
        element: <TopicDetailPage />,
      },
      {
        path: '/materiallar',
        element: <MaterialsPage />,
      },
      {
        path: '/testlar',
        element: <TestsPage />,
      },
      {
        path: '/testlar/:testId',
        element: <TestDetailPage />,
      },
      {
        path: '/oyinlar',
        element: <GamesPage />,
      },
      {
        path: '/oyinlar/:slug',
        element: <GameDetailPage />,
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
