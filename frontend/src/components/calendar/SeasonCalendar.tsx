import MonthGrid from './MonthGrid';

interface SeasonCalendarProps {
  year: number;
  monthsData: Array<{
    monthName: string;
    days: Array<{
      date: string;
      dayNumber: number;
      type: 'race_day' | 'quali_day' | 'practice_day' | 'test_day' | 'off_day' | 'outside_month';
      raceName?: string;
    }>;
  }>;
}

const SeasonCalendar = ({ year, monthsData }: SeasonCalendarProps) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
    }}>
      {monthsData.map((month) => (
        <MonthGrid
          key={month.monthName}
          monthName={month.monthName}
          year={year}
          days={month.days}
        />
      ))}
    </div>
  );
};

export default SeasonCalendar;
