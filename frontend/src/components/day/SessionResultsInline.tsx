import { useState, useEffect } from 'react';
import { getSessionResults, SessionResult } from '../../api/sessions';
import TeamBadge from '../common/TeamBadge';

interface SessionResultsInlineProps {
  sessionId: number;
  eventType: string;
}

const SessionResultsInline = ({ sessionId, eventType }: SessionResultsInlineProps) => {
  const [results, setResults] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionResults(sessionId)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ padding: '16px 0', color: '#666', fontSize: '13px' }}>
        Loading results...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: '16px 0', color: '#666', fontSize: '13px' }}>
        No results available
      </div>
    );
  }

  const isQualifying = eventType === 'qualifying_result';
  const isRace = eventType === 'race_result';

  const thStyle: React.CSSProperties = {
    color: '#666',
    fontSize: '11px',
    fontWeight: 600,
    textAlign: 'left',
    padding: '8px 6px',
    textTransform: 'uppercase',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 6px',
  };

  return (
    <div style={{
      marginTop: '16px',
      overflowX: 'auto',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
            <th style={thStyle}>Pos</th>
            <th style={thStyle}>Driver</th>
            <th style={thStyle}>Team</th>
            {isQualifying ? (
              <>
                <th style={{ ...thStyle, textAlign: 'right' }}>Q1</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Q2</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Q3</th>
              </>
            ) : isRace ? (
              <>
                <th style={{ ...thStyle, textAlign: 'right' }}>Time</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Pts</th>
                <th style={thStyle}>Status</th>
              </>
            ) : (
              <>
                <th style={{ ...thStyle, textAlign: 'right' }}>Time</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Laps</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid #1A1A2E',
                backgroundColor: r.position === 1 ? '#E1060008' : 'transparent',
              }}
            >
              <td style={tdStyle}>
                <span style={{
                  color: r.position <= 3 ? '#FFFFFF' : '#B0B0B0',
                  fontWeight: r.position <= 3 ? 700 : 400,
                }}>
                  {r.position}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                }}>
                  {r.driver_name}
                </span>
              </td>
              <td style={tdStyle}>
                <TeamBadge
                  constructorRef={r.constructor_ref}
                  constructorName={r.constructor_name}
                />
              </td>
              {isQualifying ? (
                <>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{ color: '#B0B0B0', fontFamily: 'monospace', fontSize: '12px' }}>
                      {r.q1_time || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{ color: '#B0B0B0', fontFamily: 'monospace', fontSize: '12px' }}>
                      {r.q2_time || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{
                      color: r.q3_time ? '#E10600' : '#666',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: r.q3_time ? 600 : 400,
                    }}>
                      {r.q3_time || '-'}
                    </span>
                  </td>
                </>
              ) : isRace ? (
                <>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{ color: '#B0B0B0', fontFamily: 'monospace', fontSize: '12px' }}>
                      {r.time || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      color: (r.points && r.points > 0) ? '#E10600' : '#666',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}>
                      {r.points ?? 0}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      color: r.status === 'Finished' ? '#4CAF50' : '#666',
                      fontSize: '12px',
                    }}>
                      {r.status || '-'}
                    </span>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{ color: '#B0B0B0', fontFamily: 'monospace', fontSize: '12px' }}>
                      {r.time || '-'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {r.laps || '-'}
                    </span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionResultsInline;
