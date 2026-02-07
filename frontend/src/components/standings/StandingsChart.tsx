import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getConstructorColor } from '../../utils/f1Colors';

interface StandingsChartProps {
  data: Array<{
    round: number;
    [key: string]: number;
  }>;
  drivers: Array<{
    driverRef: string;
    driverName: string;
    constructorRef: string;
  }>;
}

const StandingsChart = ({ data, drivers }: StandingsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#666',
          fontSize: '14px',
          margin: 0,
        }}>
          No chart data available
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: '8px',
      padding: '24px',
    }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
          <XAxis
            dataKey="round"
            stroke="#666"
            style={{ fontSize: '12px' }}
            label={{ value: 'Round', position: 'insideBottom', offset: -5, fill: '#666' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '12px' }}
            label={{ value: 'Points', angle: -90, position: 'insideLeft', fill: '#666' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A2E',
              border: '1px solid #2A2A3E',
              borderRadius: '4px',
              color: '#FFFFFF',
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px',
            }}
          />
          {drivers.slice(0, 10).map((driver) => (
            <Line
              key={driver.driverRef}
              type="monotone"
              dataKey={driver.driverRef}
              name={driver.driverName}
              stroke={getConstructorColor(driver.constructorRef)}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StandingsChart;
