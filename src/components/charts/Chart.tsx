import React, { type ReactElement } from 'react';
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
  type: 'line' | 'bar' | 'pie' | 'stacked-bar';
  title: string;
  data: any[] | { labels: string[]; datasets: any[] };
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  nameKey?: string;
  description?: string;
  config?: {
    label?: string;
    [key: string]: any;
  };
}

interface ChartProps {
  chart: ChartData;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

// Transform labels/datasets format to flat array format for Recharts
function transformChartData(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  // Handle labels/datasets format
  if (data && data.labels && data.datasets) {
    return data.labels.map((label: string, index: number) => {
      const entry: any = { name: label };
      data.datasets.forEach((dataset: any) => {
        const key = dataset.label || 'value';
        entry[key] = dataset.data[index];
      });
      return entry;
    });
  }

  return [];
}

export default function Chart({ chart }: ChartProps) {
  const chartData = transformChartData(chart.data);

  const renderChart = () => {
    // Get all data keys except the x-axis key for multi-series charts
    const xKeyName = chart.xKey || 'name';
    const dataKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((k) => k !== 'name' && k !== xKeyName)
        : [];

    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={chart.yKey || dataKeys[0] || 'value'}
              stroke="#FF0000"
              strokeWidth={2}
              dot={{ fill: '#FF0000', r: 4 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.length > 1 ? (
              dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                />
              ))
            ) : (
              <Bar
                dataKey={chart.yKey || dataKeys[0] || 'value'}
                fill="#FF0000"
              />
            )}
          </BarChart>
        );

      case 'stacked-bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        // Custom label renderer that includes the unit from config.label
        const renderPieLabel = (entry: any) => {
          const unit = chart.config?.label || '';
          const percentage = entry.percent ? `(${(entry.percent * 100).toFixed(1)}%)` : '';
          return `${entry.value} ${unit} ${percentage}`.trim();
        };

        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={chart.dataKey || 'value' || dataKeys[0]}
              nameKey={chart.nameKey || 'category' || 'name'}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderPieLabel}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
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

  const rendered = renderChart();
  if (!rendered) {
    return null;
  }

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold font-sans mb-4 text-gray-900">
        {chart.title}
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        {rendered as ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
