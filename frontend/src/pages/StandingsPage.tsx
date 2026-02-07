import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DriverStandingsTable from '../components/standings/DriverStandingsTable';
import ConstructorStandingsTable from '../components/standings/ConstructorStandingsTable';
import StandingsChart from '../components/standings/StandingsChart';

const StandingsPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2010');

  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [selectedRound, setSelectedRound] = useState(19);

  const { data: standingsData, isLoading, error } = useStandings(seasonYear, selectedRound);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !standingsData) {
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
            Standings Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load standings for {seasonYear}
          </p>
        </div>
      </div>
    );
  }

  const rounds = Array.from({ length: 19 }, (_, i) => i + 1);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <div style={{
        marginBottom: '32px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: 700,
          margin: '0 0 16px 0',
        }}>
          {seasonYear} Championship Standings
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <label style={{
            color: '#B0B0B0',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            After Round:
          </label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(parseInt(e.target.value))}
            style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {rounds.map((round) => (
              <option key={round} value={round}>
                Round {round}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '2px solid #2A2A3E',
        marginBottom: '32px',
      }}>
        <button
          onClick={() => setActiveTab('drivers')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: activeTab === 'drivers' ? '#FFFFFF' : '#666',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'drivers' ? '2px solid #E10600' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
        >
          Drivers Championship
        </button>
        <button
          onClick={() => setActiveTab('constructors')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: activeTab === 'constructors' ? '#FFFFFF' : '#666',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'constructors' ? '2px solid #E10600' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
        >
          Constructors Championship
        </button>
      </div>

      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
        marginBottom: '32px',
      }}>
        {activeTab === 'drivers' && standingsData.driver_standings && (
          <DriverStandingsTable standings={standingsData.driver_standings} />
        )}
        {activeTab === 'constructors' && standingsData.constructor_standings && (
          <ConstructorStandingsTable standings={standingsData.constructor_standings} />
        )}
      </div>

      {activeTab === 'drivers' && standingsData.points_progression && standingsData.driver_standings && (() => {
        // Map constructor_name to constructor_ref for colors
        const nameToRef: Record<string, string> = {
          'Red Bull': 'red_bull', 'Ferrari': 'ferrari', 'McLaren': 'mclaren',
          'Mercedes': 'mercedes', 'Renault': 'renault', 'Williams': 'williams',
          'Force India': 'force_india', 'BMW Sauber': 'sauber', 'Sauber': 'sauber',
          'Toro Rosso': 'toro_rosso', 'Lotus': 'lotus', 'Virgin': 'virgin',
          'HRT': 'hispania', 'Hispania': 'hispania',
        };

        // Top 10 driver refs from standings
        const top10 = standingsData.driver_standings.slice(0, 10);
        const top10Refs = new Set(top10.map(s => s.driver.driver_ref));

        // Transform per-driver progression to per-round format for recharts
        const roundsMap: Record<number, Record<string, number>> = {};
        for (const entry of standingsData.points_progression) {
          if (!top10Refs.has(entry.driver.driver_ref)) continue;
          for (const p of entry.progression) {
            if (!roundsMap[p.round]) roundsMap[p.round] = { round: p.round };
            roundsMap[p.round][entry.driver.driver_ref] = p.points;
          }
        }
        const chartData = Object.values(roundsMap).sort((a, b) => a.round - b.round);

        const drivers = top10.map(s => ({
          driverRef: s.driver.driver_ref,
          driverName: `${s.driver.first_name} ${s.driver.last_name}`,
          constructorRef: nameToRef[s.constructor_name] || 'unknown',
        }));

        return <StandingsChart data={chartData} drivers={drivers} />;
      })()}
    </div>
  );
};

export default StandingsPage;
