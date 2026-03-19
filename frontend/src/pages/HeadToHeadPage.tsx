import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getHeadToHead, H2HTeamData } from '../api/headToHead';
import { getTeamPrimaryColor } from '../utils/f1Colors';
import { useIsMobile } from '../hooks/useIsMobile';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ─── Comparison Bar ──────────────────────────────────────────────────────────

interface ComparisonBarProps {
  label: string;
  driver1Name: string;
  driver2Name: string;
  driver1Count: number;
  driver2Count: number;
  color1: string;
  color2: string;
}

const ComparisonBar = ({ label, driver1Name, driver2Name, driver1Count, driver2Count, color1, color2 }: ComparisonBarProps) => {
  const total = driver1Count + driver2Count;
  const driver1Percent = total > 0 ? (driver1Count / total) * 100 : 50;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            color: color1,
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}>
            {driver1Count}
          </span>
          <span style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {driver1Name}
          </span>
        </div>
        <span style={{
          color: '#555',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {driver2Name}
          </span>
          <span style={{
            color: color2,
            fontSize: '18px',
            fontWeight: 800,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}>
            {driver2Count}
          </span>
        </div>
      </div>
      <div style={{
        position: 'relative',
        height: '6px',
        backgroundColor: '#0F0F0F',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: animated ? `${driver1Percent}%` : '50%',
          background: `linear-gradient(90deg, ${color1}, ${color1}88)`,
          borderRadius: '3px 0 0 3px',
          transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: animated ? `${100 - driver1Percent}%` : '50%',
          background: `linear-gradient(90deg, ${color2}88, ${color2})`,
          borderRadius: '0 3px 3px 0',
          transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>
    </div>
  );
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: number;
  driver1Name: string;
  driver2Name: string;
  color1: string;
  color2: string;
}

const ChartCustomTooltip = ({ active, payload, label, driver1Name, driver2Name, color1, color2 }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const d1 = payload.find(p => p.dataKey === 'driver1_points');
  const d2 = payload.find(p => p.dataKey === 'driver2_points');
  const diff = (d1?.value ?? 0) - (d2?.value ?? 0);

  return (
    <div style={{
      backgroundColor: '#141428',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      minWidth: '160px',
    }}>
      <div style={{
        color: '#888',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px',
      }}>
        Round {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color1 }} />
            <span style={{ color: '#B0B0B0', fontSize: '12px' }}>{driver1Name}</span>
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
            {d1?.value ?? 0}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color2 }} />
            <span style={{ color: '#B0B0B0', fontSize: '12px' }}>{driver2Name}</span>
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
            {d2?.value ?? 0}
          </span>
        </div>
      </div>
      {diff !== 0 && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #2A2A3E',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#666', fontSize: '11px' }}>Gap</span>
          <span style={{
            color: diff > 0 ? color1 : color2,
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}>
            {diff > 0 ? '+' : ''}{diff} {diff > 0 ? driver1Name : driver2Name}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Points Gap Chart ────────────────────────────────────────────────────────

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

  // Compute gap data: positive = driver1 ahead, negative = driver2 ahead
  const gapData = data.map(d => ({
    round: d.round,
    driver1_points: d.driver1_points,
    driver2_points: d.driver2_points,
    gap: d.driver1_points - d.driver2_points,
    gapPositive: d.driver1_points - d.driver2_points > 0 ? d.driver1_points - d.driver2_points : 0,
    gapNegative: d.driver1_points - d.driver2_points < 0 ? d.driver1_points - d.driver2_points : 0,
  }));

  const maxGap = Math.max(...gapData.map(d => Math.abs(d.gap)), 1);

  const renderGapTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const gap = payload[0]?.payload?.gap ?? 0;
    const leader = gap > 0 ? driver1Name : gap < 0 ? driver2Name : 'Tied';
    return (
      <div style={{
        backgroundColor: '#141428',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ color: '#888', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          Round {label}
        </div>
        <div style={{
          color: gap > 0 ? color1 : gap < 0 ? color2 : '#888',
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'monospace',
        }}>
          {gap === 0 ? 'TIED' : `${leader} +${Math.abs(gap)} pts`}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Main points progression chart */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad1-${color1.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color1} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color1} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`grad2-${color2.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color2} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color2} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E36" vertical={false} />
          <XAxis
            dataKey="round"
            stroke="#333"
            tick={{ fill: '#555', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#2A2A3E' }}
          />
          <YAxis
            stroke="#333"
            tick={{ fill: '#555', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<ChartCustomTooltip driver1Name={driver1Name} driver2Name={driver2Name} color1={color1} color2={color2} />} />
          <Area
            type="monotone"
            dataKey="driver1_points"
            stroke={color1}
            strokeWidth={2.5}
            fill={`url(#grad1-${color1.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 5, fill: color1, stroke: '#1A1A2E', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="driver2_points"
            stroke={color2}
            strokeWidth={2.5}
            fill={`url(#grad2-${color2.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 5, fill: color2, stroke: '#1A1A2E', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Gap indicator mini-chart */}
      {data.length > 1 && (
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={gapData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={`gapGrad1-${color1.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color1} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`gapGrad2-${color2.replace('#', '')}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={color2} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color2} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis
              domain={[-maxGap, maxGap]}
              hide
            />
            <XAxis dataKey="round" hide />
            <ReferenceLine y={0} stroke="#2A2A3E" strokeWidth={1} />
            <Tooltip content={renderGapTooltip} />
            <Area
              type="monotone"
              dataKey="gapPositive"
              stroke="none"
              fill={`url(#gapGrad1-${color1.replace('#', '')})`}
              animationDuration={1200}
              baseLine={0}
            />
            <Area
              type="monotone"
              dataKey="gapNegative"
              stroke="none"
              fill={`url(#gapGrad2-${color2.replace('#', '')})`}
              animationDuration={1200}
              baseLine={0}
            />
            <Line
              type="monotone"
              dataKey="gap"
              stroke="#888"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: '#fff', stroke: '#1A1A2E', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        paddingTop: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: color1, borderRadius: '2px', display: 'inline-block' }} />
          <span style={{ color: '#888', fontSize: '11px' }}>{driver1Name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: color2, borderRadius: '2px', display: 'inline-block' }} />
          <span style={{ color: '#888', fontSize: '11px' }}>{driver2Name}</span>
        </div>
      </div>
    </div>
  );
};

interface TeamCardProps {
  teamData: H2HTeamData;
}

const TeamCard = ({ teamData }: TeamCardProps) => {
  const primaryColor = getTeamPrimaryColor(teamData.constructor_ref);

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

  // Determine who leads in points
  const pointsDiff = teamData.points.driver1_total - teamData.points.driver2_total;
  const leader = pointsDiff > 0 ? driver1Code : pointsDiff < 0 ? driver2Code : null;
  const leaderColor = pointsDiff > 0 ? primaryColor : secondaryColor;

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle team color accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
      }} />

      {/* Team Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: '4px',
      }}>
        <div>
          <h3 style={{
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: 800,
            margin: '0 0 4px 0',
            letterSpacing: '-0.3px',
          }}>
            {teamData.constructor_name}
          </h3>
          <p style={{
            color: '#888',
            fontSize: '13px',
            margin: 0,
          }}>
            {teamData.driver1.first_name} {teamData.driver1.last_name}
            <span style={{ color: '#444', margin: '0 6px' }}>vs</span>
            {teamData.driver2.first_name} {teamData.driver2.last_name}
          </p>
        </div>
        {leader && Math.abs(pointsDiff) > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: `${leaderColor}15`,
            border: `1px solid ${leaderColor}30`,
            borderRadius: '6px',
            padding: '4px 10px',
          }}>
            <span style={{ color: leaderColor, fontSize: '11px', fontWeight: 700 }}>
              {leader} +{Math.abs(pointsDiff)}
            </span>
          </div>
        )}
      </div>

      {/* Comparison Bars */}
      <div>
        <ComparisonBar
          label="Qualifying"
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          driver1Count={teamData.qualifying.driver1_ahead}
          driver2Count={teamData.qualifying.driver2_ahead}
          color1={primaryColor}
          color2={secondaryColor}
        />
        <ComparisonBar
          label="Races"
          driver1Name={driver1Code}
          driver2Name={driver2Code}
          driver1Count={teamData.races.driver1_ahead}
          driver2Count={teamData.races.driver2_ahead}
          color1={primaryColor}
          color2={secondaryColor}
        />
        <ComparisonBar
          label="Fastest Laps"
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
        gridTemplateColumns: '1fr auto 1fr',
        gap: '0',
        padding: '16px 20px',
        backgroundColor: '#12121F',
        borderRadius: '10px',
        border: '1px solid #1E1E36',
      }}>
        {/* Driver 1 stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Points</div>
            <div style={{ color: primaryColor, fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
              {teamData.points.driver1_total}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Podiums</div>
              <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                {teamData.points.driver1_podiums}
              </div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>DNFs</div>
              <div style={{ color: teamData.points.driver1_dnfs > 0 ? '#FF4444' : '#B0B0B0', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                {teamData.points.driver1_dnfs}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          backgroundColor: '#2A2A3E',
          margin: '0 20px',
          alignSelf: 'stretch',
        }} />

        {/* Driver 2 stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', textAlign: 'right' }}>
          <div>
            <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Points</div>
            <div style={{ color: secondaryColor, fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
              {teamData.points.driver2_total}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Podiums</div>
              <div style={{ color: '#B0B0B0', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                {teamData.points.driver2_podiums}
              </div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>DNFs</div>
              <div style={{ color: teamData.points.driver2_dnfs > 0 ? '#FF4444' : '#B0B0B0', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                {teamData.points.driver2_dnfs}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points Progression Chart */}
      <div>
        <div style={{
          color: '#666',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
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
  const isMobile = useIsMobile();
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
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))',
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
