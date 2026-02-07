interface DayTimelineProps {
  currentDay: number;
  totalDays: number;
  raceWeekends?: Array<{ start: number; end: number }>;
}

const DayTimeline = ({ currentDay, totalDays, raceWeekends = [] }: DayTimelineProps) => {
  const progress = (currentDay / totalDays) * 100;

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <span style={{
          color: '#B0B0B0',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          Season Progress
        </span>
        <span style={{
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          Day {currentDay} of {totalDays}
        </span>
      </div>

      <div style={{
        position: 'relative',
        height: '8px',
        backgroundColor: '#2A2A3E',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        {raceWeekends.map((weekend, index) => {
          const startPercent = (weekend.start / totalDays) * 100;
          const widthPercent = ((weekend.end - weekend.start) / totalDays) * 100;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                height: '100%',
                backgroundColor: '#E10600',
                opacity: 0.3,
              }}
            />
          );
        })}

        <div style={{
          position: 'absolute',
          left: 0,
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#E10600',
          transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
};

export default DayTimeline;
