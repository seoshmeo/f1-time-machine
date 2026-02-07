import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daysApi } from '../api/days';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventCard from '../components/day/EventCard';
import QuoteCard from '../components/article/QuoteCard';

const HomePage = () => {
  const seasonYear = 2010;
  const today = new Date().toISOString().split('T')[0];

  const { data: dayData, isLoading } = useQuery({
    queryKey: ['today', seasonYear, today],
    queryFn: () => daysApi.getToday(seasonYear),
  });

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
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
          <span style={{
            color: '#B0B0B0',
            fontSize: '20px',
          }}>
            Relive the
          </span>
          <span style={{
            color: '#E10600',
            fontSize: '32px',
            fontWeight: 700,
          }}>
            {seasonYear}
          </span>
          <span style={{
            color: '#B0B0B0',
            fontSize: '20px',
          }}>
            Season
          </span>
        </div>
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginTop: '24px',
        }}>
          Experience the 2010 Formula 1 season day by day
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : dayData && dayData.events.length > 0 ? (
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
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
              transition: 'background-color 0.2s',
            }}
          >
            View Full Day
          </Link>
        </div>
      ) : null}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        <Link
          to={`/season/${seasonYear}/calendar`}
          style={{
            textDecoration: 'none',
          }}
        >
          <div style={{
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
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>📅</div>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}>
              Calendar
            </h3>
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              margin: 0,
            }}>
              View the complete 2010 season calendar
            </p>
          </div>
        </Link>

        <Link
          to={`/season/${seasonYear}/standings`}
          style={{
            textDecoration: 'none',
          }}
        >
          <div style={{
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
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>🏆</div>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}>
              Standings
            </h3>
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              margin: 0,
            }}>
              Check driver and constructor standings
            </p>
          </div>
        </Link>

        <Link
          to={`/season/${seasonYear}/drivers`}
          style={{
            textDecoration: 'none',
          }}
        >
          <div style={{
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
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>🏎️</div>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}>
              Drivers
            </h3>
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              margin: 0,
            }}>
              Explore the 2010 driver lineup
            </p>
          </div>
        </Link>
      </div>

      <QuoteCard
        quote="This is going to be the most competitive season we've ever seen in Formula 1"
        author="Martin Brundle"
        context="Pre-season prediction, 2010"
      />
    </div>
  );
};

export default HomePage;
