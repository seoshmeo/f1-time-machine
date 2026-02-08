import { useState } from 'react';
import SessionResultsInline from './SessionResultsInline';

interface EventCardProps {
  title: string;
  summary: string;
  importance: 'high' | 'medium' | 'low' | number;
  sessionType?: string;
  sessionId?: number | null;
  eventType?: string;
}

const EventCard = ({ title, summary, importance, sessionType, sessionId, eventType }: EventCardProps) => {
  const hasResults = !!sessionId;
  const [expanded, setExpanded] = useState(hasResults);

  const getImportanceColor = (level: 'high' | 'medium' | 'low' | number) => {
    if (typeof level === 'string') {
      switch (level) {
        case 'high': return '#E10600'; // Red
        case 'medium': return '#FF8C00'; // Orange
        case 'low': return '#4A90E2'; // Blue
        default: return '#666'; // Gray
      }
    } else {
      switch (level) {
        case 1: return '#E10600'; // Red
        case 2: return '#FF8C00'; // Orange
        case 3: return '#4A90E2'; // Blue
        default: return '#666'; // Gray
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '20px',
        transition: 'border-color 0.2s',
        cursor: hasResults ? 'pointer' : 'default',
      }}
      onClick={hasResults ? () => setExpanded(!expanded) : undefined}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getImportanceColor(importance),
          flexShrink: 0,
          marginTop: '4px',
        }} />

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 700,
              margin: 0,
            }}>
              {title}
            </h3>
            {sessionType && (
              <span style={{
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {sessionType}
              </span>
            )}
            {hasResults && (
              <span style={{
                color: '#666',
                fontSize: '12px',
                marginLeft: 'auto',
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                &#9660;
              </span>
            )}
          </div>

          {summary && (
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {summary}
            </p>
          )}

          {hasResults && !expanded && (
            <p style={{
              color: '#4A90E2',
              fontSize: '12px',
              margin: '8px 0 0 0',
            }}>
              Click to view results
            </p>
          )}
        </div>
      </div>

      {expanded && sessionId && (
        <div onClick={(e) => e.stopPropagation()}>
          <SessionResultsInline sessionId={sessionId} eventType={eventType || ''} />
        </div>
      )}
    </div>
  );
};

export default EventCard;
