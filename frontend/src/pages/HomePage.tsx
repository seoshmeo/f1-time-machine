import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { apiGet } from '../api/client';
import { getRaces } from '../api/races';
import { daysApi } from '../api/days';
import { getSeasonEvents } from '../api/events';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventCard from '../components/day/EventCard';
import QuoteCard from '../components/article/QuoteCard';
import RegulationsList from '../components/home/RegulationsList';
import TransfersList from '../components/home/TransfersList';
import GridChanges from '../components/home/GridChanges';

interface DayFromApi {
  date: string;
  day_type: string;
  description: string | null;
  has_content: boolean;
}

interface RaceFromApi {
  id: number;
  round: number;
  name: string;
  date: string;
  circuit_name: string;
  circuit_country: string;
}

const dayTypeColors: Record<string, string> = {
  race_day: '#E10600',
  quali_day: '#FF8C00',
  practice_day: '#FFD700',
  test_day: '#4A90E2',
};

const dayTypeLabels: Record<string, string> = {
  race_day: 'Race',
  quali_day: 'Qualifying',
  practice_day: 'Practice',
  test_day: 'Testing',
};

function formatScheduleDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${d} ${months[m - 1]}`;
}

const HomePage = () => {
  const seasonYear = 2010;
  const today = new Date().toISOString().split('T')[0];

  const { data: todayResponse, isLoading: isLoadingToday } = useQuery({
    queryKey: ['today', seasonYear, today],
    queryFn: () => daysApi.getToday(seasonYear),
  });

  const { data: scheduleDays, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['scheduleDays', seasonYear],
    queryFn: () => apiGet<DayFromApi[]>(`/seasons/${seasonYear}/days`, { has_content: true }),
    staleTime: Infinity,
  });

  const { data: races } = useQuery({
    queryKey: ['races', seasonYear],
    queryFn: () => getRaces(seasonYear),
    staleTime: Infinity,
  });

  const { data: regulations } = useQuery({
    queryKey: ['events', seasonYear, 'regulation', 'pre-season'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'regulation', tag: 'pre-season' }),
    staleTime: Infinity,
  });

  const { data: transfers } = useQuery({
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

  const { data: quotes } = useQuery({
    queryKey: ['quotes', seasonYear],
    queryFn: () => apiGet<Array<{ id: number; text: string; author_name: string; context: string | null }>>(`/seasons/${seasonYear}/quotes`),
    staleTime: Infinity,
  });

  const dayData = todayResponse?.day;

  // Group schedule days by race weekend
  const raceWeekends: Array<{
    raceName: string;
    round: number;
    country: string;
    days: DayFromApi[];
  }> = [];

  if (scheduleDays && races) {
    // Build a map: date -> race info
    const raceByDate: Record<string, RaceFromApi> = {};
    const raceByRound: Record<number, RaceFromApi> = {};
    for (const race of races as RaceFromApi[]) {
      raceByDate[race.date] = race;
      raceByRound[race.round] = race;
    }

    let currentWeekend: typeof raceWeekends[0] | null = null;

    for (const day of scheduleDays) {
      // Find which race this day belongs to by checking description
      const desc = day.description || '';
      let matchedRace: RaceFromApi | undefined;

      // Try to match by race name in description
      for (const race of races as RaceFromApi[]) {
        if (desc.includes(race.name.replace(' Grand Prix', ''))) {
          matchedRace = race;
          break;
        }
      }

      // Also check if it's a race day by date
      if (!matchedRace && raceByDate[day.date]) {
        matchedRace = raceByDate[day.date];
      }

      if (matchedRace) {
        if (!currentWeekend || currentWeekend.round !== matchedRace.round) {
          currentWeekend = {
            raceName: matchedRace.name,
            round: matchedRace.round,
            country: matchedRace.circuit_country,
            days: [],
          };
          raceWeekends.push(currentWeekend);
        }
        currentWeekend.days.push(day);
      }
    }
  }

  const randomQuote = useMemo(() => {
    if (!quotes || quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [quotes]);

  useEffect(() => {
    document.title = 'F1 Time Machine — 2010 Formula 1 Season';
  }, []);

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        marginBottom: '64px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '48px',
          fontWeight: 700,
          margin: '0 0 16px 0',
        }}>
          F1 Time Machine
        </h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#1A1A2E',
          border: '2px solid #E10600',
          borderRadius: '8px',
          padding: '16px 32px',
        }}>
          <span style={{ color: '#B0B0B0', fontSize: '20px' }}>Relive the</span>
          <span style={{ color: '#E10600', fontSize: '32px', fontWeight: 700 }}>{seasonYear}</span>
          <span style={{ color: '#B0B0B0', fontSize: '20px' }}>Season</span>
        </div>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '24px' }}>
          Experience the 2010 Formula 1 season day by day
        </p>
      </div>

      {/* On This Day */}
      {isLoadingToday ? (
        <LoadingSpinner />
      ) : dayData && dayData.events && dayData.events.length > 0 ? (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '48px',
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            On This Day
            <span style={{
              backgroundColor: '#E10600',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              {dayData.date}
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {dayData.events.slice(0, 3).map((event, index) => (
              <EventCard
                key={index}
                title={event.title}
                summary={event.summary}
                importance={event.importance}
                sessionType={event.session_type}
              />
            ))}
          </div>
          <Link
            to={`/season/${seasonYear}/day/${dayData.date}`}
            style={{
              display: 'inline-block',
              marginTop: '24px',
              backgroundColor: '#E10600',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            View Full Day
          </Link>
        </div>
      ) : null}

      {/* Season Preview 2010 */}
      {(regulations && regulations.length > 0) || (transfers && transfers.length > 0) ? (
        <div style={{
          marginBottom: '48px',
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}>
            2010 Season Preview
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
          }}>
            {/* New Rules */}
            {regulations && regulations.length > 0 && (
              <div style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid #2A2A3E',
                borderRadius: '8px',
                padding: '24px',
              }}>
                <h3 style={{
                  color: '#E10600',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 16px 0',
                }}>
                  New Rules
                </h3>
                <RegulationsList events={regulations} />
              </div>
            )}

            {/* Driver Market */}
            {transfers && transfers.length > 0 && (
              <div style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid #2A2A3E',
                borderRadius: '8px',
                padding: '24px',
              }}>
                <h3 style={{
                  color: '#E10600',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 16px 0',
                }}>
                  Driver Market
                </h3>
                <TransfersList events={transfers} />
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* The Grid - New/Departed Teams */}
      {((newTeams && newTeams.length > 0) || (departedTeams && departedTeams.length > 0)) ? (
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '48px',
        }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}>
            Grid Changes
          </h2>
          <GridChanges
            newTeams={newTeams || []}
            departedTeams={departedTeams || []}
          />
        </div>
      ) : null}

      {/* Season Schedule — hidden */}

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        {[
          { to: `/season/${seasonYear}/calendar`, label: 'Calendar', desc: 'View the complete 2010 season calendar' },
          { to: `/season/${seasonYear}/standings`, label: 'Standings', desc: 'Check driver and constructor standings' },
          { to: `/season/${seasonYear}/drivers`, label: 'Drivers', desc: 'Explore the 2010 driver lineup' },
          { to: `/season/${seasonYear}/constructors`, label: 'Constructors', desc: 'Browse all 12 teams' },
        ].map((link) => (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid #2A2A3E',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E10600';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3E';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
                {link.label}
              </h3>
              <p style={{ color: '#B0B0B0', fontSize: '14px', margin: 0 }}>
                {link.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {randomQuote ? (
        <QuoteCard
          quote={randomQuote.text}
          author={randomQuote.author_name}
          context={randomQuote.context || undefined}
        />
      ) : (
        <QuoteCard
          quote="This is going to be the most competitive season we've ever seen in Formula 1"
          author="Martin Brundle"
          context="Pre-season prediction, 2010"
        />
      )}
    </div>
  );
};

export default HomePage;
