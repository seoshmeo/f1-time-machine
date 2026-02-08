interface SessionTabsProps {
  sessions: string[];
  activeSession: string;
  onSessionChange: (session: string) => void;
}

const SessionTabs = ({ sessions, activeSession, onSessionChange }: SessionTabsProps) => {
  const getSessionLabel = (session: string) => {
    const labels: Record<string, string> = {
      'FP1': 'FP1',
      'FP2': 'FP2',
      'FP3': 'FP3',
      'Q': 'Qualifying',
      'R': 'Race',
      'FL': 'Fastest Laps',
      'LC': 'Lap Chart',
      'P': 'Penalties',
    };
    return labels[session] || session;
  };

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      borderBottom: '2px solid #2A2A3E',
      marginBottom: '24px',
      overflowX: 'auto',
    }}>
      {sessions.map((session) => (
        <button
          key={session}
          onClick={() => onSessionChange(session)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: activeSession === session ? '#FFFFFF' : '#666',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeSession === session ? '2px solid #E10600' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {getSessionLabel(session)}
        </button>
      ))}
    </div>
  );
};

export default SessionTabs;
