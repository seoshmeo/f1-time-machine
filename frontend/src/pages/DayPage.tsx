import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import { useDay, useDayNavigation } from '../hooks/useDay';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useStandings } from '../hooks/useStandings';
import { useIsMobile } from '../hooks/useIsMobile';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DayNavigation from '../components/day/DayNavigation';
import EventList from '../components/day/EventList';
import DayCard from '../components/day/DayCard';
import DayTimeline from '../components/day/DayTimeline';
import ArticleCard from '../components/article/ArticleCard';
import QuoteCard from '../components/article/QuoteCard';
import Sidebar from '../components/layout/Sidebar';
import DriverStandingsTable from '../components/standings/DriverStandingsTable';
import ChampionshipFinalePreview from '../components/day/ChampionshipFinalePreview';
import PostRaceStandings from '../components/day/PostRaceStandings';
import type { PostRaceConfig } from '../components/day/PostRaceStandings';

const POST_RACE_MONDAYS_2010: Record<string, PostRaceConfig> = {
  '2010-03-15': { round: 1, raceName: 'Bahrain Grand Prix', raceDate: '2010-03-14', circuitName: 'Bahrain International Circuit', circuitCountry: 'Bahrain' },
  '2010-03-29': { round: 2, raceName: 'Australian Grand Prix', raceDate: '2010-03-28', circuitName: 'Albert Park Grand Prix Circuit', circuitCountry: 'Australia' },
  '2010-04-05': { round: 3, raceName: 'Malaysian Grand Prix', raceDate: '2010-04-04', circuitName: 'Sepang International Circuit', circuitCountry: 'Malaysia' },
  '2010-04-19': { round: 4, raceName: 'Chinese Grand Prix', raceDate: '2010-04-18', circuitName: 'Shanghai International Circuit', circuitCountry: 'China' },
  '2010-05-10': { round: 5, raceName: 'Spanish Grand Prix', raceDate: '2010-05-09', circuitName: 'Circuit de Barcelona-Catalunya', circuitCountry: 'Spain' },
  '2010-05-17': { round: 6, raceName: 'Monaco Grand Prix', raceDate: '2010-05-16', circuitName: 'Circuit de Monaco', circuitCountry: 'Monaco' },
  '2010-05-31': { round: 7, raceName: 'Turkish Grand Prix', raceDate: '2010-05-30', circuitName: 'Istanbul Park', circuitCountry: 'Turkey' },
  '2010-06-14': { round: 8, raceName: 'Canadian Grand Prix', raceDate: '2010-06-13', circuitName: 'Circuit Gilles Villeneuve', circuitCountry: 'Canada' },
  '2010-06-28': { round: 9, raceName: 'European Grand Prix', raceDate: '2010-06-27', circuitName: 'Valencia Street Circuit', circuitCountry: 'Spain' },
  '2010-07-12': { round: 10, raceName: 'British Grand Prix', raceDate: '2010-07-11', circuitName: 'Silverstone Circuit', circuitCountry: 'UK' },
  '2010-07-26': { round: 11, raceName: 'German Grand Prix', raceDate: '2010-07-25', circuitName: 'Hockenheimring', circuitCountry: 'Germany' },
  '2010-08-02': { round: 12, raceName: 'Hungarian Grand Prix', raceDate: '2010-08-01', circuitName: 'Hungaroring', circuitCountry: 'Hungary' },
  '2010-08-30': { round: 13, raceName: 'Belgian Grand Prix', raceDate: '2010-08-29', circuitName: 'Circuit de Spa-Francorchamps', circuitCountry: 'Belgium' },
  '2010-09-13': { round: 14, raceName: 'Italian Grand Prix', raceDate: '2010-09-12', circuitName: 'Autodromo Nazionale di Monza', circuitCountry: 'Italy' },
  '2010-09-27': { round: 15, raceName: 'Singapore Grand Prix', raceDate: '2010-09-26', circuitName: 'Marina Bay Street Circuit', circuitCountry: 'Singapore' },
  '2010-10-11': { round: 16, raceName: 'Japanese Grand Prix', raceDate: '2010-10-10', circuitName: 'Suzuka Circuit', circuitCountry: 'Japan' },
  '2010-10-25': { round: 17, raceName: 'Korean Grand Prix', raceDate: '2010-10-24', circuitName: 'Korean International Circuit', circuitCountry: 'Korea' },
  '2010-11-08': { round: 18, raceName: 'Brazilian Grand Prix', raceDate: '2010-11-07', circuitName: 'Autódromo José Carlos Pace', circuitCountry: 'Brazil' },
  '2010-11-15': { round: 19, raceName: 'Abu Dhabi Grand Prix', raceDate: '2010-11-14', circuitName: 'Yas Marina Circuit', circuitCountry: 'UAE' },
};

