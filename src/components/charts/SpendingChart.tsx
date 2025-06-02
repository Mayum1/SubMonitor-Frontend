import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { MonthlySpending } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';

interface SpendingChartProps {
  data: MonthlySpending[];
  originalCurrency?: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, originalCurrency = 'RUB' }) => {
  const { t } = useTranslation();
  const currency = useSelector((state: RootState) => state.settings.currency);
  const rates = useSelector((state: RootState) => state.settings.rates);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            {formatCurrency(payload[0].value, currency, originalCurrency, rates)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full h-72">
      {(!data || data.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4M7 12l4-4 4 4" /></svg>
          <div>{t('dashboard.noSpendingData', 'Нет данных для отображения')}</div>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, currency, originalCurrency, rates)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Area
            type="monotone"
            dataKey="amount"
            name={t('dashboard.monthlySpending')}
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorSpending)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export default SpendingChart;