import CalendarDay from './CalendarDay';

interface DayData {
  date: string;
  dayNumber: number;
  type: 'race_day' | 'quali_day' | 'practice_day' | 'test_day' | 'off_day' | 'outside_month';
  raceName?: string;
}

interface MonthGridProps {
  monthName: string;
  year: number;
  days: DayData[];
}

const MonthGrid = ({ monthName, year, days }: MonthGridProps) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <h3 style={{
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: 700,
        marginTop: 0,
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        {monthName}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '8px',
      }}>
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              color: '#666',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'center',
              padding: '8px 0',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
      }}>
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            date={day.date}
            dayNumber={day.dayNumber}
            type={day.type}
            raceName={day.raceName}
            year={year}
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGrid;
