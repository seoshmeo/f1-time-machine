import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { customizeTheme } from '../../api/customize';

interface Message {
  role: 'user' | 'ai';
  text: string;
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

  const sendPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const res = await customizeTheme(prompt, theme);
      if (res.theme && Object.keys(res.theme).length > 0) {
        applyTheme(res.theme);
      }
      setMessages(prev => [...prev, { role: 'ai', text: res.message }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev => [...prev, { role: 'ai', text: msg }]);
    } finally {
      setLoading(false);
    }
  }, [loading, theme, applyTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleReset = () => {
    resetTheme();
    setMessages(prev => [...prev, { role: 'ai', text: 'Theme reset to defaults.' }]);
  };

  if (!open) return null;

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        bottom: 0,
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
                backgroundColor: msg.role === 'user' ? '#E10600' : '#2A2A3E',
                color: '#FFFFFF',
              }}
            >
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
              onClick={() => sendPrompt(p.prompt)}
              disabled={loading}
              style={{
                flexShrink: 0,
                height: '36px',
                padding: '0 14px',
                borderRadius: '18px',
                border: '1px solid #2A2A3E',
                backgroundColor: 'transparent',
                color: '#B0B0B0',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

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
            disabled={loading}
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
            disabled={loading || !input.trim()}
            style={{
              minHeight: '44px',
              padding: '0 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading || !input.trim() ? '#555' : '#E10600',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
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