const DayPage = () => {
  const isMobile = useIsMobile();
  const { year, date } = useParams<{ year: string; date: string }>();
  const navigate = useNavigate();
  const seasonYear = parseInt(year || '2026');
  const currentDate = date || '';

  const { data: seasonData } = useQuery({
    queryKey: ['season', seasonYear],
    queryFn: () => apiGet<{ total_races: number }>(`/seasons/${seasonYear}`),
    staleTime: Infinity,
  });

  const { data: dayData, isLoading, error } = useDay(seasonYear, currentDate);
  const { data: navData } = useDayNavigation(seasonYear, currentDate);
  const standingsRound = dayData?.season_progress?.races_completed || seasonData?.total_races || 1;
  const { data: standingsData } = useStandings(seasonYear, standingsRound);

  const postRaceConfig = useMemo(() => {
    if (seasonYear === 2010) return POST_RACE_MONDAYS_2010[currentDate] || null;
    return null;
  }, [seasonYear, currentDate]);

  useEffect(() => {
    if (currentDate) {
      const meta = document.querySelector('meta[name="description"]');
      if (seasonYear === 2010 && currentDate === '2010-11-11') {
        document.title = 'F1 2010 Championship Standings Before Abu Dhabi Finale — Alonso vs Webber vs Vettel vs Hamilton | F1 Time Machine';
        if (meta) {
          meta.setAttribute('content',
            '2010 F1 championship standings before the Abu Dhabi finale. Alonso 246 pts, Webber 238, Vettel 231, Hamilton 222. Four drivers can win the title — see what each needs to become World Champion.'
          );
        }
      } else if (postRaceConfig) {
        document.title = `Results After the ${postRaceConfig.raceName} 2010 — F1 Standings After Round ${postRaceConfig.round} | F1 Time Machine`;
        if (meta) {
          meta.setAttribute('content',
            `F1 2010 ${postRaceConfig.raceName} results and championship standings after Round ${postRaceConfig.round}. Race classification, points scored, and updated driver standings at ${postRaceConfig.circuitName}, ${postRaceConfig.circuitCountry}.`
          );
        }
      } else {
        const formatted = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const dayTypeLabels: Record<string, string> = {
          race_day: 'Race',
          quali_day: 'Qualifying',
          practice_day: 'Practice',
          sprint_day: 'Sprint',
          sprint_quali_day: 'Sprint Qualifying',
          test_day: 'Testing',
        };
        const sessionLabel = dayData ? dayTypeLabels[dayData.day_type] : null;
        const raceName = dayData?.race_name;

        if (sessionLabel && raceName) {
          document.title = `${sessionLabel} — ${raceName} — ${formatted} | F1 Time Machine`;
          if (meta) {
            meta.setAttribute('content',
              `F1 ${seasonYear} ${sessionLabel} at the ${raceName}, ${formatted}. Live results, standings, and day-by-day coverage.`
            );
          }
        } else if (sessionLabel) {
          document.title = `${sessionLabel} — ${formatted} | F1 Time Machine`;
          if (meta) {
            meta.setAttribute('content',
              `F1 ${seasonYear} ${sessionLabel}, ${formatted}. Day-by-day Formula 1 coverage.`
            );
          }
        } else {
          document.title = `${formatted} — ${seasonYear} F1 Season | F1 Time Machine`;
          if (meta) {
            meta.setAttribute('content',
              `F1 Time Machine — Explore the ${seasonYear} Formula 1 season day by day. Race calendars, driver lineups, standings, regulations and more.`
            );
          }
        }
      }
    }
  }, [currentDate, seasonYear, postRaceConfig, dayData]);

  const handlePrevDay = () => {
    if (navData?.prev_date) {
      navigate(`/season/${seasonYear}/day/${navData.prev_date}`);
    }
  };

  const handleNextDay = () => {
    if (navData?.next_date) {
      navigate(`/season/${seasonYear}/day/${navData.next_date}`);
    }
  };

  useKeyboardNav({
    onPrevious: handlePrevDay,
    onNext: handleNextDay,
    enabled: !isLoading && !!dayData && !!navData,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dayData) {
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
            Day Not Found
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load data for this day
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {dayData.season_progress && (
        <DayTimeline
          currentDay={dayData.season_progress.days_elapsed || 1}
          totalDays={dayData.season_progress.total_days || 365}
        />
      )}

      <DayNavigation
        currentDate={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        canGoPrev={!!navData?.prev_date}
        canGoNext={!!navData?.next_date}
      />

      {seasonYear === 2010 && currentDate === '2010-11-11' && (
        <ChampionshipFinalePreview year={2010} preFinaleRound={18} />
      )}

      {postRaceConfig && (
        <PostRaceStandings
          year={seasonYear}
          config={postRaceConfig}
          totalRaces={seasonData?.total_races || 19}
        />
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 350px',
        gap: '24px',
      }}>
        <div>
          <DayCard title="Events">
            <EventList events={dayData.events} />
          </DayCard>

          {dayData.articles && dayData.articles.length > 0 && (
            <DayCard title="News & Articles">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {dayData.articles.map((article, index) => (
                  <ArticleCard key={index} article={article} />
                ))}
              </div>
            </DayCard>
          )}

          {dayData.quotes && dayData.quotes.length > 0 && (
            <DayCard title="Quotes">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {dayData.quotes.map((quote, index) => (
                  <QuoteCard
                    key={index}
                    quote={quote.quote_text}
                    author={quote.speaker}
                    context={quote.context}
                  />
                ))}
              </div>
            </DayCard>
          )}
        </div>

        <Sidebar>
          {standingsData?.driver_standings && (
            <DayCard title="Driver Standings">
              <DriverStandingsTable standings={standingsData.driver_standings.slice(0, 10)} />
            </DayCard>
          )}
        </Sidebar>
      </div>
    </div>
  );
};

export default DayPage;
