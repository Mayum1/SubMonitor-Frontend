import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { MonthlySpending, CategoryBreakdown } from '../types';
import type { BarChartItem } from '../services/analyticsService';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryChart from '../components/charts/CategoryChart';
import MostExpensiveBarChart from '../components/charts/MostExpensiveBarChart';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { convertAmount, formatCurrency } from '../utils/currencyUtils';

const CURRENCY_SYMBOLS: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' };
const SUPPORTED_CURRENCIES = ['RUB', 'USD', 'EUR'];

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [monthlySpending, setMonthlySpending] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<{ year: number; month: number; week: number; day: number }>({ year: 0, month: 0, week: 0, day: 0 });
  const [expensiveData, setExpensiveData] = useState<BarChartItem[]>([]);
  const [longestData, setLongestData] = useState<BarChartItem[]>([]);
  const [mostSpentData, setMostSpentData] = useState<BarChartItem[]>([]);
  const [yearlySpending, setYearlySpending] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const { currency, rates } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      analyticsService.getMonthlySpending(user.id),
      analyticsService.getCategoryBreakdown(user.id),
      analyticsService.getMostExpensive(user.id),
      analyticsService.getLongest(user.id),
      analyticsService.getMostFundsSpent(user.id),
      analyticsService.getYearlySpending(user.id),
      analyticsService.getSummary(user.id),
    ])
      .then(([monthly, categories, expensive, longest, mostSpent, yearly, summaryData]) => {
        setMonthlySpending(monthly);
        setCategoryBreakdown(categories);
        setExpensiveData(expensive);
        setLongestData(longest);
        setMostSpentData(mostSpent);
        setYearlySpending(yearly);
        setSummary(summaryData);
        // Total spend calculations
        const week = yearly ? Math.round(yearly / 52) : 0;
        const day = yearly ? Math.round(yearly / 365) : 0;
        // Month is always year / 12
        const month = yearly ? yearly / 12 : 0;
        setTotal({ year: yearly, month, week, day });
        setError(null);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [user, t]);

  // Transform monthlySpending for SpendingChart
  const spendingChartData = monthlySpending.map(item => ({
    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
    amount: item.totalSpending
  }));

  // Transform categoryBreakdown for CategoryChart
  const totalCategory = categoryBreakdown.reduce((sum, item) => sum + item.totalSpending, 0);
  const categoryChartData = categoryBreakdown.map(item => ({
    category: item.category,
    amount: item.totalSpending,
    percentage: totalCategory ? +(item.totalSpending / totalCategory * 100).toFixed(1) : 0
  }));

  // Conversion helper
  const convert = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '—';
    return formatCurrency(value, currency, 'RUB', rates);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('analytics.title')}</h1>
      {loading ? (
        <div>{t('common.loading')}</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          {/* Summary Cards - visually optimal */}
          <div className="w-full max-w-2xl mx-auto grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendYear', 'Всего за год')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{yearlySpending !== null && !isNaN(yearlySpending) ? convert(yearlySpending) : '—'}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendMonth', 'Всего за месяц')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{total.month !== undefined && !isNaN(total.month) ? convert(total.month) : '—'}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendWeek', 'Всего за неделю')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{total.week !== undefined && !isNaN(total.week) ? convert(total.week) : '—'}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendDay', 'Всего за день')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{total.day !== undefined && !isNaN(total.day) ? convert(total.day) : '—'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {expensiveData.length > 0 ? (
              <MostExpensiveBarChart
                data={expensiveData}
                title={t('analytics.mostExpensiveSubscription', 'Most expensive subscription (in month)')}
                unit={currency}
                highlightName={expensiveData[0].name}
                valueFormatter={convert}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800 shadow flex flex-col items-center justify-center h-44">
                <svg className="w-10 h-10 mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                <div className="text-slate-400">{t('dashboard.noSpendingData', 'Нет данных для отображения')}</div>
              </div>
            )}
            {longestData.length > 0 ? (
              <MostExpensiveBarChart
                data={longestData}
                title={t('analytics.longestSpend', 'Longest spend')}
                unit={t('common.days', 'days')}
                highlightName={longestData[0].name}
                valueFormatter={v => v.toString()}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800 shadow flex flex-col items-center justify-center h-44">
                <svg className="w-10 h-10 mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                <div className="text-slate-400">{t('dashboard.noSpendingData', 'Нет данных для отображения')}</div>
              </div>
            )}
            {mostSpentData.length > 0 ? (
              <MostExpensiveBarChart
                data={mostSpentData}
                title={t('analytics.mostFundsSpent', 'Most funds spent')}
                unit={currency}
                highlightName={mostSpentData[0].name}
                valueFormatter={convert}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800 shadow flex flex-col items-center justify-center h-44">
                <svg className="w-10 h-10 mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                <div className="text-slate-400">{t('dashboard.noSpendingData', 'Нет данных для отображения')}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{t('analytics.spendLast12Months', 'Spend in the last 12 months')}</h2>
              <SpendingChart data={spendingChartData} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{t('analytics.spendByCategory', 'Spend by category')}</h2>
              <CategoryChart data={categoryChartData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage; 