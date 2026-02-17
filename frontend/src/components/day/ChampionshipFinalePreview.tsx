import { useDriverStandings } from '../../hooks/useStandings';
import { getTeamPrimaryColor } from '../../utils/f1Colors';

interface ScenarioCard {
  driverName: string;
  constructorRef: string;
  scenario: string;
  difficulty: 'favorite' | 'challenger' | 'longshot' | 'nearimpossible';
}

const SCENARIOS_2010: ScenarioCard[] = [
  {
    driverName: 'Fernando Alonso',
    constructorRef: 'ferrari',
    scenario: 'Finishes P2 or better \u2192 Champion. Even if Webber wins (263 pts), P2 gives Alonso 264. Simply needs to keep at least one rival behind him.',
    difficulty: 'favorite',
  },
  {
    driverName: 'Mark Webber',
    constructorRef: 'red_bull',
    scenario: 'Must win AND hope Alonso finishes P3 or worse. If Webber wins (263) and Alonso is P3 (261) \u2192 Webber champion on wins countback. A retirement for Alonso would seal it.',
    difficulty: 'challenger',
  },
  {
    driverName: 'Sebastian Vettel',
    constructorRef: 'red_bull',
    scenario: 'Must win (256) AND Alonso finishes P7 or lower AND Webber finishes P3 or lower. Very narrow path \u2014 needs multiple results to go his way.',
    difficulty: 'longshot',
  },
  {
    driverName: 'Lewis Hamilton',
    constructorRef: 'mclaren',
    scenario: 'Must win (247) AND Alonso scores 0 points AND Webber finishes P6 or lower AND Vettel finishes P3 or lower. Near-impossible \u2014 needs a miracle combination.',
    difficulty: 'nearimpossible',
  },
];

const difficultyLabels: Record<string, { label: string; color: string }> = {
  favorite: { label: 'FAVORITE', color: '#4CAF50' },
  challenger: { label: 'CHALLENGER', color: '#FF9800' },
  longshot: { label: 'LONG SHOT', color: '#F44336' },
  nearimpossible: { label: 'NEAR IMPOSSIBLE', color: '#9E9E9E' },
};

interface ChampionshipFinalePreviewProps {
  year: number;
  preFinaleRound: number;
}

const ChampionshipFinalePreview = ({ year, preFinaleRound }: ChampionshipFinalePreviewProps) => {
  const { data: standings, isLoading } = useDriverStandings(year, preFinaleRound);

  if (isLoading) return null;

  const top4 = standings?.slice(0, 4) || [];
  const leaderPoints = top4[0]?.points || 0;

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#E10600',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Season Finale Preview
        </div>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          Championship Standings Before the Finale
        </h2>
        <p style={{
          color: '#888',
          fontSize: '14px',
          margin: 0,
        }}>
          Abu Dhabi Grand Prix &mdash; Round 19 of 19 &mdash; Four drivers can still win the title
        </p>
      </div>

      {/* Standings Table */}
      {top4.length > 0 && (
        <div style={{
          marginBottom: '28px',
          overflowX: 'auto',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                {['Pos', 'Driver', 'Team', 'Points', 'Gap', 'Wins'].map((header, i) => (
                  <th key={header} style={{
                    color: '#666',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: i >= 3 ? 'center' : 'left',
                    padding: '10px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top4.map((standing) => {
                const teamColor = getTeamPrimaryColor(standing.constructor_ref);
                const gap = standing.points - leaderPoints;
                return (
                  <tr key={standing.position} style={{
                    borderBottom: '1px solid #2A2A3E',
                  }}>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <div style={{
                          width: '4px',
                          height: '28px',
                          backgroundColor: teamColor,
                          borderRadius: '2px',
                        }} />
                        <span style={{
                          color: '#FFFFFF',
                          fontSize: '18px',
                          fontWeight: 700,
                        }}>
                          {standing.position}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: 600,
                      }}>
                        {standing.driver.first_name} {standing.driver.last_name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: teamColor,
                        }} />
                        <span style={{ color: '#B0B0B0', fontSize: '13px' }}>
                          {standing.constructor_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                      <span style={{
                        color: '#FFFFFF',
                        fontSize: '20px',
                        fontWeight: 700,
                      }}>
                        {standing.points}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                      <span style={{
                        color: gap === 0 ? '#4CAF50' : '#F44336',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}>
                        {gap === 0 ? 'LEADER' : `${gap}`}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                      <span style={{ color: '#B0B0B0', fontSize: '14px', fontWeight: 600 }}>
                        {standing.wins}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Scenario Cards */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 700,
          margin: '0 0 16px 0',
        }}>
          What Each Driver Needs
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {SCENARIOS_2010.map((scenario) => {
            const teamColor = getTeamPrimaryColor(scenario.constructorRef);
            const diff = difficultyLabels[scenario.difficulty];
            return (
              <div
                key={scenario.driverName}
                style={{
                  backgroundColor: '#12121F',
                  borderLeft: `4px solid ${teamColor}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '16px 20px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}>
                    {scenario.driverName}
                  </span>
                  <span style={{
                    color: diff.color,
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    backgroundColor: `${diff.color}15`,
                    border: `1px solid ${diff.color}40`,
                    letterSpacing: '0.5px',
                  }}>
                    {diff.label}
                  </span>
                </div>
                <p style={{
                  color: '#B0B0B0',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {scenario.scenario}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points System Reminder */}
      <div style={{
        backgroundColor: '#12121F',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          color: '#666',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          flexShrink: 0,
        }}>
          Points System
        </span>
        <span style={{
          color: '#888',
          fontSize: '12px',
        }}>
          25 &ndash; 18 &ndash; 15 &ndash; 12 &ndash; 10 &ndash; 8 &ndash; 6 &ndash; 4 &ndash; 2 &ndash; 1
        </span>
      </div>
    </div>
  );
};

export default ChampionshipFinalePreview;
