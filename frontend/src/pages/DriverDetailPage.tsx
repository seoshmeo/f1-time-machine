import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { driversApi } from '../api/drivers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TeamBadge from '../components/common/TeamBadge';
import CountryFlag from '../components/common/CountryFlag';

const DriverDetailPage = () => {
  const { year, driverRef } = useParams<{ year: string; driverRef: string }>();
  const seasonYear = parseInt(year || '2010');

  const { data: driver, isLoading, error } = useQuery({
    queryKey: ['driver', seasonYear, driverRef],
    queryFn: () => driversApi.getDriverDetails(seasonYear, driverRef!),
    enabled: !!driverRef,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !driver) {
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
            Driver Not Found
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '24px' }}>
            Unable to load driver details
          </p>
          <Link
            to={`/season/${seasonYear}/drivers`}
            style={{
              display: 'inline-block',
              backgroundColor: '#E10600',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Back to Drivers
          </Link>
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
      <Link
        to={`/season/${seasonYear}/drivers`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#B0B0B0',
          textDecoration: 'none',
          fontSize: '14px',
          marginBottom: '24px',
        }}
      >
        ← Back to Drivers
      </Link>

      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '48px',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          {driver.number && (
            <div style={{
              fontSize: '120px',
              fontWeight: 700,
              color: '#2A2A3E',
              lineHeight: 1,
            }}>
              {driver.number}
            </div>
          )}

          <div style={{
            flex: 1,
            minWidth: '300px',
          }}>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: '40px',
              fontWeight: 700,
              margin: '0 0 16px 0',
            }}>
              {driver.first_name} {driver.last_name}
            </h1>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {driver.code && (
                <div style={{
                  color: '#E10600',
                  fontSize: '18px',
                  fontWeight: 700,
                }}>
                  {driver.code}
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Nationality:</span>
                <CountryFlag country={driver.nationality} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
      }}>
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#E10600',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {driver.season_stats?.races || 0}
          </div>
          <div style={{
            color: '#B0B0B0',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}>
            Races
          </div>
        </div>

        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#E10600',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {driver.season_stats?.wins || 0}
          </div>
          <div style={{
            color: '#B0B0B0',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}>
            Wins
          </div>
        </div>

        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#E10600',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {driver.season_stats?.podiums || 0}
          </div>
          <div style={{
            color: '#B0B0B0',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}>
            Podiums
          </div>
        </div>

        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#E10600',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {driver.season_stats?.points || 0}
          </div>
          <div style={{
            color: '#B0B0B0',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}>
            Points
          </div>
        </div>

        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#E10600',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {driver.season_stats?.final_position || '-'}
          </div>
          <div style={{
            color: '#B0B0B0',
            fontSize: '14px',
            textTransform: 'uppercase',
          }}>
            Championship Position
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailPage;
