import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

interface SeasonBrief {
  year: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathMatch = location.pathname.match(/\/season\/(\d{4})/);
  const seasonYear = pathMatch ? parseInt(pathMatch[1]) : 2026;

  const { data: seasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiGet<SeasonBrief[]>('/seasons'),
    staleTime: Infinity,
  });

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navLinkStyle = (path: string) => ({
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '8px 16px',
    borderBottom: isActive(path) ? '2px solid #E10600' : '2px solid transparent',
    transition: 'border-color 0.2s',
    fontSize: '14px',
    fontWeight: 500,
  });


  return (
    <header style={{
      backgroundColor: '#1A1A2E',
      borderBottom: '1px solid #2A2A3E',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
          }}>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              margin: 0,
            }}>
              F1 Time Machine
            </h1>
          </Link>
          {seasons && seasons.length > 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {seasons.map((s) => (
                <button
                  key={s.year}
                  onClick={() => {
                    if (pathMatch) {
                      navigate(location.pathname.replace(/\/season\/\d{4}/, `/season/${s.year}`));
                    } else {
                      navigate(`/season/${s.year}/calendar`);
                    }
                  }}
                  style={{
                    backgroundColor: s.year === seasonYear ? '#E10600' : 'transparent',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: s.year === seasonYear ? 'none' : '1px solid #555',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.year}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav style={{
          display: 'flex',
          gap: '8px',
        }}>
          <Link to={`/season/${seasonYear}/calendar`} style={navLinkStyle('/calendar')}>
            Calendar
          </Link>
          <Link to={`/season/${seasonYear}/races`} style={navLinkStyle('/races')}>
            Races
          </Link>
          <Link to={`/season/${seasonYear}/standings`} style={navLinkStyle('/standings')}>
            Standings
          </Link>
          <Link to={`/season/${seasonYear}/head-to-head`} style={navLinkStyle('/head-to-head')}>
            Head-to-Head
          </Link>
          <Link to={`/season/${seasonYear}/drivers`} style={navLinkStyle('/drivers')}>
            Drivers
          </Link>
          <Link to={`/season/${seasonYear}/constructors`} style={navLinkStyle('/constructors')}>
            Constructors
          </Link>
        </nav>

        <a
          href="https://www.donationalerts.com/r/seoshmeo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F57D07',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <img
            src="https://www.donationalerts.com/img/brand/da.svg"
            alt="DonationAlerts"
            style={{ width: '20px', height: '20px' }}
          />
          Support the project
        </a>
      </div>
    </header>
  );
};

export default Header;
