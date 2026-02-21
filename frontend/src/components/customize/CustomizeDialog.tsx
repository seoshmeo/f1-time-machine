import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { customizeTheme } from '../../api/customize';

interface Message {
  role: 'user' | 'ai';
  text: string;
  isError?: boolean;
}

const PRESETS = [
  { label: 'Ocean Blue', prompt: 'Ocean blue theme with deep navy backgrounds and cyan accents' },
  { label: 'Warm Red', prompt: 'Warm red theme with dark burgundy backgrounds and bright red accents' },
  { label: 'Neon Green', prompt: 'Neon green cyberpunk theme with dark backgrounds and bright green accents' },
  { label: 'Classic Light', prompt: 'Clean light theme with white backgrounds, dark text, and subtle gray accents' },
];

const MOBILE_BREAKPOINT = 768;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CustomizeDialog({ open, onClose }: Props) {
  const { theme, applyTheme, resetTheme, isCustomized } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [confirmReset, setConfirmReset] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rate limit countdown timer
  useEffect(() => {
    if (!rateLimitUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= rateLimitUntil) {
        setRateLimitUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitUntil]);

  const sendPrompt = useCallback(async (prompt: string, presetLabel?: string) => {
    if (!prompt.trim() || loading || rateLimitUntil) return;

    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const res = await customizeTheme(prompt, theme);
      if (res.theme && Object.keys(res.theme).length > 0) {
        applyTheme(res.theme);
        setActivePreset(presetLabel || null);
      }
      setMessages(prev => [...prev, { role: 'ai', text: res.message }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      const isRateLimit = msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('busy');
      if (isRateLimit) {
        setRateLimitUntil(Date.now() + 60_000);
      }
      setMessages(prev => [...prev, { role: 'ai', text: msg, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [loading, theme, applyTheme, rateLimitUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetTheme();
    setMessages(prev => [...prev, { role: 'ai', text: 'Theme reset to defaults.' }]);
    setActivePreset(null);
    setConfirmReset(false);
  };

  const rateLimitSeconds = rateLimitUntil ? Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000)) : 0;

  if (!open) return null;

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        left: 0,
        right: 0,
        height: '85vh',
        backgroundColor: '#1A1A2E',
        borderRadius: '16px 16px 0 0',
        zIndex: 1060,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '380px',
        backgroundColor: '#1A1A2E',
        zIndex: 1060,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.3s ease-out',
      };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1055,
        }}
      />

      {/* Panel */}
      <div style={panelStyle}>
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0 4px',
          }}>
            <div style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#707070',
            }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #2A2A3E',
          flexShrink: 0,
        }}>
          <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>
            Customize Theme
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isCustomized && (
              confirmReset ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ color: '#B0B0B0', fontSize: '12px' }}>Sure?</span>
                  <button
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: '1px solid #E10600',
                      color: '#E10600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    style={{
                      background: 'none',
                      border: '1px solid #707070',
                      color: '#B0B0B0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: '1px solid #707070',
                    color: '#B0B0B0',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                color: '#B0B0B0',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {messages.length === 0 && (
            <div style={{ color: '#707070', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
              Describe how you want the site to look, or pick a preset below.
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.5,
                backgroundColor: msg.role === 'user'
                  ? '#E10600'
                  : msg.isError
                    ? 'rgba(225, 6, 0, 0.15)'
                    : '#2A2A3E',
                color: msg.isError ? '#FF6B6B' : '#FFFFFF',
                border: msg.isError ? '1px solid rgba(225, 6, 0, 0.3)' : 'none',
              }}
            >
              {msg.isError && <span style={{ marginRight: '6px' }}>⚠</span>}
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: '#2A2A3E',
              color: '#B0B0B0',
              fontSize: '14px',
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset chips */}
        <div style={{
          padding: '8px 16px',
          overflowX: 'auto',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
          WebkitOverflowScrolling: 'touch',
        }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => sendPrompt(p.prompt, p.label)}
              disabled={loading || !!rateLimitUntil}
              style={{
                flexShrink: 0,
                height: '36px',
                padding: '0 14px',
                borderRadius: '18px',
                border: activePreset === p.label ? '1px solid #E10600' : '1px solid #2A2A3E',
                backgroundColor: activePreset === p.label ? 'rgba(225, 6, 0, 0.15)' : 'transparent',
                color: activePreset === p.label ? '#E10600' : '#B0B0B0',
                fontSize: '13px',
                cursor: loading || rateLimitUntil ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Rate limit warning */}
        {rateLimitUntil && rateLimitSeconds > 0 && (
          <div style={{
            padding: '6px 16px',
            color: '#FF6B6B',
            fontSize: '12px',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            Rate limited. Try again in {rateLimitSeconds}s
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            paddingBottom: isMobile ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : '12px',
            borderTop: '1px solid #2A2A3E',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. make it blue and modern"
            disabled={loading || !!rateLimitUntil}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #2A2A3E',
              backgroundColor: '#0F0F0F',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !!rateLimitUntil}
            style={{
              minHeight: '44px',
              padding: '0 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading || !input.trim() || rateLimitUntil ? '#555' : '#E10600',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !input.trim() || rateLimitUntil ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
