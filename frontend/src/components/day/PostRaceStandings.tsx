import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import { useDriverStandings } from '../../hooks/useStandings';
import { getTeamPrimaryColor } from '../../utils/f1Colors';
import type { DriverStandingOut } from '../../types';

interface RaceResultItem {
  position: number;
  position_text: string;
  driver: { driver_ref: string; first_name: string; last_name: string; code: string };
  constructor: { constructor_ref: string; name: string };
  points: number;
  grid_position: number;
  finish_time: string | null;
  status: string;
  laps_completed: number;
}

export interface PostRaceConfig {
  round: number;
  raceName: string;
  raceDate: string;
  circuitName: string;
  circuitCountry: string;
}

interface PostRaceStandingsProps {
  year: number;
  config: PostRaceConfig;
  totalRaces: number;
}

const PostRaceStandings = ({ year, config, totalRaces }: PostRaceStandingsProps) => {
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['raceResults', year, config.round],
    queryFn: () => apiGet<RaceResultItem[]>(`/seasons/${year}/races/${config.round}/results`),
    staleTime: Infinity,
  });

  const { data: standings, isLoading: standingsLoading } = useDriverStandings(year, config.round);

  const { data: prevStandings } = useDriverStandings(
    year,
    config.round > 1 ? config.round - 1 : undefined
  );

  if (resultsLoading || standingsLoading) return null;

  const top10Results = results?.filter(r => r.position && r.position <= 10) || [];
  const top10Standings = standings?.slice(0, 10) || [];

  const prevPointsMap: Record<string, number> = {};
  if (prevStandings) {
    prevStandings.forEach((s: DriverStandingOut) => {
      prevPointsMap[s.driver.driver_ref] = s.points;
    });
  }

  const winner = top10Results[0];

  const getPositionChange = (result: RaceResultItem) => {
    if (!result.grid_position || result.grid_position === 0) return null;
    const change = result.grid_position - result.position;
    return change;
  };

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
          Round {config.round} of {totalRaces}
        </div>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          Results After the {config.raceName}
        </h2>
        <p style={{
          color: '#888',
          fontSize: '14px',
          margin: 0,
        }}>
          {config.circuitName}, {config.circuitCountry}
        </p>
      </div>

      {/* Race Results Top 10 */}
      {top10Results.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Race Classification
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                  {['Pos', 'Driver', 'Team', 'Grid', '', 'Time', 'Pts'].map((h, i) => (
                    <th key={h + i} style={{
                      color: '#666',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: i === 0 || i >= 3 ? 'center' : 'left',
                      padding: '8px 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top10Results.map((result) => {
                  const teamColor = getTeamPrimaryColor(result.constructor.constructor_ref);
                  const posChange = getPositionChange(result);
                  return (
                    <tr key={result.position} style={{ borderBottom: '1px solid #2A2A3E' }}>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <div style={{
                            width: '3px',
                            height: '22px',
                            backgroundColor: result.position <= 3 ? teamColor : 'transparent',
                            borderRadius: '2px',
                          }} />
                          <span style={{
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontWeight: 700,
                          }}>
                            {result.position_text}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
                          {result.driver.first_name} {result.driver.last_name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            backgroundColor: teamColor,
                          }} />
                          <span style={{ color: '#B0B0B0', fontSize: '12px' }}>
                            {result.constructor.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <span style={{ color: '#888', fontSize: '13px' }}>
                          {result.grid_position || 'PL'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'center', width: '30px' }}>
                        {posChange !== null && posChange !== 0 && (
                          <span style={{
                            color: posChange > 0 ? '#4CAF50' : '#F44336',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            {posChange > 0 ? `+${posChange}` : posChange}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <span style={{ color: '#B0B0B0', fontSize: '13px', fontFamily: 'monospace' }}>
                          {result.position === 1 ? (result.finish_time || '') : (result.finish_time || result.status || '')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <span style={{
                          color: result.points > 0 ? '#E10600' : '#555',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}>
                          {result.points > 0 ? `+${result.points}` : ''}
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

      {/* Championship Standings */}
      {top10Standings.length > 0 && (
        <div>
          <h3 style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Championship Standings After Round {config.round}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                  {['Pos', 'Driver', 'Team', 'Points', 'Wins'].map((h, i) => (
                    <th key={h} style={{
                      color: '#666',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: i >= 3 ? 'center' : 'left',
                      padding: '8px 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top10Standings.map((standing) => {
                  const teamColor = getTeamPrimaryColor(standing.constructor_ref);
                  const prevPts = prevPointsMap[standing.driver.driver_ref] ?? 0;
                  const gained = config.round > 1 ? standing.points - prevPts : standing.points;
                  return (
                    <tr key={standing.position} style={{ borderBottom: '1px solid #2A2A3E' }}>
                      <td style={{ padding: '10px 6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '3px', height: '22px',
                            backgroundColor: standing.position <= 3 ? teamColor : 'transparent',
                            borderRadius: '2px',
                          }} />
                          <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700 }}>
                            {standing.position}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
                          {standing.driver.first_name} {standing.driver.last_name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            backgroundColor: teamColor,
                          }} />
                          <span style={{ color: '#B0B0B0', fontSize: '12px' }}>
                            {standing.constructor_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
                          {standing.points}
                        </span>
                        {gained > 0 && (
                          <span style={{
                            color: '#4CAF50',
                            fontSize: '11px',
                            fontWeight: 600,
                            marginLeft: '4px',
                          }}>
                            +{gained}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
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
        </div>
      )}

      {/* Winner highlight */}
      {winner && (
        <div style={{
          marginTop: '20px',
          backgroundColor: '#12121F',
          borderLeft: `4px solid ${getTeamPrimaryColor(winner.constructor.constructor_ref)}`,
          borderRadius: '0 8px 8px 0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ color: '#FFD700', fontSize: '20px' }}>&#127942;</span>
          <div>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
              {winner.driver.first_name} {winner.driver.last_name}
            </span>
            <span style={{ color: '#888', fontSize: '13px', marginLeft: '8px' }}>
              wins the {config.raceName} from P{winner.grid_position}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostRaceStandings;
