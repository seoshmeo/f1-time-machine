import { RaceResult } from '../../types';
import TeamBadge from '../common/TeamBadge';
import { formatTime } from '../../utils/formatTime';

interface ResultsTableProps {
  results: RaceResult[];
}

const ResultsTable = ({ results }: ResultsTableProps) => {
  const getPodiumColor = (position: number) => {
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
              textAlign: 'right',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Time</th>
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
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr
              key={result.position}
              style={{
                borderBottom: '1px solid #2A2A3E',
                backgroundColor: result.position <= 3 ? `${getPodiumColor(result.position)}10` : 'transparent',
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
                  {result.position <= 3 && (
                    <div style={{
                      width: '4px',
                      height: '24px',
                      backgroundColor: getPodiumColor(result.position),
                      borderRadius: '2px',
                    }} />
                  )}
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}>
                    {result.position}
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
                  {result.driver_name}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <TeamBadge
                  constructorRef={result.constructor_ref}
                  constructorName={result.constructor_name}
                />
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'right',
              }}>
                <span style={{
                  color: '#B0B0B0',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}>
                  {formatTime(result.time)}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'center',
              }}>
                <span style={{
                  color: result.points > 0 ? '#E10600' : '#666',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {result.points}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: result.status === 'Finished' ? '#4CAF50' : '#666',
                  fontSize: '13px',
                }}>
                  {result.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
