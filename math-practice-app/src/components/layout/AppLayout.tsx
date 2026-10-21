import { Outlet } from 'react-router-dom';
import { StorageWarningBanner } from '../common/StorageWarningBanner';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { PageContainer } from './PageContainer';
import './AppLayout.css';

export function AppLayout() {
  return (
    <PageContainer>
      <Header />
      <Navigation />
      <main className="app-main">
        <StorageWarningBanner />
        <Outlet />
      </main>
    </PageContainer>
  );
}
