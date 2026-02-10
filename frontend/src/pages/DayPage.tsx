import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { useDay, useDayNavigation } from '../hooks/useDay';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useStandings } from '../hooks/useStandings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DayNavigation from '../components/day/DayNavigation';
import EventList from '../components/day/EventList';
import DayCard from '../components/day/DayCard';
import DayTimeline from '../components/day/DayTimeline';
import ArticleCard from '../components/article/ArticleCard';
import QuoteCard from '../components/article/QuoteCard';
import Sidebar from '../components/layout/Sidebar';
import DriverStandingsTable from '../components/standings/DriverStandingsTable';

const DayPage = () => {
  const { year, date } = useParams<{ year: string; date: string }>();
  const navigate = useNavigate();
  const seasonYear = parseInt(year || '2026');
  const currentDate = date || '';

  const { data: seasonData } = useQuery({
    queryKey: ['season', seasonYear],
    queryFn: () => apiGet<{ total_races: number }>(`/seasons/${seasonYear}`),
    staleTime: Infinity,
  });

  const { data: dayData, isLoading, error } = useDay(seasonYear, currentDate);
  const { data: navData } = useDayNavigation(seasonYear, currentDate);
  const { data: standingsData } = useStandings(seasonYear, seasonData?.total_races || 1);

  useEffect(() => {
    if (currentDate) {
      const formatted = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      document.title = `${formatted} - ${seasonYear} F1 Season Day by Day | F1 Time Machine`;
    }
  }, [currentDate, seasonYear]);

  const handlePrevDay = () => {
    if (navData?.prev_date) {
      navigate(`/season/${seasonYear}/day/${navData.prev_date}`);
    }
  };

  const handleNextDay = () => {
    if (navData?.next_date) {
      navigate(`/season/${seasonYear}/day/${navData.next_date}`);
    }
  };

  useKeyboardNav({
    onPrevious: handlePrevDay,
    onNext: handleNextDay,
    enabled: !isLoading && !!dayData && !!navData,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dayData) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#E10600', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Day Not Found
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load data for this day
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {dayData.season_progress && (
        <DayTimeline
          currentDay={dayData.season_progress.days_elapsed || 1}
          totalDays={dayData.season_progress.total_days || 365}
        />
      )}

      <DayNavigation
        currentDate={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        canGoPrev={!!navData?.prev_date}
        canGoNext={!!navData?.next_date}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '24px',
      }}>
        <div>
          <DayCard title="Events">
            <EventList events={dayData.events} />
          </DayCard>

          {dayData.articles && dayData.articles.length > 0 && (
            <DayCard title="News & Articles">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {dayData.articles.map((article, index) => (
                  <ArticleCard key={index} article={article} />
                ))}
              </div>
            </DayCard>
          )}

          {dayData.quotes && dayData.quotes.length > 0 && (
            <DayCard title="Quotes">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {dayData.quotes.map((quote, index) => (
                  <QuoteCard
                    key={index}
                    quote={quote.quote_text}
                    author={quote.speaker}
                    context={quote.context}
                  />
                ))}
              </div>
            </DayCard>
          )}
        </div>

        <Sidebar>
          {standingsData?.driver_standings && (
            <DayCard title="Driver Standings">
              <DriverStandingsTable standings={standingsData.driver_standings.slice(0, 10)} />
            </DayCard>
          )}
        </Sidebar>
      </div>
    </div>
  );
};

export default DayPage;
