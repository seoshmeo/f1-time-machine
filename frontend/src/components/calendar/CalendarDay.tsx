import { useNavigate } from 'react-router-dom';

interface CalendarDayProps {
  date: string;
  dayNumber: number;
  type: 'race_day' | 'quali_day' | 'practice_day' | 'test_day' | 'off_day' | 'outside_month';
  raceName?: string;
  year: number;
}

const CalendarDay = ({ date, dayNumber, type, raceName, year }: CalendarDayProps) => {
  const navigate = useNavigate();

  const getBackgroundColor = () => {
    switch (type) {
      case 'race_day': return '#E10600';
      case 'quali_day': return '#FF8C00';
      case 'practice_day': return '#FFD700';
      case 'test_day': return '#4A90E2';
      case 'outside_month': return 'transparent';
      default: return '#1A1A2E';
    }
  };

  const getTextColor = () => {
    if (type === 'outside_month') return '#444';
    if (type === 'off_day') return '#666';
    return '#FFFFFF';
  };

  const handleClick = () => {
    if (type !== 'outside_month' && type !== 'off_day') {
      navigate(`/season/${year}/day/${date}`);
    }
  };

  const isClickable = type !== 'outside_month' && type !== 'off_day';

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: getBackgroundColor(),
        border: '1px solid #2A2A3E',
        borderRadius: '4px',
        padding: '4px 6px',
        minHeight: '48px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        opacity: type === 'outside_month' ? 0.3 : 1,
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.zIndex = '10';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.zIndex = '1';
        }
      }}
    >
      <span style={{
        color: getTextColor(),
        fontSize: '14px',
        fontWeight: 700,
      }}>
        {dayNumber}
      </span>
      {raceName && (
        <span style={{
          color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 600,
          lineHeight: '1.2',
        }}>
          {raceName}
        </span>
      )}
    </div>
  );
};

export default CalendarDay;
