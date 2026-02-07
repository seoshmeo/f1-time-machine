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
          margin: 0,
        }}>
          F1 Time Machine — Historical F1 Seasons © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
