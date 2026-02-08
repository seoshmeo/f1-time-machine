import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRace, useRaceResults, useQualifyingResults, useFastestLaps, useRacePenalties } from '../hooks/useRace';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SessionTabs from '../components/race/SessionTabs';
import ResultsTable from '../components/race/ResultsTable';
import QualifyingTable from '../components/race/QualifyingTable';
import PenaltiesTable from '../components/race/PenaltiesTable';
import TeamBadge from '../components/common/TeamBadge';
import { formatDateLong } from '../utils/dateUtils';

const RacePage = () => {
  const { year, round } = useParams<{ year: string; round: string }>();
  const seasonYear = parseInt(year || '2010');
  const raceRound = parseInt(round || '1');

  const [activeSession, setActiveSession] = useState('R');

  const { data: raceData, isLoading: isLoadingRace, error: raceError } = useRace(seasonYear, raceRound);
  const { data: raceResults, isLoading: isLoadingResults } = useRaceResults(seasonYear, raceRound);
  const { data: qualifyingResults, isLoading: isLoadingQualifying } = useQualifyingResults(seasonYear, raceRound);
  const { data: fastestLaps, isLoading: isLoadingFastestLaps } = useFastestLaps(seasonYear, raceRound);
  const { data: penalties, isLoading: isLoadingPenalties } = useRacePenalties(seasonYear, raceRound);

  const isLoading = isLoadingRace || isLoadingResults || isLoadingQualifying || isLoadingFastestLaps || isLoadingPenalties;
  const error = raceError;

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !raceData) {
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
            Race Not Found
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load race data
          </p>
        </div>
      </div>
    );
  }

  // Transform race results to flat format
  const transformedRaceResults = raceResults?.map((r: any) => ({
    position: r.position,
    driver_name: `${r.driver.first_name} ${r.driver.last_name}`,
    constructor_ref: r.constructor.constructor_ref,
    constructor_name: r.constructor.name,
    time: r.finish_time,
    points: r.points,
    status: r.status,
    grid: r.grid_position,
    laps: r.laps_completed,
    fastest_lap_time: r.fastest_lap_time,
    fastest_lap_speed: r.fastest_lap_speed,
  })) || [];

  // Transform qualifying results to flat format
  const transformedQualifyingResults = qualifyingResults?.map((r: any) => ({
    position: r.position,
    driver_name: `${r.driver.first_name} ${r.driver.last_name}`,
    constructor_ref: r.constructor.constructor_ref,
    constructor_name: r.constructor.name,
    q1: r.q1_time,
    q2: r.q2_time,
    q3: r.q3_time,
  })) || [];

  const availableSessions = [];
  if (transformedQualifyingResults.length > 0) {
    availableSessions.push('Q');
  }
  if (transformedRaceResults.length > 0) {
    availableSessions.push('R');
  }
  if (fastestLaps && fastestLaps.length > 0) {
    availableSessions.push('FL');
  }
  if (penalties && penalties.length > 0) {
    availableSessions.push('P');
  }

  const renderSessionResults = () => {
    if (activeSession === 'Q' && transformedQualifyingResults.length > 0) {
      return <QualifyingTable results={transformedQualifyingResults} />;
    }
    if (activeSession === 'R' && transformedRaceResults.length > 0) {
      return <ResultsTable results={transformedRaceResults} />;
    }
    if (activeSession === 'FL' && fastestLaps && fastestLaps.length > 0) {
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2A2A3E' }}>
                <th style={{
                  color: '#666',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'left',
                  padding: '12px 8px',
                  textTransform: 'uppercase',
                }}>Rank</th>
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
                }}>Lap</th>
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
                  textAlign: 'right',
                  padding: '12px 8px',
                  textTransform: 'uppercase',
                }}>Speed (km/h)</th>
              </tr>
            </thead>
            <tbody>
              {fastestLaps.map((lap: any, idx: number) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #2A2A3E',
                    backgroundColor: lap.rank === 1 ? '#E1060010' : 'transparent',
                  }}
                >
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{
                      color: lap.rank === 1 ? '#E10600' : '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: lap.rank === 1 ? 700 : 600,
                    }}>
                      {lap.rank || idx + 1}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {`${lap.driver.first_name} ${lap.driver.last_name}`}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <TeamBadge
                      constructorRef={lap.constructor.constructor_ref}
                      constructorName={lap.constructor.name}
                    />
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{
                      color: '#B0B0B0',
                      fontSize: '14px',
                    }}>
                      {lap.lap || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <span style={{
                      color: lap.rank === 1 ? '#E10600' : '#B0B0B0',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: lap.rank === 1 ? 600 : 400,
                    }}>
                      {lap.time || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <span style={{
                      color: '#B0B0B0',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                    }}>
                      {lap.speed ? lap.speed.toFixed(2) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeSession === 'P' && penalties && penalties.length > 0) {
      return <PenaltiesTable penalties={penalties} />;
    }
    return (
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          No data available for this session
        </p>
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div style={{
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '20px',
            fontWeight: 700,
          }}>
            Round {raceData.round}
          </div>
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: 700,
            margin: 0,
          }}>
            {raceData.name}
          </h1>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <p style={{
            color: '#B0B0B0',
            fontSize: '16px',
            margin: 0,
          }}>
            {raceData.circuit?.name || raceData.circuit_name}
          </p>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: 0,
          }}>
            {raceData.circuit?.country || raceData.circuit_country} • {formatDateLong(raceData.date)}
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
      }}>
        <SessionTabs
          sessions={availableSessions}
          activeSession={activeSession}
          onSessionChange={setActiveSession}
        />

        {renderSessionResults()}
      </div>
    </div>
  );
};

export default RacePage;
