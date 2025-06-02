import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, LabelProps } from 'recharts';
import { useTranslation } from 'react-i18next';

interface BarChartItem {
  name: string;
  value: number;
  formatted?: string;
}

interface MostExpensiveBarChartProps {
  data: BarChartItem[];
  title: string;
  unit?: string;
  highlightName?: string;
  valueFormatter?: (value: number) => string;
}

const MostExpensiveBarChart: React.FC<MostExpensiveBarChartProps> = ({ data, title, unit, highlightName, valueFormatter }) => {
  const { t } = useTranslation();
  const barColor = '#2563eb'; // blue, matches navbar

  // Find max value for dynamic label positioning
  const maxValue = Math.max(...data.map(d => d.value));

  // Custom label renderer
  const renderCustomLabel = (props: LabelProps) => {
    const { x, y, width, value, index } = props;
    const idx = typeof index === 'number' ? index : 0;
    const barValue = data[idx]?.value ?? 0;
    const formatted = data[idx]?.formatted ?? value;
    // If bar is more than 70% of max, put label inside bar, else outside
    const isLong = barValue > 0.7 * maxValue;
    const xNum = typeof x === 'number' ? x : Number(x) || 0;
    const yNum = typeof y === 'number' ? y : Number(y) || 0;
    const widthNum = typeof width === 'number' ? width : Number(width) || 0;
    const labelX = isLong ? xNum + widthNum - 8 : xNum + widthNum + 8;
    const labelColor = isLong ? '#fff' : '#0f172a';
    const textAnchor = isLong ? 'end' : 'start';
    return (
      <text
        x={labelX}
        y={yNum + 18}
        fill={labelColor}
        fontWeight={600}
        fontSize={16}
        textAnchor={textAnchor}
        alignmentBaseline="middle"
      >
        {formatted}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800 shadow">
      <div className="text-slate-700 dark:text-slate-300 text-base mb-1">{title}</div>
      {highlightName && (
        <div className="text-slate-900 dark:text-white text-2xl font-bold mb-2">{highlightName}</div>
      )}
      <ResponsiveContainer width="100%" height={90 + 40 * data.length}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 14 }}
            tickFormatter={valueFormatter}
          />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#0f172a', fontSize: 16, fontWeight: 500 }}
            width={140}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
            contentStyle={{ background: '#fff', border: 'none', borderRadius: 8, color: '#0f172a' }}
            formatter={valueFormatter}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} fill={barColor} barSize={28}>
            <LabelList
              dataKey="formatted"
              content={renderCustomLabel}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-slate-400 text-xs mt-2">
        <span>{valueFormatter ? valueFormatter(0) : '0'}{unit && ` ${unit}`}</span>
        <span>{unit && t('common.' + unit, unit)}</span>
      </div>
    </div>
  );
};

export default MostExpensiveBarChart; 