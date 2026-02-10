import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHeadToHead, H2HTeamData } from '../api/headToHead';
import { getTeamPrimaryColor } from '../utils/f1Colors';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ComparisonBarProps {
  driver1Name: string;
  driver2Name: string;
  driver1Count: number;
  driver2Count: number;
  color1: string;
  color2: string;
}

const ComparisonBar = ({ driver1Name, driver2Name, driver1Count, driver2Count, color1, color2 }: ComparisonBarProps) => {
  const total = driver1Count + driver2Count;
  const driver1Percent = total > 0 ? (driver1Count / total) * 100 : 50;
  const driver2Percent = total > 0 ? (driver2Count / total) * 100 : 50;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
        fontSize: '13px',
        fontFamily: 'monospace',
      }}>
        <span style={{ color: '#B0B0B0' }}>
          <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{driver1Name}</span> {driver1Count}
        </span>
        <span style={{ color: '#B0B0B0' }}>
          {driver2Count} <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{driver2Name}</span>
        </span>
      </div>
      <div style={{
        display: 'flex',
        height: '24px',
        backgroundColor: '#0F0F0F',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #2A2A3E',
      }}>
        <div
          style={{
            width: `${driver1Percent}%`,
            backgroundColor: color1,
            transition: 'width 0.3s ease',
          }}
        />
        <div
          style={{
            width: `${driver2Percent}%`,
            backgroundColor: color2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

interface PointsChartProps {
  data: Array<{ round: number; driver1_points: number; driver2_points: number }>;
  driver1Name: string;
  driver2Name: string;
  color1: string;
  color2: string;
}

const PointsChart = ({ data, driver1Name, driver2Name, color1, color2 }: PointsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
      }}>
        No progression data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
        <XAxis
          dataKey="round"
          stroke="#666"
          style={{ fontSize: '11px' }}
        />
        <YAxis
          stroke="#666"
          style={{ fontSize: '11px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A2E',
            border: '1px solid #2A2A3E',
            borderRadius: '4px',
            color: '#FFFFFF',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="driver1_points"
          name={driver1Name}
          stroke={color1}
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="driver2_points"
          name={driver2Name}
          stroke={color2}
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface TeamCardProps {
  teamData: H2HTeamData;
}

const TeamCard = ({ teamData }: TeamCardProps) => {
  const primaryColor = getTeamPrimaryColor(teamData.constructor_ref);

  // Create a lighter version for driver2
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const secondaryColor = lightenColor(primaryColor, 30);

  const driver1Code = teamData.driver1.code || teamData.driver1.last_name.slice(0, 3).toUpperCase();
  const driver2Code = teamData.driver2.code || teamData.driver2.last_name.slice(0, 3).toUpperCase();

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Team Header */}
      <div style={{
        borderLeft: `4px solid ${primaryColor}`,
        paddingLeft: '12px',
      }}>
        <h3 style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 700,
          margin: '0 0 4px 0',
        }}>
          {teamData.constructor_name}
        </h3>
        <p style={{
          color: '#B0B0B0',
          fontSize: '14px',
          margin: 0,
        }}>
          {teamData.driver1.first_name} {teamData.driver1.last_name} vs {teamData.driver2.first_name} {teamData.driver2.last_name}
        </p>
      </div>

      {/* Comparison Bars */}
      <div>
        <div style={{
          color: '#666',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}>
          Qualifying
        </div>
        <ComparisonBar
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          driver1Count={teamData.qualifying.driver1_ahead}
          driver2Count={teamData.qualifying.driver2_ahead}
          color1={primaryColor}
          color2={secondaryColor}
        />

        <div style={{
          color: '#666',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          marginTop: '16px',
        }}>
          Race Finishes
        </div>
        <ComparisonBar
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          driver1Count={teamData.races.driver1_ahead}
          driver2Count={teamData.races.driver2_ahead}
          color1={primaryColor}
          color2={secondaryColor}
        />

        <div style={{
          color: '#666',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          marginTop: '16px',
        }}>
          Fastest Laps
        </div>
        <ComparisonBar
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          driver1Count={teamData.fastest_laps.driver1_count}
          driver2Count={teamData.fastest_laps.driver2_count}
          color1={primaryColor}
          color2={secondaryColor}
        />
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#0F0F0F',
        borderRadius: '8px',
        border: '1px solid #2A2A3E',
      }}>
        <div>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            POINTS
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' }}>
            {teamData.points.driver1_total}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            POINTS
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' }}>
            {teamData.points.driver2_total}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            PODIUMS
          </div>
          <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}>
            {teamData.points.driver1_podiums}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            PODIUMS
          </div>
          <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}>
            {teamData.points.driver2_podiums}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            DNFS
          </div>
          <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}>
            {teamData.points.driver1_dnfs}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            DNFS
          </div>
          <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 600, fontFamily: 'monospace' }}>
            {teamData.points.driver2_dnfs}
          </div>
        </div>
      </div>

      {/* Points Progression Chart */}
      <div>
        <div style={{
          color: '#666',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Points Progression
        </div>
        <PointsChart
          data={teamData.points_progression}
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          color1={primaryColor}
          color2={secondaryColor}
        />
      </div>
    </div>
  );
};

const HeadToHeadPage = () => {
  const { year } = useParams<{ year: string }>();
  const seasonYear = parseInt(year || '2026');

  useEffect(() => {
    document.title = `${seasonYear} Head-to-Head Teammate Battles | F1 Time Machine`;
  }, [seasonYear]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['headToHead', seasonYear],
    queryFn: () => getHeadToHead(seasonYear),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
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
            Head-to-Head Data Not Available
          </h2>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Unable to load head-to-head comparison data for {seasonYear}
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
      {/* Page Header */}
      <div style={{
        marginBottom: '32px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: 700,
          margin: '0 0 8px 0',
        }}>
          {seasonYear} Head-to-Head
        </h1>
        <p style={{
          color: '#B0B0B0',
          fontSize: '16px',
          margin: 0,
        }}>
          Teammate battles across qualifying, races, and championship points
        </p>
      </div>

      {/* Team Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
      }}>
        {data.map((teamData) => (
          <TeamCard key={teamData.constructor_ref} teamData={teamData} />
        ))}
      </div>
    </div>
  );
};

export default HeadToHeadPage;
