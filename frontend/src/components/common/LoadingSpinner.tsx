const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #2A2A3E',
        borderTop: '4px solid #E10600',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
