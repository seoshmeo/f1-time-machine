import { SeasonEvent } from '../../api/events';

interface TransfersListProps {
  events: SeasonEvent[];
}

const importanceColors: Record<number, string> = {
  1: '#E10600',
  2: '#FF8C00',
  3: '#666',
};

const TransfersList = ({ events }: TransfersListProps) => {
  if (events.length === 0) {
    return (
      <div style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', padding: '16px 0' }}>
        No transfer data available
      </div>
    );
  }

  return (
    <div>
      {events.map((event, index) => (
        <div
          key={event.id}
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            borderBottom: index < events.length - 1 ? '1px solid #2A2A3E' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: importanceColors[event.importance] || '#666',
                marginTop: '6px',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {event.title}
                </div>
                {event.tag_names.includes('mid-season') && (
                  <span
                    style={{
                      backgroundColor: '#2A2A3E',
                      color: '#B0B0B0',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    mid-season
                  </span>
                )}
              </div>
              {event.summary && (
                <div
                  style={{
                    color: '#B0B0B0',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    marginBottom: '4px',
                  }}
                >
                  {event.summary}
                </div>
              )}
              {event.source_url && (
                <div
                  style={{
                    color: '#666',
                    fontSize: '12px',
                    fontStyle: 'italic',
                  }}
                >
                  {event.source_url}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransfersList;
