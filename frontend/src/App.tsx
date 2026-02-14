import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import DayPage from './pages/DayPage';
import CalendarPage from './pages/CalendarPage';
import RacePage from './pages/RacePage';
import RacesPage from './pages/RacesPage';
import StandingsPage from './pages/StandingsPage';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import ConstructorsPage from './pages/ConstructorsPage';
import ConstructorDetailPage from './pages/ConstructorDetailPage';
import HeadToHeadPage from './pages/HeadToHeadPage';
import SeasonPreviewPage from './pages/SeasonPreviewPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import CookieBanner from './components/common/CookieBanner';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0F0F0F',
    }}>
      <Header />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;
