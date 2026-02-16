import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1A1A2E',
      borderTop: '1px solid #2A2A3E',
      padding: '24px 0',
      marginTop: '64px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#666',
          fontSize: '14px',
          margin: '0 0 8px 0',
        }}>
          F1 Time Machine — Historical F1 Seasons © {new Date().getFullYear()}
        </p>
        <p style={{
          color: '#555',
          fontSize: '12px',
          margin: '0 0 8px 0',
        }}>
          This is an unofficial fan project and is not associated in any way with the Formula 1 companies.
          F1, Formula One, Formula 1, FIA Formula One World Championship, Grand Prix and related marks
          are trademarks of Formula One Licensing B.V.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/privacy-policy" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link to="/cookie-policy" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
