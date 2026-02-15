import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiGet } from '../api/client';
import { getSeasonEvents } from '../api/events';
import { getRaces } from '../api/races';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RegulationsList from '../components/home/RegulationsList';
import TransfersList from '../components/home/TransfersList';
import GridChanges from '../components/home/GridChanges';

interface ConstructorOut {
  id: number;
  constructor_ref: string;
  name: string;
  nationality: string;
  color_primary: string;
  color_secondary: string;
}

interface DriverOut {
  id: number;
  driver_ref: string;
  number: number | null;
  code: string | null;
  first_name: string;
  last_name: string;
  nationality: string;
}

interface RaceOut {
  id: number;
  round: number;
  name: string;
  date: string;
  time: string | null;
  circuit_name: string;
  circuit_country: string;
}

// Driver-team pairing for grid display
const GRID_2026: Array<{ team: string; drivers: string[] }> = [
  { team: 'mclaren', drivers: ['norris', 'piastri'] },
  { team: 'ferrari', drivers: ['leclerc', 'hamilton'] },
  { team: 'red_bull', drivers: ['max_verstappen', 'hadjar'] },
  { team: 'mercedes', drivers: ['russell', 'antonelli'] },
  { team: 'aston_martin', drivers: ['alonso', 'stroll'] },
  { team: 'williams', drivers: ['albon', 'sainz'] },
  { team: 'rb', drivers: ['lawson', 'lindblad'] },
  { team: 'haas', drivers: ['ocon', 'bearman'] },
  { team: 'alpine', drivers: ['gasly', 'colapinto'] },
  { team: 'audi', drivers: ['hulkenberg', 'bortoleto'] },
  { team: 'cadillac', drivers: ['perez', 'bottas'] },
];

const SeasonPreviewPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2026');

  useEffect(() => {
    document.title = `Formula 1 ${seasonYear} Season — F1 Calendar, Teams, Drivers & Regulations | F1 Time Machine`;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (name.startsWith('og:')) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const desc = `${seasonYear} Formula 1 Season Preview — ${seasonYear} race calendar, all 11 teams & 22 drivers, new regulations including active aerodynamics, power unit changes, Cadillac & Audi entries, driver transfers.`;
    setMeta('description', desc);
    setMeta('og:title', `Formula 1 ${seasonYear} Season — Teams, Drivers, Calendar & New Regulations`);
    setMeta('og:description', desc);
    setMeta('og:type', 'website');
    setMeta('og:url', `https://timemachinegp.com/${seasonYear}`);
    setMeta('og:site_name', 'F1 Time Machine');

    return () => {
      document.title = 'F1 Time Machine';
    };
  }, [seasonYear]);

  const { data: regulations, isLoading: isLoadingRegs } = useQuery({
    queryKey: ['events', seasonYear, 'regulation'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'regulation' }),
    staleTime: Infinity,
  });

  const { data: transfers, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['events', seasonYear, 'transfer'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'transfer' }),
    staleTime: Infinity,
  });

  const { data: newTeams } = useQuery({
    queryKey: ['events', seasonYear, 'team_entry'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'team_entry' }),
    staleTime: Infinity,
  });

  const { data: departedTeams } = useQuery({
    queryKey: ['events', seasonYear, 'team_departure'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'team_departure' }),
    staleTime: Infinity,
  });

  const { data: constructors } = useQuery({
    queryKey: ['constructors', seasonYear],
    queryFn: () => apiGet<ConstructorOut[]>(`/seasons/${seasonYear}/constructors`),
    staleTime: Infinity,
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers', seasonYear],
    queryFn: () => apiGet<DriverOut[]>(`/seasons/${seasonYear}/drivers`),
    staleTime: Infinity,
  });

  const { data: races } = useQuery({
    queryKey: ['races', seasonYear],
    queryFn: () => getRaces(seasonYear),
    staleTime: Infinity,
  });

  const isLoading = isLoadingRegs || isLoadingTransfers;

  const constructorMap = new Map<string, ConstructorOut>();
  constructors?.forEach(c => constructorMap.set(c.constructor_ref, c));

  const driverMap = new Map<string, DriverOut>();
  drivers?.forEach(d => driverMap.set(d.driver_ref, d));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '42px', fontWeight: 700, margin: '0 0 12px 0' }}>
          {seasonYear} Season Preview
        </h1>
        <p style={{ color: '#B0B0B0', fontSize: '18px', margin: 0 }}>
          New regulations, new teams, new era of Formula 1
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {[
          { label: 'Races', value: races?.length || 24 },
          { label: 'Teams', value: constructors?.length || 11 },
          { label: 'Drivers', value: drivers?.length || 22 },
          { label: 'Sprint Weekends', value: 6 },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: '#1A1A2E',
            border: '1px solid #2A2A3E',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#E10600', fontSize: '32px', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ color: '#B0B0B0', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pre-Season Testing */}
      <Link to={`/season/${seasonYear}/testing`} style={{ textDecoration: 'none' }}>
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #E10600',
          borderRadius: '8px',
          padding: '24px 32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252540'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A2E'; }}
        >
          <div>
            <div style={{ color: '#E10600', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Pre-Season Testing
            </div>
            <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
              Bahrain International Circuit — Feb 11-13, 2026
            </div>
          </div>
          <div style={{ color: '#E10600', fontSize: '14px', fontWeight: 600 }}>
            View Results →
          </div>
        </div>
      </Link>

      {/* Regulations */}
      {regulations && regulations.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#E10600', fontSize: '22px', fontWeight: 700, margin: '0 0 20px 0' }}>
            Regulation Changes
          </h2>
          <RegulationsList events={regulations} />
        </div>
      )}

      {/* Grid Changes */}
      {((newTeams && newTeams.length > 0) || (departedTeams && departedTeams.length > 0)) && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 20px 0' }}>
            Grid Changes
          </h2>
          <GridChanges newTeams={newTeams || []} departedTeams={departedTeams || []} />
        </div>
      )}

      {/* Driver Market */}
      {transfers && transfers.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#E10600', fontSize: '22px', fontWeight: 700, margin: '0 0 20px 0' }}>
            Driver Market
          </h2>
          <TransfersList events={transfers} />
        </div>
      )}

      {/* Team Lineup Grid */}
      {constructors && drivers && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 24px 0' }}>
            {seasonYear} Grid
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {GRID_2026.map(({ team, drivers: driverRefs }) => {
              const constructor = constructorMap.get(team);
              if (!constructor) return null;
              return (
                <Link
                  key={team}
                  to={`/season/${seasonYear}/constructors/${team}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: '#0F0F0F',
                    borderLeft: `4px solid ${constructor.color_primary}`,
                    borderRadius: '6px',
                    padding: '16px 20px',
                    transition: 'transform 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{
                      color: constructor.color_primary,
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {constructor.name}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {driverRefs.map(ref => {
                        const d = driverMap.get(ref);
                        if (!d) return null;
                        return (
                          <div key={ref} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              color: '#666',
                              fontSize: '14px',
                              fontWeight: 600,
                              minWidth: '24px',
                            }}>
                              #{d.number}
                            </span>
                            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>
                              {d.first_name} {d.last_name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Race Calendar */}
      {races && races.length > 0 && (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, margin: '0 0 24px 0' }}>
            Race Calendar
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {(races as RaceOut[]).map((race) => {
              const raceDate = new Date(race.date);
              const month = raceDate.toLocaleString('en', { month: 'short' });
              const day = raceDate.getDate();
              const isSprint = [2, 6, 7, 11, 14, 18].includes(race.round);
              return (
                <Link
                  key={race.round}
                  to={`/season/${seasonYear}/race/${race.round}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    transition: 'background-color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0F0F0F'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{
                      color: '#666',
                      fontSize: '13px',
                      fontWeight: 600,
                      minWidth: '28px',
                      textAlign: 'center',
                    }}>
                      R{race.round}
                    </div>
                    <div style={{
                      color: '#E10600',
                      fontSize: '13px',
                      fontWeight: 600,
                      minWidth: '56px',
                    }}>
                      {month} {day}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>
                        {race.name}
                      </span>
                      <span style={{ color: '#666', fontSize: '13px', marginLeft: '8px' }}>
                        {race.circuit_country}
                      </span>
                    </div>
                    {isSprint && (
                      <span style={{
                        backgroundColor: '#E10600',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        SPRINT
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {[
          { to: `/season/${seasonYear}/testing`, label: 'Pre-Season Testing' },
          { to: `/season/${seasonYear}/calendar`, label: 'Calendar' },
          { to: `/season/${seasonYear}/drivers`, label: 'Drivers' },
          { to: `/season/${seasonYear}/constructors`, label: 'Constructors' },
          { to: `/season/${seasonYear}/races`, label: 'All Races' },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              transition: 'border-color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E10600'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A3E'; }}
            >
              <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SeasonPreviewPage;
