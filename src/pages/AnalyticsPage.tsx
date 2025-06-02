import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { MonthlySpending, CategoryBreakdown } from '../types';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryChart from '../components/charts/CategoryChart';
import MostExpensiveBarChart from '../components/charts/MostExpensiveBarChart';

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<{ year: number; month: number; week: number; day: number }>({ year: 0, month: 0, week: 0, day: 0 });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      analyticsService.getMonthlySpending(user.id),
      analyticsService.getCategoryBreakdown(user.id),
    ])
      .then(([monthly, categories]) => {
        setMonthlySpending(monthly);
        setCategoryBreakdown(categories);
        // Total spend calculations
        const totalYear = monthly.reduce((sum, m) => sum + m.amount, 0);
        const lastMonth = monthly[monthly.length - 1]?.amount || 0;
        const lastWeek = Math.round(totalYear / 52);
        const lastDay = Math.round(totalYear / 365);
        setTotal({ year: totalYear, month: lastMonth, week: lastWeek, day: lastDay });
        setError(null);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [user, t]);

  // Prepare data for charts
  const expensiveData = [
    { name: 'Apple Developer', value: 26000, formatted: '26 тыс.' },
    { name: 'Amazon Music', value: 833, formatted: '833' },
  ];
  const longestData = [
    { name: 'Apple Developer', value: 220, formatted: '220' },
    { name: 'Amazon Music', value: 60, formatted: '60' },
  ];
  const mostSpentData = [
    { name: 'Apple Developer', value: 198000, formatted: '198 тыс.' },
    { name: 'Amazon Music', value: 2400, formatted: '2,4 тыс.' },
  ];

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
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{isNaN(total.year) ? '—' : total.year}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendMonth', 'Всего за месяц')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{isNaN(total.month) ? '—' : total.month}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendWeek', 'Всего за неделю')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{isNaN(total.week) ? '—' : total.week}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-100 dark:border-slate-700 py-6 px-2">
              <span className="text-xs text-slate-500 mb-1">{t('analytics.totalSpendDay', 'Всего за день')}</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{isNaN(total.day) ? '—' : total.day}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MostExpensiveBarChart
              data={expensiveData}
              title={t('analytics.mostExpensiveSubscription', 'Most expensive subscription (in month)')}
              unit="₽"
              highlightName={expensiveData[0].name}
              valueFormatter={v => v >= 1000 ? `${Math.round(v/1000)} тыс.` : v.toString()}
            />
            <MostExpensiveBarChart
              data={longestData}
              title={t('analytics.longestSpend', 'Longest spend')}
              unit={t('common.days', 'days')}
              highlightName={longestData[0].name}
              valueFormatter={v => v.toString()}
            />
            <MostExpensiveBarChart
              data={mostSpentData}
              title={t('analytics.mostFundsSpent', 'Most funds spent')}
              unit="₽"
              highlightName={mostSpentData[0].name}
              valueFormatter={v => v >= 1000 ? `${Math.round(v/1000)} тыс.` : v.toString()}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{t('analytics.spendLast12Months', 'Spend in the last 12 months')}</h2>
              <SpendingChart data={monthlySpending} />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{t('analytics.spendByCategory', 'Spend by category')}</h2>
              <CategoryChart data={categoryBreakdown} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage; 