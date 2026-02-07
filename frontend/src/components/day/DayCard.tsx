import { ReactNode } from 'react';

interface DayCardProps {
  children: ReactNode;
  title?: string;
}

const DayCard = ({ children, title }: DayCardProps) => {
  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      {title && (
        <h3 style={{
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 700,
          marginTop: 0,
          marginBottom: '16px',
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default DayCard;
