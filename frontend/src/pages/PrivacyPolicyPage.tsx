import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — F1 Time Machine';
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
        Privacy Policy
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
          <h2 style={headingStyle}>Overview</h2>
          <p style={textStyle}>
            F1 Time Machine (timemachinegp.com) is a non-commercial fan project dedicated to exploring
            Formula 1 history. We are committed to protecting your privacy. This policy explains what
            data we collect — which is essentially nothing.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Data We Collect</h2>
          <p style={{ ...textStyle, fontWeight: 600, color: '#FFFFFF' }}>
            We do not collect any personal data.
          </p>
          <p style={textStyle}>
            Specifically, we do not use:
          </p>
          <ul style={{ ...textStyle, paddingLeft: '24px' }}>
            <li>Google Analytics or any other analytics service</li>
            <li>Cookies of any kind (no tracking cookies, no session cookies, no functional cookies)</li>
            <li>Facebook Pixel, advertising trackers, or any third-party tracking scripts</li>
            <li>User registration, login, or any form of account system</li>
            <li>Contact forms or any mechanism that collects personal information</li>
            <li>Error tracking services (such as Sentry or Datadog)</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Server Logs</h2>
          <p style={textStyle}>
            Our web server (Nginx) maintains standard access logs that may include IP addresses,
            request timestamps, URLs visited, HTTP status codes, and browser user-agent strings.
            These logs are used solely for server maintenance and security purposes. They are not
            shared with third parties and are automatically rotated and deleted.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Theme Customization & AI Processing</h2>
          <p style={textStyle}>
            The site offers an optional "Customize" feature that lets you change the visual appearance
            (colors, fonts, layout). When you use this feature:
          </p>
          <ul style={{ ...textStyle, paddingLeft: '24px' }}>
            <li>
              Your text prompt (e.g., "make it blue") is sent to our server, which forwards it to
              the Anthropic API (Claude) to generate a theme configuration. <strong style={{ color: '#FFFFFF' }}>Only
              the prompt text is sent</strong> — no personal data, IP addresses, cookies, or browser
              fingerprints are included in the request to Anthropic.
            </li>
            <li>
              Anthropic may process and temporarily store the prompt in accordance with their own
              privacy policy (anthropic.com/privacy). We use the API in zero-retention mode where
              prompts are not used for model training.
            </li>
            <li>
              The resulting theme configuration (hex colors, CSS values) is stored in your browser's
              Local Storage under the key <strong style={{ color: '#FFFFFF' }}>f1tm_custom_theme</strong>.
              This data stays on your device, is never sent back to our server, and can be cleared
              at any time via the "Reset" button.
            </li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Third-Party Services</h2>
          <p style={textStyle}>
            The only third-party service used is the Anthropic API, which processes theme customization
            prompts when you explicitly use the "Customize" feature. No third-party service is contacted
            during normal browsing. All website assets (JavaScript, CSS, fonts) are served directly from
            our own server.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Data Storage</h2>
          <p style={textStyle}>
            We use Local Storage to store two non-personal values in your browser:
          </p>
          <ul style={{ ...textStyle, paddingLeft: '24px' }}>
            <li><strong style={{ color: '#FFFFFF' }}>cookie_consent_dismissed</strong> — whether you've dismissed the info banner</li>
            <li><strong style={{ color: '#FFFFFF' }}>f1tm_custom_theme</strong> — your custom theme preferences (colors, fonts, layout)</li>
          </ul>
          <p style={textStyle}>
            Additionally, the application uses an in-memory cache (React Query) to hold API responses
            temporarily in your browser's RAM. This data disappears when you close the tab.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Children's Privacy</h2>
          <p style={textStyle}>
            Since we do not collect any personal data from anyone, there are no special concerns
            regarding children's privacy.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>Changes to This Policy</h2>
          <p style={textStyle}>
            If we ever change our data practices (for example, by adding analytics), we will update
            this policy accordingly. The "last updated" date at the top of this page will reflect
            the most recent revision.
          </p>
        </div>

        <div style={{ marginBottom: 0 }}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={textStyle}>
            If you have questions about this privacy policy, you can reach us through the project's
            GitHub repository.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link to="/cookie-policy" style={{ color: '#E10600', textDecoration: 'none', fontSize: '14px' }}>
          Cookie Policy
        </Link>
        <span style={{ color: '#666', margin: '0 12px' }}>|</span>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
