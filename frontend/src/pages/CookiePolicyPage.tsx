import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const CookiePolicyPage = () => {
  useEffect(() => {
    document.title = 'Cookie Policy — F1 Time Machine';
  }, []);

  const sectionStyle = {
    marginBottom: '32px',
  };

  const headingStyle = {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: 700 as const,
    margin: '0 0 12px 0',
  };

  const textStyle = {
    color: '#B0B0B0',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 12px 0',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0' }}>
        Cookie Policy
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '40px' }}>
        Last updated: February 21, 2026
      </p>

      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '40px',
      }}>
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Short Version</h2>
          <p style={{ ...textStyle, fontWeight: 600, color: '#FFFFFF', fontSize: '16px' }}>
            This website does not use cookies. At all.
          </p>
          <p style={textStyle}>
            You won't see a cookie banner on this site because there are no cookies to consent to.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>What Are Cookies?</h2>
          <p style={textStyle}>
            Cookies are small text files that websites store on your device to remember preferences,
            track sessions, or collect analytics data. Many websites use them for advertising,
            analytics, and user authentication.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Our Approach</h2>
          <p style={textStyle}>
            F1 Time Machine is a simple, read-only reference site. We have no need for cookies because:
          </p>
          <ul style={{ ...textStyle, paddingLeft: '24px' }}>
            <li>There are no user accounts or login functionality</li>
            <li>There is no advertising on this site</li>
            <li>We do not use any analytics services (no Google Analytics, no Plausible, nothing)</li>
            <li>We do not track user behavior or browsing patterns</li>
            <li>The optional theme customization feature stores preferences only in your browser's Local Storage</li>
            <li>We do not use any third-party services that set cookies</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Local Storage</h2>
          <p style={textStyle}>
            We use Local Storage to store a small amount of non-personal preference data directly
            in your browser. This data never leaves your device and is not sent to any server.
          </p>
          <ul style={{ ...textStyle, paddingLeft: '24px' }}>
            <li>
              <strong style={{ color: '#FFFFFF' }}>cookie_consent_dismissed</strong> — remembers
              that you dismissed the cookie consent banner so it is not shown on every visit.
            </li>
            <li>
              <strong style={{ color: '#FFFFFF' }}>f1tm_custom_theme</strong> — stores your custom
              theme preferences (colors, fonts, layout settings) if you use the "Customize" feature.
              This data contains only visual configuration values (hex colors, CSS sizes) and no
              personal information. You can clear it at any time by clicking "Reset" in the
              Customize dialog.
            </li>
          </ul>
          <p style={textStyle}>
            Beyond this, the only client-side data storage is React Query's in-memory cache,
            which holds API responses temporarily in your browser's RAM to avoid redundant
            network requests. This data is never written to disk and disappears completely when
            you close the tab.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Third-Party Cookies</h2>
          <p style={textStyle}>
            Since we do not embed any third-party content (no social media widgets, no external
            fonts, no advertising networks, no embedded videos), there are no third-party cookies
            either.
          </p>
        </div>

        <div style={{ marginBottom: 0 }}>
          <h2 style={headingStyle}>Changes</h2>
          <p style={textStyle}>
            If we ever introduce features that require cookies (such as user preferences or
            authentication), we will update this policy and implement appropriate consent mechanisms
            as required by applicable law.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link to="/privacy-policy" style={{ color: '#E10600', textDecoration: 'none', fontSize: '14px' }}>
          Privacy Policy
        </Link>
        <span style={{ color: '#666', margin: '0 12px' }}>|</span>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
