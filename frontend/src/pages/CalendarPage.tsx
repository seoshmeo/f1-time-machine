import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSeasonCalendar } from '../hooks/useSeasonCalendar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SeasonCalendar from '../components/calendar/SeasonCalendar';

const CalendarPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2010');

  useEffect(() => {
    document.title = `${seasonYear} F1 Season Calendar - Day by Day | F1 Time Machine`;
  }, [seasonYear]);

  const { data: calendarData, isLoading, error } = useSeasonCalendar(seasonYear);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !calendarData) {
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
            Calendar Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load calendar for {seasonYear}
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
      <div style={{
        marginBottom: '32px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: 700,
          margin: '0 0 16px 0',
        }}>
          {seasonYear} Season Calendar
        </h1>
        <p style={{
          color: '#B0B0B0',
          fontSize: '16px',
          margin: '0 0 24px 0',
        }}>
          Navigate through the season day by day
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#E10600',
              borderRadius: '4px',
            }} />
            <span style={{ color: '#B0B0B0', fontSize: '14px' }}>Race Day</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#FF8C00',
              borderRadius: '4px',
            }} />
            <span style={{ color: '#B0B0B0', fontSize: '14px' }}>Qualifying</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#FFD700',
              borderRadius: '4px',
            }} />
            <span style={{ color: '#B0B0B0', fontSize: '14px' }}>Practice</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4A90E2',
              borderRadius: '4px',
            }} />
            <span style={{ color: '#B0B0B0', fontSize: '14px' }}>Testing</span>
          </div>
        </div>
      </div>

      <SeasonCalendar year={seasonYear} monthsData={calendarData.months} />
    </div>
  );
};

export default CalendarPage;
