import { formatDateLong } from '../../utils/dateUtils';

interface DayNavigationProps {
  currentDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

const DayNavigation = ({
  currentDate,
  onPrevDay,
  onNextDay,
  canGoPrev,
  canGoNext
}: DayNavigationProps) => {
  const buttonStyle = (enabled: boolean) => ({
    backgroundColor: enabled ? '#1A1A2E' : '#15151F',
    border: '1px solid #2A2A3E',
    color: enabled ? '#FFFFFF' : '#666',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.2s',
    opacity: enabled ? 1 : 0.5,
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      padding: '24px',
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      marginBottom: '24px',
    }}>
      <button
        onClick={onPrevDay}
        disabled={!canGoPrev}
        style={buttonStyle(canGoPrev)}
      >
        ← Previous
      </button>

      <div style={{
        flex: 1,
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '24px',
          fontWeight: 700,
          margin: 0,
        }}>
          {formatDateLong(currentDate)}
        </h2>
      </div>

      <button
        onClick={onNextDay}
        disabled={!canGoNext}
        style={buttonStyle(canGoNext)}
      >
        Next →
      </button>
    </div>
  );
};

export default DayNavigation;
