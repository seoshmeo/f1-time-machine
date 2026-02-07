import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getConstructors } from '../api/constructors';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CountryFlag from '../components/common/CountryFlag';
import { getConstructorColor } from '../utils/f1Colors';

const ConstructorsPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2010');

  const { data: constructors, isLoading, error } = useQuery({
    queryKey: ['constructors', seasonYear],
    queryFn: () => getConstructors(seasonYear),
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !constructors) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          backgroundColor: '#1A1A2E',
          border: '1px solid #2A2A3E',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#E10600', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Constructors Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load constructors for {seasonYear}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <h1 style={{
        color: '#FFFFFF',
        fontSize: '32px',
        fontWeight: 700,
        margin: '0 0 16px 0',
      }}>
        {seasonYear} Constructors
      </h1>
      <p style={{
        color: '#B0B0B0',
        fontSize: '16px',
        margin: '0 0 32px 0',
      }}>
        {constructors.length} teams competed in the {seasonYear} season
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {constructors.map((c) => (
          <Link
            key={c.constructor_ref}
            to={`/season/${seasonYear}/constructors/${c.constructor_ref}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid #2A2A3E',
                borderRadius: '8px',
                padding: '24px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderLeft: `4px solid ${c.color_primary || getConstructorColor(c.constructor_ref)}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E10600';
                e.currentTarget.style.borderLeftColor = c.color_primary || getConstructorColor(c.constructor_ref);
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3E';
                e.currentTarget.style.borderLeftColor = c.color_primary || getConstructorColor(c.constructor_ref);
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: c.color_primary || getConstructorColor(c.constructor_ref),
                opacity: 0.2,
                flexShrink: 0,
              }} />
              <div>
                <h3 style={{
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                }}>
                  {c.name}
                </h3>
                <CountryFlag country={c.nationality} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ConstructorsPage;
