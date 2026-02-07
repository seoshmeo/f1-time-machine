import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { driversApi } from '../api/drivers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TeamBadge from '../components/common/TeamBadge';
import CountryFlag from '../components/common/CountryFlag';

const DriverDetailPage = () => {
  const { year, driverRef } = useParams<{ year: string; driverRef: string }>();
  const seasonYear = parseInt(year || '2010');

  const { data: driver, isLoading: isLoadingDriver, error } = useQuery({
    queryKey: ['driver', seasonYear, driverRef],
    queryFn: () => driversApi.getDriverDetails(seasonYear, driverRef!),
    enabled: !!driverRef,
  });

  const { data: raceResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['driverRaceResults', driverRef, seasonYear],
    queryFn: () => driversApi.getDriverRaceResults(driverRef!, seasonYear),
    enabled: !!driverRef,
  });

  const isLoading = isLoadingDriver || isLoadingResults;

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

  const getPodiumColor = (position: number | null) => {
    if (!position) return 'transparent';
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return 'transparent';
    }
  };

  const isDNF = (status: string | null) => {
    if (!status) return false;
    const dnfStatuses = ['Accident', 'Collision', 'Engine', 'Gearbox', 'Transmission', 'Clutch', 'Hydraulics', 'Electrical', 'Retired', 'Spun off', 'Fuel pressure', 'Fuel pump', 'Suspension', 'Brakes', 'Differential', 'Overheating', 'Mechanical', 'Tyre', 'Puncture', 'Wheel', 'Water pressure', 'Oil pressure', 'Withdrew', 'Fatal accident', 'Did not qualify', 'Did not prequalify'];
    return dnfStatuses.some(dnf => status.includes(dnf));
  };

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

              {driver.season_stats?.constructor_name && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Team:</span>
                  <TeamBadge
                    constructorRef={driver.season_stats.constructor_ref}
                    constructorName={driver.season_stats.constructor_name}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
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

      {raceResults && raceResults.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            Race Results
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Round</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Race</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Grid</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Finish</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Points</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'right',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>FL</th>
                  <th style={{
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '12px 8px',
                    textTransform: 'uppercase',
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {raceResults.map((result) => (
                  <tr
                    key={result.round}
                    style={{
                      borderBottom: '1px solid #2A2A3E',
                      backgroundColor: result.position && result.position <= 3 ? `${getPodiumColor(result.position)}10` : 'transparent',
                    }}
                  >
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <span style={{
                        color: '#B0B0B0',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}>
                        {result.round}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <Link
                        to={`/season/${seasonYear}/race/${result.round}`}
                        style={{
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#E10600';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                      >
                        {result.race_name}
                      </Link>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <span style={{
                        color: '#B0B0B0',
                        fontSize: '14px',
                      }}>
                        {result.qualifying_position || result.grid_position || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}>
                        {result.position && result.position <= 3 && (
                          <div style={{
                            width: '4px',
                            height: '20px',
                            backgroundColor: getPodiumColor(result.position),
                            borderRadius: '2px',
                          }} />
                        )}
                        <span style={{
                          color: isDNF(result.status) ? '#E10600' : '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: result.position && result.position <= 3 ? 700 : 600,
                        }}>
                          {result.position_text || '-'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <span style={{
                        color: result.points > 0 ? '#E10600' : '#666',
                        fontSize: '14px',
                        fontWeight: result.points > 0 ? 700 : 400,
                      }}>
                        {result.points}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <span style={{
                        color: result.fastest_lap_rank === 1 ? '#E10600' : '#B0B0B0',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        fontWeight: result.fastest_lap_rank === 1 ? 600 : 400,
                      }}>
                        {result.fastest_lap_time || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{
                        color: isDNF(result.status) ? '#E10600' : result.status === 'Finished' ? '#4CAF50' : '#666',
                        fontSize: '13px',
                      }}>
                        {result.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetailPage;
