import { Link } from 'react-router-dom';
import { Race } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';

interface RaceCardProps {
  race: Race;
  year: number;
}

const RaceCard = ({ race, year }: RaceCardProps) => {
  return (
    <Link
      to={`/season/${year}/race/${race.round}`}
      style={{
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '20px',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#E10600';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2A2A3E';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div style={{
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 700,
            minWidth: '48px',
            textAlign: 'center',
          }}>
            R{race.round}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}>
              {race.name}
            </h3>
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              margin: '0 0 4px 0',
            }}>
              {race.circuit_name}
            </p>
            <p style={{
              color: '#666',
              fontSize: '13px',
              margin: 0,
            }}>
              {race.circuit_country} • {formatDateShort(race.date)}
            </p>
          </div>
        </div>

        {race.winner_name && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #2A2A3E',
          }}>
            <span style={{
              color: '#666',
              fontSize: '12px',
              marginRight: '8px',
            }}>
              Winner:
            </span>
            <span style={{
              color: '#E10600',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              {race.winner_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RaceCard;
