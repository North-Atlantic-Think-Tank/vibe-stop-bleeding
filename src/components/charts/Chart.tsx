import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  nameKey?: string;
}

interface ChartProps {
  chart: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Chart({ chart }: ChartProps) {
  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={chart.yKey || 'value'}
              stroke="#FF0000"
              strokeWidth={2}
              dot={{ fill: '#FF0000', r: 4 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chart.yKey || 'value'} fill="#FF0000" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              dataKey={chart.dataKey || 'value'}
              nameKey={chart.nameKey || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chart.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold font-sans mb-4 text-gray-900">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
