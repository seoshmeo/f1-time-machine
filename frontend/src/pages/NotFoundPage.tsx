import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '64px 48px',
        maxWidth: '600px',
      }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 700,
          color: '#E10600',
          lineHeight: 1,
          marginBottom: '24px',
        }}>
          404
        </div>

        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: 700,
          margin: '0 0 16px 0',
        }}>
          Page Not Found
        </h1>

        <p style={{
          color: '#B0B0B0',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '14px 32px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
