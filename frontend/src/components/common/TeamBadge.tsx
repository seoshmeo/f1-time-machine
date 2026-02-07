import { getConstructorColor } from '../../utils/f1Colors';

interface TeamBadgeProps {
  constructorRef: string;
  constructorName: string;
  size?: 'small' | 'medium';
}

const TeamBadge = ({ constructorRef, constructorName, size = 'small' }: TeamBadgeProps) => {
  const color = getConstructorColor(constructorRef);
  const dotSize = size === 'small' ? '8px' : '12px';
  const fontSize = size === 'small' ? '12px' : '14px';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <div style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }} />
      <span style={{
        color: '#B0B0B0',
        fontSize,
        fontWeight: 500,
      }}>
        {constructorName}
      </span>
    </div>
  );
};

export default TeamBadge;
