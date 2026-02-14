import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('cookie_consent_dismissed');
    if (!dismissed) {
      // Show banner with a slight delay for slide-up animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissing(true);
    // Wait for slide-down animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem('cookie_consent_dismissed', 'true');
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1A1A2E',
        borderTop: '1px solid #2A2A3E',
        padding: '20px 24px',
        zIndex: 9999,
        transform: isDismissing ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: '1 1 auto',
            minWidth: '280px',
          }}
        >
          <p
            style={{
              color: '#B0B0B0',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 8px 0',
            }}
          >
            This website does not use cookies or tracking. We respect your privacy.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/privacy-policy"
              style={{
                color: '#E10600',
                fontSize: '13px',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookie-policy"
              style={{
                color: '#E10600',
                fontSize: '13px',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C40500')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E10600')}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
