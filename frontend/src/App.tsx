import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import CookieBanner from './components/common/CookieBanner';
import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const DayPage = lazy(() => import('./pages/DayPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const RacePage = lazy(() => import('./pages/RacePage'));
const RacesPage = lazy(() => import('./pages/RacesPage'));
const StandingsPage = lazy(() => import('./pages/StandingsPage'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const DriverDetailPage = lazy(() => import('./pages/DriverDetailPage'));
const ConstructorsPage = lazy(() => import('./pages/ConstructorsPage'));
const ConstructorDetailPage = lazy(() => import('./pages/ConstructorDetailPage'));
const HeadToHeadPage = lazy(() => import('./pages/HeadToHeadPage'));
const SeasonPreviewPage = lazy(() => import('./pages/SeasonPreviewPage'));
const TestingPage = lazy(() => import('./pages/TestingPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg, #0F0F0F)',
    }}>
      <Header />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/:year" element={<SeasonPreviewPage />} />
          <Route path="/season/:year/day/:date" element={<DayPage />} />
          <Route path="/season/:year/calendar" element={<CalendarPage />} />
          <Route path="/season/:year/races" element={<RacesPage />} />
          <Route path="/season/:year/race/:round" element={<RacePage />} />
          <Route path="/season/:year/standings" element={<StandingsPage />} />
          <Route path="/season/:year/head-to-head" element={<HeadToHeadPage />} />
          <Route path="/season/:year/drivers" element={<DriversPage />} />
          <Route path="/season/:year/drivers/:driverRef" element={<DriverDetailPage />} />
          <Route path="/season/:year/constructors" element={<ConstructorsPage />} />
          <Route path="/season/:year/constructors/:constructorRef" element={<ConstructorDetailPage />} />
          <Route path="/season/:year/testing" element={<TestingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;
