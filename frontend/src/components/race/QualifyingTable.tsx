import { QualifyingResult } from '../../types';
import TeamBadge from '../common/TeamBadge';
import { formatTime } from '../../utils/formatTime';

interface QualifyingTableProps {
  results: QualifyingResult[];
}

const QualifyingTable = ({ results }: QualifyingTableProps) => {
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
            }}>Q1</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'right',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Q2</th>
            <th style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'right',
              padding: '12px 8px',
              textTransform: 'uppercase',
            }}>Q3</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr
              key={result.position}
              style={{
                borderBottom: '1px solid #2A2A3E',
                backgroundColor: result.position === 1 ? '#E1060010' : 'transparent',
              }}
            >
              <td style={{
                padding: '16px 8px',
              }}>
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                }}>
                  {result.position}
                </span>
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
                  color: result.q1 ? '#B0B0B0' : '#666',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}>
                  {result.q1 ? formatTime(result.q1) : '-'}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'right',
              }}>
                <span style={{
                  color: result.q2 ? '#B0B0B0' : '#666',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}>
                  {result.q2 ? formatTime(result.q2) : '-'}
                </span>
              </td>
              <td style={{
                padding: '16px 8px',
                textAlign: 'right',
              }}>
                <span style={{
                  color: result.q3 ? '#E10600' : '#666',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  fontWeight: result.q3 ? 600 : 400,
                }}>
                  {result.q3 ? formatTime(result.q3) : '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QualifyingTable;
