'use client';

import { useMemo } from 'react';

type ScanData = {
  id: string;
  createdAt: string;
  overallSentiment: number | null;
  sentimentTrend: string | null;
};

type SentimentTrendChartProps = {
  scans: ScanData[];
  title?: string;
};

export function SentimentTrendChart({ scans, title = 'Sentiment Trend' }: SentimentTrendChartProps) {
  // Process scan data for visualization
  const chartData = useMemo(() => {
    // Take last 30 scans
    const recentScans = scans.slice(0, 30).reverse();

    return recentScans
      .filter(scan => scan.overallSentiment !== null)
      .map(scan => ({
        date: new Date(scan.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        sentiment: scan.overallSentiment || 0,
        trend: scan.sentimentTrend,
      }));
  }, [scans]);

  // Calculate chart dimensions and scaling
  const maxSentiment = 1;
  const minSentiment = -1;
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  const yScale = (value: number) => {
    const range = maxSentiment - minSentiment;
    return chartHeight - ((value - minSentiment) / range) * chartHeight;
  };

  const xScale = (index: number) => {
    if (chartData.length <= 1) {
      return padding;
    }
    return padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
  };

  // Create SVG path for the line
  const linePath = chartData
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.sentiment);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Create area fill path
  const areaPath = chartData.length > 0
    ? `${linePath} L ${xScale(chartData.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`
    : '';

  const latestSentiment = chartData[chartData.length - 1]?.sentiment || 0;
  const sentimentColor
    = latestSentiment > 0.1
      ? '#059669'
      : latestSentiment < -0.1
        ? '#dc2626'
        : '#6b7280';

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold">{title}</h3>
        <div className="flex h-48 items-center justify-center text-gray-500">
          No sentiment data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Latest Sentiment</div>
          <div className="text-2xl font-bold" style={{ color: sentimentColor }}>
            {latestSentiment.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full"
          style={{ minHeight: '240px' }}
        >
          {/* Y-axis grid lines */}
          {[-1, -0.5, 0, 0.5, 1].map(value => (
            <g key={value}>
              <line
                x1={padding}
                y1={yScale(value)}
                x2={chartWidth - padding}
                y2={yScale(value)}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={value === 0 ? '0' : '4 2'}
              />
              <text
                x={padding - 10}
                y={yScale(value) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {value.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill={sentimentColor}
            opacity="0.1"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={sentimentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((point, index) => (
            <g key={index}>
              <circle
                cx={xScale(index)}
                cy={yScale(point.sentiment)}
                r="4"
                fill="white"
                stroke={sentimentColor}
                strokeWidth="2"
              />
              {/* X-axis labels (show every 5th) */}
              {index % 5 === 0 && (
                <text
                  x={xScale(index)}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {point.date}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-600" />
          <span className="text-gray-600">Positive (&gt;0.1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-600" />
          <span className="text-gray-600">Neutral (-0.1 to 0.1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-600" />
          <span className="text-gray-600">Negative (&lt;-0.1)</span>
        </div>
      </div>
    </div>
  );
}
