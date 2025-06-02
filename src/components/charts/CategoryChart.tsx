import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { CategoryBreakdown } from '../../types';
import i18n from '../../lib/i18n';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';

interface CategoryChartProps {
  data: CategoryBreakdown[];
  originalCurrency?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const CATEGORY_DESCRIPTIONS_RU: Record<string, string> = {
  NONE: "Без категории",
  EDUCATION: "Образование",
  VIDEO: "Видео",
  STORAGE: "Хранилище",
  COMMUNICATION: "Связь",
  MUSIC: "Музыка",
  BOOKS: "Книги",
  INTERNET: "Интернет",
  GAMES: "Игры",
  SOCIAL_NETWORKS: "Социальные сети",
  ALL_IN_ONE: "Все в одном",
  APPLICATIONS: "Приложения",
  FINANCE: "Финансы",
  TRANSPORT: "Транспорт",
  OTHER: "Другое"
};

const getCategoryLabel = (category: string) => {
  if (i18n.language === 'ru') {
    return CATEGORY_DESCRIPTIONS_RU[category] || category;
  }
  return category;
};

const CategoryChart: React.FC<CategoryChartProps> = ({ data, originalCurrency = 'RUB' }) => {
  const { t } = useTranslation();
  const currency = useSelector((state: RootState) => state.settings.currency);
  const rates = useSelector((state: RootState) => state.settings.rates);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="font-medium mb-1">{getCategoryLabel(payload[0].name)}</p>
          <p className="text-sm">
            {formatCurrency(payload[0].value, currency, originalCurrency, rates)} ({payload[0].payload.percentage}%)
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
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
          <div>{t('dashboard.noCategoryData', 'Нет данных для отображения')}</div>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
            nameKey="category"
              label={({ percentage }) => `${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span className="text-sm">{getCategoryLabel(value as string)}</span>} />
        </PieChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryChart;