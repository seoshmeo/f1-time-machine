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

interface SeasonBrief {
  year: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

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

const HomePage = () => {
  const today = new Date().toISOString().split('T')[0];

  const { data: seasons, isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiGet<SeasonBrief[]>('/seasons'),
    staleTime: Infinity,
  });

  // Pick the first historical season (start_date in the past) for "On This Day"
  const historicalSeason = useMemo(() => {
    if (!seasons) return null;
    return seasons.find(s => s.start_date && s.start_date <= today) || null;
  }, [seasons, today]);

  // Use first available season for Season Preview section
  const previewSeason = useMemo(() => {
    if (!seasons || seasons.length === 0) return null;
    return seasons[0];
  }, [seasons]);

  const seasonYear = previewSeason?.year || 2026;

  const { data: todayResponse, isLoading: isLoadingToday } = useQuery({
    queryKey: ['today', historicalSeason?.year, today],
    queryFn: () => daysApi.getToday(historicalSeason!.year),
    enabled: !!historicalSeason,
  });

  const { data: races } = useQuery({
    queryKey: ['races', seasonYear],
    queryFn: () => getRaces(seasonYear),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const { data: regulations } = useQuery({
    queryKey: ['events', seasonYear, 'regulation', 'pre-season'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'regulation', tag: 'pre-season' }),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const { data: transfers } = useQuery({
    queryKey: ['events', seasonYear, 'transfer'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'transfer' }),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const { data: newTeams } = useQuery({
    queryKey: ['events', seasonYear, 'team_entry'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'team_entry' }),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const { data: departedTeams } = useQuery({
    queryKey: ['events', seasonYear, 'team_departure'],
    queryFn: () => getSeasonEvents(seasonYear, { type: 'team_departure' }),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const { data: quotes } = useQuery({
    queryKey: ['quotes', seasonYear],
    queryFn: () => apiGet<Array<{ id: number; text: string; author_name: string; context: string | null }>>(`/seasons/${seasonYear}/quotes`),
    staleTime: Infinity,
    enabled: !!previewSeason,
  });

  const dayData = todayResponse?.day;

  const randomQuote = useMemo(() => {
    if (!quotes || quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [quotes]);

  useEffect(() => {
    document.title = 'F1 Time Machine — Formula 1 Season by Season';
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
        <p style={{ color: '#B0B0B0', fontSize: '20px', marginTop: '8px', marginBottom: '32px' }}>
          Relive Formula 1 seasons, day by day
        </p>

        {/* Season Cards */}
        {isLoadingSeasons ? (
          <LoadingSpinner />
        ) : seasons && seasons.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {seasons.map((s) => (
              <Link
                key={s.year}
                to={`/season/${s.year}/calendar`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    backgroundColor: '#1A1A2E',
                    border: '2px solid #2A2A3E',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
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
                  <div style={{
                    color: '#E10600',
                    fontSize: '48px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}>
                    {s.year}
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                    {s.name}
                  </div>
                  {s.start_date && s.end_date && (
                    <div style={{ color: '#666', fontSize: '13px' }}>
                      {s.start_date} — {s.end_date}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
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
          {historicalSeason && (
            <Link
              to={`/season/${historicalSeason.year}/day/${dayData.date}`}
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
          )}
        </div>
      ) : null}

      {/* Season Preview */}
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
            {seasonYear} Season Preview
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

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        {[
          { to: `/season/${seasonYear}/calendar`, label: 'Calendar', desc: `View the complete ${seasonYear} season calendar` },
          { to: `/season/${seasonYear}/standings`, label: 'Standings', desc: 'Check driver and constructor standings' },
          { to: `/season/${seasonYear}/drivers`, label: 'Drivers', desc: `Explore the ${seasonYear} driver lineup` },
          { to: `/season/${seasonYear}/constructors`, label: 'Constructors', desc: 'Browse all teams' },
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
