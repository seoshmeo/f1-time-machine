const AboutPage = () => {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '48px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '36px',
          fontWeight: 700,
          margin: '0 0 24px 0',
        }}>
          About F1 Time Machine
        </h1>

        <div style={{
          color: '#B0B0B0',
          fontSize: '16px',
          lineHeight: '1.8',
        }}>
          <p style={{ marginTop: 0 }}>
            F1 Time Machine is a comprehensive historical archive of the 2010 Formula 1 season,
            allowing you to experience the championship battle day by day.
          </p>

          <p>
            Navigate through the season using our interactive calendar, explore race results,
            track championship standings, and discover historical articles and quotes from
            one of the most competitive seasons in F1 history.
          </p>

          <h2 style={{
            color: '#E10600',
            fontSize: '24px',
            fontWeight: 700,
            marginTop: '32px',
            marginBottom: '16px',
          }}>
            Features
          </h2>

          <ul style={{
            paddingLeft: '24px',
          }}>
            <li style={{ marginBottom: '12px' }}>
              Day-by-day navigation through the 2010 season
            </li>
            <li style={{ marginBottom: '12px' }}>
              Complete race results, qualifying times, and practice sessions
            </li>
            <li style={{ marginBottom: '12px' }}>
              Interactive championship standings with progression charts
            </li>
            <li style={{ marginBottom: '12px' }}>
              Driver profiles and season statistics
            </li>
            <li style={{ marginBottom: '12px' }}>
              Historical articles and memorable quotes
            </li>
            <li style={{ marginBottom: '12px' }}>
              Visual calendar with color-coded event types
            </li>
          </ul>

          <p style={{ marginBottom: 0 }}>
            Built with modern web technologies to provide a fast, responsive experience
            across all devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
