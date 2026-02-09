import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const seasonYear = 2010;

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
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
          }}>
            F1 Time Machine
          </h1>
          <span style={{
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {seasonYear}
          </span>
        </Link>

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
          <Link to={`/season/${seasonYear}/drivers`} style={navLinkStyle('/drivers')}>
            Drivers
          </Link>
          <Link to={`/season/${seasonYear}/constructors`} style={navLinkStyle('/constructors')}>
            Constructors
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
