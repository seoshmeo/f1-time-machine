import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getConstructorDetail } from '../api/constructors';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CountryFlag from '../components/common/CountryFlag';
import { getConstructorColor } from '../utils/f1Colors';

const ConstructorDetailPage = () => {
  const { year, constructorRef } = useParams<{ year: string; constructorRef: string }>();
  const seasonYear = parseInt(year || '2010');

  const { data: constructor, isLoading, error } = useQuery({
    queryKey: ['constructor', constructorRef, seasonYear],
    queryFn: () => getConstructorDetail(constructorRef!, seasonYear),
    enabled: !!constructorRef,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !constructor) {
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
            Constructor Not Found
          </h2>
          <Link
            to={`/season/${seasonYear}/constructors`}
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
            Back to Constructors
          </Link>
        </div>
      </div>
    );
  }

  const stats = constructor.season_stats;
  const teamColor = constructor.color_primary || getConstructorColor(constructor.constructor_ref);

  const getPodiumColor = (position: number | null) => {
    if (!position) return 'transparent';
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return 'transparent';
    }
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <Link
        to={`/season/${seasonYear}/constructors`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#B0B0B0',
          textDecoration: 'none',
          fontSize: '14px',
          marginBottom: '24px',
        }}
      >
        ← Back to Constructors
      </Link>

      {/* Header */}
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '48px',
        marginBottom: '32px',
        borderLeft: `6px solid ${teamColor}`,
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '40px',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}>
          {constructor.name}
        </h1>
        {constructor.full_name && constructor.full_name !== constructor.name && (
          <p style={{ color: '#B0B0B0', fontSize: '16px', margin: '0 0 12px 0' }}>
            {constructor.full_name}
          </p>
        )}
        <CountryFlag country={constructor.nationality} />
      </div>

      {/* Technical Specs */}
      {stats && (stats.chassis || stats.engine) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {stats.chassis && (
            <div style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '8px',
              padding: '24px',
            }}>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Chassis
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700 }}>
                {stats.chassis}
              </div>
            </div>
          )}
          {stats.engine && (
            <div style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '8px',
              padding: '24px',
            }}>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Engine
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700 }}>
                {stats.engine}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Season Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Championship', value: stats.final_position ? `P${stats.final_position}` : '-' },
            { label: 'Points', value: stats.points },
            { label: 'Wins', value: stats.wins },
            { label: 'Podiums', value: stats.podiums },
            { label: 'Poles', value: stats.poles },
            { label: 'Fastest Laps', value: stats.fastest_laps },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{
                color: teamColor,
                fontSize: '36px',
                fontWeight: 700,
                marginBottom: '8px',
              }}>
                {stat.value}
              </div>
              <div style={{
                color: '#B0B0B0',
                fontSize: '14px',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drivers */}
      {stats && stats.drivers.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
            Drivers
          </h2>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {stats.drivers.map((driver) => (
              <Link
                key={driver.driver_ref}
                to={`/season/${seasonYear}/drivers/${driver.driver_ref}`}
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#0F0F0F',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  padding: '20px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = teamColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A3E';
                }}
              >
                {driver.car_number && (
                  <span style={{ color: '#2A2A3E', fontSize: '32px', fontWeight: 700 }}>
                    {driver.car_number}
                  </span>
                )}
                <div>
                  <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>
                    {driver.first_name} {driver.last_name}
                  </div>
                  {driver.code && (
                    <div style={{ color: teamColor, fontSize: '14px', fontWeight: 600 }}>
                      {driver.code}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Race Results */}
      {stats && stats.race_results.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
            Race Results
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                  <th style={{ color: '#666', fontSize: '12px', fontWeight: 600, textAlign: 'center', padding: '12px 8px', textTransform: 'uppercase' }}>
                    Rd
                  </th>
                  <th style={{ color: '#666', fontSize: '12px', fontWeight: 600, textAlign: 'left', padding: '12px 8px', textTransform: 'uppercase' }}>
                    Race
                  </th>
                  {stats.drivers.map((d) => (
                    <th key={d.driver_ref} style={{ color: '#666', fontSize: '12px', fontWeight: 600, textAlign: 'center', padding: '12px 8px', textTransform: 'uppercase' }}>
                      {d.code || d.last_name.substring(0, 3).toUpperCase()}
                    </th>
                  ))}
                  <th style={{ color: '#666', fontSize: '12px', fontWeight: 600, textAlign: 'center', padding: '12px 8px', textTransform: 'uppercase' }}>
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.race_results.map((race) => {
                  const totalPts = race.driver_results.reduce((sum, dr) => sum + dr.points, 0);
                  return (
                    <tr key={race.round} style={{ borderBottom: '1px solid #2A2A3E' }}>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <span style={{ color: '#B0B0B0', fontSize: '14px', fontWeight: 600 }}>
                          {race.round}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <Link
                          to={`/season/${seasonYear}/race/${race.round}`}
                          style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = teamColor; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                        >
                          {race.race_name}
                        </Link>
                      </td>
                      {stats.drivers.map((d) => {
                        const dr = race.driver_results.find((r) => r.driver_code === d.code);
                        const pos = dr?.position;
                        return (
                          <td key={d.driver_ref} style={{ padding: '14px 8px', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              {pos && pos <= 3 && (
                                <div style={{
                                  width: '3px',
                                  height: '16px',
                                  backgroundColor: getPodiumColor(pos),
                                  borderRadius: '1px',
                                }} />
                              )}
                              <span style={{
                                color: pos ? (pos <= 3 ? '#FFFFFF' : '#B0B0B0') : '#666',
                                fontSize: '14px',
                                fontWeight: pos && pos <= 3 ? 700 : 400,
                              }}>
                                {pos || 'DNF'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <span style={{
                          color: totalPts > 0 ? teamColor : '#666',
                          fontSize: '14px',
                          fontWeight: totalPts > 0 ? 700 : 400,
                        }}>
                          {totalPts}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructorDetailPage;
