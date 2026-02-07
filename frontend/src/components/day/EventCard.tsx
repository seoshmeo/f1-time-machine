interface EventCardProps {
  title: string;
  summary: string;
  importance: 'high' | 'medium' | 'low' | number;
  sessionType?: string;
}

const EventCard = ({ title, summary, importance, sessionType }: EventCardProps) => {
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
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      transition: 'border-color 0.2s',
    }}>
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
        </div>

        <p style={{
          color: '#B0B0B0',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0,
        }}>
          {summary}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
