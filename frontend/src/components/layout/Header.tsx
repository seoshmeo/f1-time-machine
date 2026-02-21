import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import CustomizeDialog from '../customize/CustomizeDialog';

interface SeasonBrief {
  year: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

const MOBILE_BREAKPOINT = 768;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const pathMatch = location.pathname.match(/\/season\/(\d{4})/);
  const seasonYear = pathMatch ? parseInt(pathMatch[1]) : 2026;

  const { data: seasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiGet<SeasonBrief[]>('/seasons'),
    staleTime: Infinity,
  });

  const isActive = (path: string) => location.pathname.includes(path);

  const handleSeasonClick = useCallback((year: number) => {
    if (pathMatch) {
      navigate(location.pathname.replace(/\/season\/\d{4}/, `/season/${year}`));
    } else {
      navigate(`/season/${year}/calendar`);
    }
  }, [pathMatch, location.pathname, navigate]);

  const navLinks = [
    { path: '/calendar', label: 'Calendar' },
    { path: '/races', label: 'Races' },
    { path: '/standings', label: 'Standings' },
    { path: '/head-to-head', label: 'H2H' },
    { path: '/drivers', label: 'Drivers' },
    { path: '/constructors', label: 'Teams' },
  ];

  return (
    <header style={{
      backgroundColor: '#1A1A2E',
      borderBottom: '1px solid #2A2A3E',
      padding: isMobile ? '10px 0' : '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '32px',
      }}>
        {/* Logo + Season buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 0,
        }}>
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 700,
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              F1 Time Machine
            </h1>
          </Link>
          {seasons && seasons.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {seasons.map((s) => (
                <button
                  key={s.year}
                  onClick={() => handleSeasonClick(s.year)}
                  style={{
                    backgroundColor: s.year === seasonYear ? '#E10600' : 'transparent',
                    color: '#FFFFFF',
                    padding: isMobile ? '4px 10px' : '6px 14px',
                    borderRadius: '4px',
                    fontSize: isMobile ? '12px' : '14px',
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

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '8px' }}>
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={`/season/${seasonYear}${path}`}
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderBottom: isActive(path) ? '2px solid #E10600' : '2px solid transparent',
                  transition: 'border-color 0.2s',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => setCustomizeOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'transparent',
                color: '#B0B0B0',
                border: '1px solid #2A2A3E',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E10600'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A3E'; e.currentTarget.style.color = '#B0B0B0'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Customize
            </button>
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
        )}

        {/* Hamburger button */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              flexShrink: 0,
            }}
          >
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              transition: 'transform 0.3s, opacity 0.3s',
              transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              transition: 'opacity 0.3s',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              transition: 'transform 0.3s, opacity 0.3s',
              transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            }} />
          </button>
        )}
      </div>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1A1A2E',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '60px',
          overflowY: 'auto',
        }}>
          {/* Close button at top-right */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              transform: 'translateY(7px) rotate(45deg)',
            }} />
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              opacity: 0,
            }} />
            <span style={{
              display: 'block',
              width: '22px',
              height: '2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '1px',
              transform: 'translateY(-7px) rotate(-45deg)',
            }} />
          </button>

          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={`/season/${seasonYear}${path}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 500,
                borderLeft: isActive(path) ? '3px solid #E10600' : '3px solid transparent',
                backgroundColor: isActive(path) ? 'rgba(225, 6, 0, 0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ padding: '16px 24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => { setMenuOpen(false); setCustomizeOpen(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'transparent',
                color: '#B0B0B0',
                border: '1px solid #2A2A3E',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                width: '100%',
                cursor: 'pointer',
              }}
            >
              Customize Theme
            </button>
            <a
              href="https://www.donationalerts.com/r/seoshmeo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#F57D07',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                width: '100%',
              }}
            >
              <img
                src="https://www.donationalerts.com/img/brand/da.svg"
                alt="DonationAlerts"
                style={{ width: '20px', height: '20px' }}
              />
              Support the project
            </a>
          </div>
        </nav>
      )}
      <CustomizeDialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </header>
  );
};

export default Header;
