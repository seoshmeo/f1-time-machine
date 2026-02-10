import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { driversApi } from '../api/drivers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TeamBadge from '../components/common/TeamBadge';
import CountryFlag from '../components/common/CountryFlag';

const DriversPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2026');

  useEffect(() => {
    document.title = `${seasonYear} F1 Season Drivers | F1 Time Machine`;
  }, [seasonYear]);

  const { data: drivers, isLoading, error } = useQuery({
    queryKey: ['drivers', seasonYear],
    queryFn: () => driversApi.getSeasonDrivers(seasonYear),
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !drivers) {
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
            Drivers Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load drivers for {seasonYear}
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
        {seasonYear} Drivers
      </h1>
      <p style={{
        color: '#B0B0B0',
        fontSize: '16px',
        margin: '0 0 32px 0',
      }}>
        {drivers.length} drivers competed in the {seasonYear} season
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
      }}>
        {drivers.map((driver) => (
          <Link
            key={driver.driver_ref}
            to={`/season/${seasonYear}/drivers/${driver.driver_ref}`}
            style={{
              textDecoration: 'none',
            }}
          >
            <div style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '8px',
              padding: '24px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E10600';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A3E';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              {driver.number && (
                <div style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#2A2A3E',
                  lineHeight: 1,
                }}>
                  {driver.number}
                </div>
              )}

              <h3 style={{
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
              }}>
                {driver.first_name} {driver.last_name}
              </h3>

              {driver.code && (
                <div style={{
                  color: '#B0B0B0',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {driver.code}
                </div>
              )}

              <CountryFlag country={driver.nationality} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DriversPage;
