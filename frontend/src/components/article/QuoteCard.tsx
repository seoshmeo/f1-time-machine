interface QuoteCardProps {
  quote: string;
  author: string;
  context?: string;
}

const QuoteCard = ({ quote, author, context }: QuoteCardProps) => {
  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderLeft: '4px solid #E10600',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <blockquote style={{
        margin: 0,
        padding: 0,
      }}>
        <p style={{
          color: '#FFFFFF',
          fontSize: '16px',
          fontStyle: 'italic',
          lineHeight: '1.6',
          margin: '0 0 12px 0',
        }}>
          "{quote}"
        </p>
        <footer style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <cite style={{
            color: '#E10600',
            fontSize: '14px',
            fontWeight: 600,
            fontStyle: 'normal',
          }}>
            — {author}
          </cite>
          {context && (
            <span style={{
              color: '#666',
              fontSize: '12px',
            }}>
              {context}
            </span>
          )}
        </footer>
      </blockquote>
    </div>
  );
};

export default QuoteCard;
