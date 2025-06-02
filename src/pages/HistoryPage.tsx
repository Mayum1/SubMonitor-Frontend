import React, { useEffect, useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getHistoryLogsByUserId, HistoryLog } from '../services/historyLogService';
import { useAuth } from '../hooks/useAuth';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { ru as ruLocale, enUS as enLocale } from 'date-fns/locale';
import i18n from '../lib/i18n';
import { ArrowUp } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      key: 'selection',
    },
  ]);

  const locale = i18n.language === 'ru' ? ruLocale : enLocale;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getHistoryLogsByUserId(user.id)
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [user, t]);

  // Get unique action types from logs
  const actionTypes = Array.from(new Set(logs.map(l => l.actionType)));

  // Filter and sort logs
  const filteredLogs = logs
    .filter(log =>
      (!actionFilter || log.actionType === actionFilter) &&
      (!startDate || new Date(log.timestamp) >= new Date(startDate)) &&
      (!endDate || new Date(log.timestamp) <= new Date(endDate))
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'action') {
        cmp = a.actionType.localeCompare(b.actionType);
      } else if (sortBy === 'amount') {
        cmp = (a.amountCharged || 0) - (b.amountCharged || 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('history.title')}</h1>
      {/* Filters and Sorting */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:gap-6">
        <div className="min-w-[140px] flex-shrink-0 w-full md:w-auto">
            <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300 md:text-xs">{t('common.action', 'Action')}</label>
            <select
              className="input w-full text-sm py-1 px-2 md:text-base md:py-2 md:px-3"
              value={actionFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setActionFilter(e.target.value)}
            >
              <option value="">{t('common.all', 'All')}</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{t(`history.action.${type.toLowerCase()}`, type)}</option>
              ))}
            </select>
          </div>
        <div className="min-w-[180px] flex-shrink-0 w-full md:w-auto relative">
            <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300 md:text-xs">{t('analytics.timeRange', 'Time Range')}</label>
            <button
              type="button"
              className="input w-full flex items-center justify-between text-sm py-1 px-2 md:text-base md:py-2 md:px-3"
              onClick={() => setShowDatePicker((v) => !v)}
            >
              {dateRange[0].startDate && dateRange[0].endDate
                ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                : t('analytics.custom', 'Custom')}
              <span className="ml-2">📅</span>
            </button>
            {/* Date Range Picker Popover/Modal */}
            {showDatePicker && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
                onClick={() => setShowDatePicker(false)}
              >
                <div
                  className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 w-[95vw] max-w-sm mx-auto md:p-2 md:rounded md:shadow-lg md:w-auto md:max-w-none"
                  style={{ minWidth: 320 }}
                  onClick={e => e.stopPropagation()}
                >
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item: { selection: { startDate: Date|null, endDate: Date|null, key: string } }) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    maxDate={new Date()}
                    locale={locale}
                    rangeColors={["#2563eb"]}
                    showMonthAndYearPickers={true}
                    showDateDisplay={false}
                    className="w-full"
                  />
                  <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
                    <button
                      className="btn btn-primary px-3 py-3 rounded-lg text-base md:text-sm"
                      onClick={() => {
                        setStartDate(dateRange[0].startDate ? dateRange[0].startDate.toISOString().split('T')[0] : '');
                        setEndDate(dateRange[0].endDate ? dateRange[0].endDate.toISOString().split('T')[0] : '');
                        setShowDatePicker(false);
                      }}
                    >
                      {t('analytics.applyFilter', 'Apply Filter')}
                    </button>
                    <button
                      className="btn btn-secondary px-3 py-3 rounded-lg text-base md:text-sm"
                      onClick={() => {
                        setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                        setStartDate('');
                        setEndDate('');
                        setShowDatePicker(false);
                      }}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
      {/* Mobile sort selector */}
      <div className="mb-4 md:hidden flex items-center gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">{t('common.sortBy', 'Sort by')}</label>
          <div className="flex items-center gap-2">
            <select
              className="input w-full text-sm py-1 px-2 h-10"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date">{t('common.date', 'Date')}</option>
              <option value="action">{t('common.description', 'Description')}</option>
              <option value="amount">{t('subscriptions.amount', 'Amount')}</option>
            </select>
            <button
              type="button"
              className={`h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-800 shadow transition-colors ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? t('common.sortDesc', 'Sort descending') : t('common.sortAsc', 'Sort ascending')}
              style={{ minWidth: '2.5rem', minHeight: '2.5rem', padding: 0 }}
            >
              <ArrowUp className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div>{t('common.loading')}</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !Array.isArray(filteredLogs) || filteredLogs.length === 0 ? (
        <div>{t('history.noLogs', 'No history logs found.')}</div>
      ) : (
        <>
          {/* Table for md+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800 rounded shadow">
              <thead>
                <tr>
                  <th
                    className={`px-4 py-2 text-left cursor-pointer select-none transition-colors duration-150 hover:text-blue-600 ${sortBy === 'date' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    {t('common.date', 'Date')}
                    <span className="ml-1">
                      <span className={sortBy === 'date' && sortOrder === 'desc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▼</span>
                      <span className={sortBy === 'date' && sortOrder === 'asc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▲</span>
                    </span>
                  </th>
                  <th
                    className={`px-4 py-2 text-left cursor-pointer select-none transition-colors duration-150 hover:text-blue-600 ${sortBy === 'action' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                    onClick={() => {
                      if (sortBy === 'action') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('action');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    {t('common.description', 'Description')}
                    <span className="ml-1">
                      <span className={sortBy === 'action' && sortOrder === 'desc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▼</span>
                      <span className={sortBy === 'action' && sortOrder === 'asc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▲</span>
                    </span>
                  </th>
                  <th
                    className={`px-4 py-2 text-left cursor-pointer select-none transition-colors duration-150 hover:text-blue-600 ${sortBy === 'amount' ? 'font-bold text-blue-600' : 'text-slate-700'}`}
                    onClick={() => {
                      if (sortBy === 'amount') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    {t('common.amount', 'Amount')}
                    <span className="ml-1">
                      <span className={sortBy === 'amount' && sortOrder === 'desc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▼</span>
                      <span className={sortBy === 'amount' && sortOrder === 'asc' ? 'font-bold text-blue-600' : 'text-slate-400'}>▲</span>
                    </span>
                  </th>
                  <th className="px-4 py-2 text-left">{t('subscriptions.title', 'Subscription')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{t(`history.action.${log.actionType.toLowerCase()}`, log.actionType)}</td>
                    <td className="px-4 py-2">
                      {log.amountCharged !== null ? log.amountCharged : '-'}
                      {log.currency ? ` ${log.currency}` : ''}
                    </td>
                    <td className="px-4 py-2">{log.subscription?.title || log.subscriptionTitle || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Card view for mobile */}
          <div className="md:hidden flex flex-col gap-4">
            {filteredLogs.map(log => (
              <div key={log.id} className="bg-white dark:bg-slate-800 rounded shadow p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">{t('common.date', 'Date')}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">{t('common.description', 'Description')}</span>
                  <span className="text-right break-all">{t(`history.action.${log.actionType.toLowerCase()}`, log.actionType)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">{t('common.amount', 'Amount')}</span>
                  <span>{log.amountCharged !== null ? log.amountCharged : '-'}{log.currency ? ` ${log.currency}` : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">{t('subscriptions.title', 'Subscription')}</span>
                  <span>{log.subscription?.title || log.subscriptionTitle || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage; 