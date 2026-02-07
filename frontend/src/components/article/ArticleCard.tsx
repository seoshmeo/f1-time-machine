import { Article } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '20px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {article.source && (
          <span style={{
            backgroundColor: '#E10600',
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {article.source}
          </span>
        )}
        <span style={{
          color: '#666',
          fontSize: '12px',
        }}>
          {formatDateShort(article.published_date)}
        </span>
      </div>

      <h4 style={{
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: 700,
        margin: '0 0 8px 0',
        lineHeight: '1.4',
      }}>
        {article.title}
      </h4>

      {article.lead && (
        <p style={{
          color: '#B0B0B0',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0,
        }}>
          {article.lead}
        </p>
      )}
    </div>
  );
};

export default ArticleCard;
