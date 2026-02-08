import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getTeamPrimaryColor } from '../../utils/f1Colors';
import type { LapDriverInfo } from '../../api/results';

interface LapPositionChartProps {
  drivers: LapDriverInfo[];
  laps: Record<string, number | string>[];
}

const LapPositionChart = ({ drivers, laps }: LapPositionChartProps) => {
  if (!laps || laps.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
      }}>
        No lap data available for this race
      </div>
    );
  }

  const maxPosition = drivers.length || 24;

  // Sort drivers by their final position
  const sortedDrivers = [...drivers].sort((a, b) => {
    const lastLap = laps[laps.length - 1];
    const posA = (lastLap[a.driver_id] as number) ?? 99;
    const posB = (lastLap[b.driver_id] as number) ?? 99;
    return posA - posB;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const sorted = [...payload].sort(
      (a: any, b: any) => (a.value ?? 99) - (b.value ?? 99)
    );

    return (
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '6px',
        padding: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <p style={{
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 700,
          margin: '0 0 8px 0',
          borderBottom: '1px solid #2A2A3E',
          paddingBottom: '6px',
        }}>
          Lap {label}
        </p>
        {sorted.map((entry: any) => {
          const driver = drivers.find((d) => d.driver_id === entry.dataKey);
          return (
            <div key={entry.dataKey} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '2px 0',
              fontSize: '12px',
            }}>
              <span style={{
                color: '#B0B0B0',
                fontWeight: 600,
                minWidth: '20px',
              }}>
                P{entry.value}
              </span>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                flexShrink: 0,
              }} />
              <span style={{ color: '#FFFFFF' }}>
                {driver?.abbreviation || entry.dataKey}
              </span>
              <span style={{ color: '#666', marginLeft: 'auto' }}>
                {driver?.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLegend = () => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 16px',
      justifyContent: 'center',
      padding: '12px 0',
    }}>
      {sortedDrivers.map((driver) => (
        <div key={driver.driver_id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
        }}>
          <span style={{
            width: '12px',
            height: '3px',
            backgroundColor: getTeamPrimaryColor(driver.constructor_ref),
            display: 'inline-block',
          }} />
          <span style={{ color: '#B0B0B0' }}>
            {driver.abbreviation}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h3 style={{
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: 700,
        margin: '0 0 16px 0',
      }}>
        Lap-by-Lap Positions
      </h3>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={laps}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2A2A3E"
                vertical={false}
              />
              <XAxis
                dataKey="lap"
                stroke="#666"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={{ stroke: '#2A2A3E' }}
                label={{
                  value: 'Lap',
                  position: 'insideBottomRight',
                  offset: -5,
                  style: { fill: '#666', fontSize: 12 },
                }}
              />
              <YAxis
                reversed
                domain={[1, maxPosition]}
                stroke="#666"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={{ stroke: '#2A2A3E' }}
                interval={0}
                label={{
                  value: 'Position',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#666', fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
              {sortedDrivers.map((driver, idx) => {
                const color = getTeamPrimaryColor(driver.constructor_ref);
                // For drivers on the same team, use dashed line for the 2nd
                const sameTeamBefore = sortedDrivers
                  .slice(0, idx)
                  .some((d) => d.constructor_ref === driver.constructor_ref);
                return (
                  <Line
                    key={driver.driver_id}
                    type="monotone"
                    dataKey={driver.driver_id}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={sameTeamBefore ? '5 3' : undefined}
                    dot={false}
                    activeDot={{ r: 4, fill: color, stroke: '#1A1A2E', strokeWidth: 2 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LapPositionChart;
