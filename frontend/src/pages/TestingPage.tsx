import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTestingSessions } from '@/api/testing';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function parseTime(timeStr: string): number {
  // Format: "1:34.669"
  const parts = timeStr.split(':');
  const minutes = parseInt(parts[0]);
  const seconds = parseFloat(parts[1]);
  return minutes * 60 + seconds;
}

function formatGap(gapSeconds: number): string {
  if (gapSeconds === 0) return '';
  return `+${gapSeconds.toFixed(3)}s`;
}

const TestingPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2026');
  const [activeDay, setActiveDay] = useState(0);

  const { data: testingDays, isLoading, error } = useQuery({
    queryKey: ['testing', seasonYear],
    queryFn: () => getTestingSessions(seasonYear),
    staleTime: Infinity,
  });

  const activeSession = testingDays?.[activeDay];

  useEffect(() => {
    if (activeSession) {
      const dateFormatted = new Date(activeSession.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      document.title = `${activeSession.name} — ${dateFormatted} | F1 Time Machine`;
    } else {
      document.title = `${seasonYear} Pre-Season Testing | F1 Time Machine`;
    }
  }, [seasonYear, activeSession]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !testingDays || testingDays.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ color: '#FFFFFF', textAlign: 'center' }}>
          No testing data available for {seasonYear}
        </div>
      </div>
    );
  }

  // Find overall fastest time across all days
  const overallFastest = (() => {
    let best: { time: string; driver: string; day: string } | null = null;
    let bestSeconds = Infinity;
    for (const day of testingDays) {
      for (const result of day.results) {
        if (result.time) {
          const seconds = parseTime(result.time);
          if (seconds < bestSeconds) {
            bestSeconds = seconds;
            best = { time: result.time, driver: result.driver_name, day: day.name };
          }
        }
      }
    }
    return best;
  })();

  const currentDay = testingDays[activeDay];

  // Find fastest time for the current day
  let fastestTimeSeconds = Infinity;
  currentDay.results.forEach(result => {
    if (result.time) {
      const seconds = parseTime(result.time);
      if (seconds < fastestTimeSeconds) {
        fastestTimeSeconds = seconds;
      }
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Back Link */}
      <Link
        to={`/${seasonYear}`}
        style={{
          display: 'inline-block',
          color: '#B0B0B0',
          fontSize: '14px',
          textDecoration: 'none',
          marginBottom: '24px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#E10600'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#B0B0B0'; }}
      >
        ← Back to {seasonYear} Season
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '42px', fontWeight: 700, margin: '0 0 8px 0' }}>
          Pre-Season Testing {seasonYear}
        </h1>
        <p style={{ color: '#B0B0B0', fontSize: '18px', margin: 0 }}>
          Bahrain International Circuit
        </p>
      </div>

      {/* Overall Fastest Time Banner */}
      {overallFastest && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #E10600',
          borderRadius: '8px',
          padding: '24px 32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ color: '#B0B0B0', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Overall Fastest Time
            </div>
            <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>
              {overallFastest.driver} — {overallFastest.day}
            </div>
          </div>
          <div style={{
            color: '#E10600',
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}>
            {overallFastest.time}
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #2A2A3E',
      }}>
        {testingDays.map((day, index) => (
          <button
            key={day.session_id}
            onClick={() => setActiveDay(index)}
            style={{
              backgroundColor: activeDay === index ? '#1A1A2E' : 'transparent',
              border: 'none',
              borderBottom: activeDay === index ? '2px solid #E10600' : '2px solid transparent',
              color: activeDay === index ? '#E10600' : '#B0B0B0',
              padding: '16px 24px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseEnter={e => {
              if (activeDay !== index) {
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={e => {
              if (activeDay !== index) {
                e.currentTarget.style.color = '#B0B0B0';
              }
            }}
          >
            <div>{day.name}</div>
            <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 400 }}>
              {formatDate(day.date)}
            </div>
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
      }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 24px 0' }}>
          {currentDay.name} Results
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3E' }}>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '12px 16px',
                  width: '60px',
                }}>
                  Pos
                </th>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '12px 16px',
                }}>
                  Driver
                </th>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '12px 16px',
                }}>
                  Team
                </th>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '12px 16px',
                  width: '140px',
                }}>
                  Time
                </th>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '12px 16px',
                  width: '100px',
                }}>
                  Gap
                </th>
                <th style={{
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'right',
                  padding: '12px 16px',
                  width: '80px',
                }}>
                  Laps
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDay.results.map((result, index) => {
                const gap = result.time && fastestTimeSeconds !== Infinity
                  ? parseTime(result.time) - fastestTimeSeconds
                  : null;

                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < currentDay.results.length - 1 ? '1px solid #2A2A3E' : 'none',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0F0F0F'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: result.position === 1 ? '#E10600' : '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: 600,
                      }}>
                        {result.position}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 500 }}>
                        {result.driver_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {result.color_primary && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: result.color_primary,
                          }} />
                        )}
                        <span style={{ color: '#FFFFFF', fontSize: '15px' }}>
                          {result.constructor_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {result.time ? (
                        <span style={{
                          color: '#FFFFFF',
                          fontSize: '15px',
                          fontWeight: 500,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        }}>
                          {result.time}
                        </span>
                      ) : (
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          No Time
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {gap !== null && gap > 0 ? (
                        <span style={{
                          color: '#B0B0B0',
                          fontSize: '14px',
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        }}>
                          {formatGap(gap)}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {result.laps !== null ? (
                        <span style={{ color: '#FFFFFF', fontSize: '15px' }}>
                          {result.laps}
                        </span>
                      ) : (
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestingPage;
