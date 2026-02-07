import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRace } from '../hooks/useRace';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SessionTabs from '../components/race/SessionTabs';
import ResultsTable from '../components/race/ResultsTable';
import QualifyingTable from '../components/race/QualifyingTable';
import { formatDateLong } from '../utils/dateUtils';

const RacePage = () => {
  const { year, round } = useParams<{ year: string; round: string }>();
  const seasonYear = parseInt(year || '2010');
  const raceRound = parseInt(round || '1');

  const [activeSession, setActiveSession] = useState('R');

  const { data: raceData, isLoading, error } = useRace(seasonYear, raceRound);

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

  const availableSessions = [];
  if (raceData.practice_sessions?.length > 0) {
    raceData.practice_sessions.forEach((_, idx) => {
      availableSessions.push(`FP${idx + 1}`);
    });
  }
  if (raceData.qualifying_results?.length > 0) {
    availableSessions.push('Q');
  }
  if (raceData.race_results?.length > 0) {
    availableSessions.push('R');
  }

  const renderSessionResults = () => {
    if (activeSession === 'Q' && raceData.qualifying_results) {
      return <QualifyingTable results={raceData.qualifying_results} />;
    }
    if (activeSession === 'R' && raceData.race_results) {
      return <ResultsTable results={raceData.race_results} />;
    }
    if (activeSession.startsWith('FP') && raceData.practice_sessions) {
      const sessionIndex = parseInt(activeSession.replace('FP', '')) - 1;
      const practiceResults = raceData.practice_sessions[sessionIndex];
      if (practiceResults) {
        return <ResultsTable results={practiceResults} />;
      }
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
            {raceData.circuit_name}
          </p>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: 0,
          }}>
            {raceData.circuit_country} • {formatDateLong(raceData.date)}
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
