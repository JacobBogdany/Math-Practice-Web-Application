import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

const PracticeSetupPage = lazy(() =>
  import('../pages/PracticeSetupPage').then((module) => ({
    default: module.PracticeSetupPage,
  })),
);

const PracticePage = lazy(() =>
  import('../pages/PracticePage').then((module) => ({
    default: module.PracticePage,
  })),
);

const SessionSummaryPage = lazy(() =>
  import('../pages/SessionSummaryPage').then((module) => ({
    default: module.SessionSummaryPage,
  })),
);

const StatisticsPage = lazy(() =>
  import('../pages/StatisticsPage').then((module) => ({
    default: module.StatisticsPage,
  })),
);

const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="practice/setup" element={<PracticeSetupPage />} />
          <Route path="practice/session" element={<PracticePage />} />
          <Route path="practice/summary" element={<SessionSummaryPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
