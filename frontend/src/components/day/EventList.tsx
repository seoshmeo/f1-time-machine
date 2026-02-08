import EventCard from './EventCard';
import { DayEvent } from '../../types';

interface EventListProps {
  events: DayEvent[];
}

const EventList = ({ events }: EventListProps) => {
  if (events.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#666',
          fontSize: '14px',
          margin: 0,
        }}>
          No events on this day
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {events.map((event, index) => (
        <EventCard
          key={index}
          title={event.title}
          summary={event.summary}
          importance={event.importance}
          sessionType={event.session_type}
          sessionId={event.session_id}
          eventType={event.type || event.event_type}
        />
      ))}
    </div>
  );
};

export default EventList;
