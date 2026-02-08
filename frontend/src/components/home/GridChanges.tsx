import { SeasonEvent } from '../../api/events';

interface GridChangesProps {
  newTeams: SeasonEvent[];
  departedTeams: SeasonEvent[];
}

const GridChanges = ({ newTeams, departedTeams }: GridChangesProps) => {
  if (newTeams.length === 0 && departedTeams.length === 0) {
    return (
      <div style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', padding: '16px 0' }}>
        Нет изменений в составе команд
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}
    >
      {newTeams.length > 0 && (
        <div>
          <h3
            style={{
              color: '#00C853',
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '16px',
              marginTop: 0,
            }}
          >
            Новые команды
          </h3>
          {newTeams.map((team) => (
            <div
              key={team.id}
              style={{
                backgroundColor: '#0F0F0F',
                borderLeft: '3px solid #00C853',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                {team.title}
              </div>
              {team.summary && (
                <div
                  style={{
                    color: '#B0B0B0',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {team.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {departedTeams.length > 0 && (
        <div>
          <h3
            style={{
              color: '#CC0000',
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '16px',
              marginTop: 0,
            }}
          >
            Покинувшие команды
          </h3>
          {departedTeams.map((team) => (
            <div
              key={team.id}
              style={{
                backgroundColor: '#0F0F0F',
                borderLeft: '3px solid #CC0000',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                {team.title}
              </div>
              {team.summary && (
                <div
                  style={{
                    color: '#B0B0B0',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {team.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridChanges;
