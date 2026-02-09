import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useRaces } from '../hooks/useRace';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CountryFlag from '../components/common/CountryFlag';
import { formatDateLong } from '../utils/dateUtils';

const RacesPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2010');

  useEffect(() => {
    document.title = `${seasonYear} F1 Season Races | F1 Time Machine`;
  }, [seasonYear]);

  const { data: races, isLoading, error } = useRaces(seasonYear);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !races) {
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
            Races Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load races for {seasonYear}
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
      <h1 style={{
        color: '#FFFFFF',
        fontSize: '32px',
        fontWeight: 700,
        margin: '0 0 16px 0',
      }}>
        {seasonYear} Race Calendar
      </h1>
      <p style={{
        color: '#B0B0B0',
        fontSize: '16px',
        margin: '0 0 32px 0',
      }}>
        {races.length} races in the {seasonYear} season
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {races.map((race) => (
          <Link
            key={race.round}
            to={`/season/${seasonYear}/race/${race.round}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid #2A2A3E',
                borderRadius: '8px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E10600';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3E';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                width: '44px',
                height: '44px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {race.round}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 4px 0',
                }}>
                  {race.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  {race.circuit_country && (
                    <CountryFlag country={race.circuit_country} />
                  )}
                  <span style={{ color: '#B0B0B0', fontSize: '14px' }}>
                    {race.circuit_name}
                  </span>
                  <span style={{ color: '#666', fontSize: '13px' }}>
                    {formatDateLong(race.date)}
                  </span>
                </div>
              </div>

              {race.winner_name && (
                <div style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Winner
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
                    {race.winner_name}
                  </div>
                </div>
              )}

              {race.pole_name && (
                <div style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Pole
                  </div>
                  <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
                    {race.pole_name}
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RacesPage;
