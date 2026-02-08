import { PenaltyOut } from '@/api/penalties';
import TeamBadge from '../common/TeamBadge';

interface PenaltiesTableProps {
  penalties: PenaltyOut[];
}

const PenaltiesTable = ({ penalties }: PenaltiesTableProps) => {
  const getPenaltyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'grid_penalty': 'Grid Penalty',
      'time_penalty': 'Time Penalty',
      'drive_through': 'Drive Through',
      'stop_go': 'Stop & Go',
      'fine': 'Fine',
      'reprimand': 'Reprimand',
      'disqualification': 'Disqualification',
      'warning': 'Warning',
    };
    return labels[type] || type;
  };

  const getTimingLabel = (timing: string) => {
    const labels: Record<string, string> = {
      'pre_race': 'Pre-Race',
      'during_race': 'During Race',
      'post_race': 'Post-Race',
    };
    return labels[timing] || timing;
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
            }}>Driver/Team</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Type</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Timing</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Penalty</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Reason/Description</th>
          </tr>
        </thead>
        <tbody>
          {penalties.map((penalty) => (
            <tr
              key={penalty.id}
              style={{
                borderBottom: '1px solid #2A2A3E',
              }}
            >
              <td style={{
                padding: '16px 8px',
              }}>
                {penalty.driver_name ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    <span style={{
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {penalty.driver_name}
                    </span>
                    {penalty.constructor_ref && penalty.constructor_name && (
                      <TeamBadge
                        constructorRef={penalty.constructor_ref}
                        constructorName={penalty.constructor_name}
                      />
                    )}
                  </div>
                ) : (
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    {penalty.constructor_name || 'N/A'}
                  </span>
                )}
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: '#B0B0B0',
                  fontSize: '14px',
                }}>
                  {getPenaltyTypeLabel(penalty.penalty_type)}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: '#B0B0B0',
                  fontSize: '14px',
                }}>
                  {getTimingLabel(penalty.timing)}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: '#E10600',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {penalty.penalty_value || '-'}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <span style={{
                    color: '#B0B0B0',
                    fontSize: '14px',
                  }}>
                    {penalty.reason}
                  </span>
                  {penalty.description && (
                    <span style={{
                      color: '#666',
                      fontSize: '12px',
                    }}>
                      {penalty.description}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PenaltiesTable;
