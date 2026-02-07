import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import DayPage from './pages/DayPage';
import CalendarPage from './pages/CalendarPage';
import RacePage from './pages/RacePage';
import StandingsPage from './pages/StandingsPage';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import ConstructorsPage from './pages/ConstructorsPage';
import ConstructorDetailPage from './pages/ConstructorDetailPage';
import NotFoundPage from './pages/NotFoundPage';

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/season/:year/day/:date" element={<DayPage />} />
          <Route path="/season/:year/calendar" element={<CalendarPage />} />
          <Route path="/season/:year/race/:round" element={<RacePage />} />
          <Route path="/season/:year/standings" element={<StandingsPage />} />
          <Route path="/season/:year/drivers" element={<DriversPage />} />
          <Route path="/season/:year/drivers/:driverRef" element={<DriverDetailPage />} />
          <Route path="/season/:year/constructors" element={<ConstructorsPage />} />
          <Route path="/season/:year/constructors/:constructorRef" element={<ConstructorDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
