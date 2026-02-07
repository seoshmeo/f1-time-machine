import { DriverStanding } from '../../types';
import TeamBadge from '../common/TeamBadge';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable = ({ standings }: DriverStandingsTableProps) => {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return 'transparent';
    }
  };

  return (
    <div style={{
      overflowX: 'auto',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}>
        <thead>
          <tr style={{
            borderBottom: '2px solid #2A2A3E',
          }}>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Pos</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Driver</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Team</th>
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
              textAlign: 'center',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Wins</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr
              key={standing.position}
              style={{
                borderBottom: '1px solid #2A2A3E',
                backgroundColor: standing.position <= 3 ? `${getMedalColor(standing.position)}10` : 'transparent',
              }}
            >
              <td style={{
                padding: '16px 8px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {standing.position <= 3 && (
                    <div style={{
                      width: '4px',
                      height: '24px',
                      backgroundColor: getMedalColor(standing.position),
                      borderRadius: '2px',
                    }} />
                  )}
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}>
                    {standing.position}
                  </span>
                </div>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {standing.driver.first_name} {standing.driver.last_name}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <TeamBadge
                  constructorRef={standing.driver.driver_ref}
                  constructorName={standing.constructor_name}
                />
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'center',
              }}>
                <span style={{
                  color: '#E10600',
                  fontSize: '18px',
                  fontWeight: 700,
                }}>
                  {standing.points}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'center',
              }}>
                <span style={{
                  color: '#B0B0B0',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {standing.wins}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverStandingsTable;
