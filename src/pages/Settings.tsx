import React, { useState, useEffect } from 'react';
import api, { unlinkTelegram } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateSettings, fetchSettings } from '../store/slices/settingsSlice';
import { getLocale } from '../utils/currencyUtils';
import { useTranslation } from 'react-i18next';

const CURRENCY_OPTIONS = [
  { value: 'RUB', label: 'RUB (₽)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'PLN', label: 'PLN (zł)' },
  { value: 'TRY', label: 'TRY (₺)' },
];

const TIMEZONE_OPTIONS = [
  ...Array.from({ length: 11 }, (_, i) => {
    const offset = i + 2;
    return `UTC +${offset}`;
  })
];

const Settings: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dispatch = useDispatch();
  const userSettings = useSelector((state: RootState) => state.settings.settings);
  const [defaultCurrency, setDefaultCurrency] = useState(userSettings.defaultCurrency || 'RUB');
  const [defaultTimezone, setDefaultTimezone] = useState(userSettings.defaultTimezone || TIMEZONE_OPTIONS[0]);

  const { t } = useTranslation();

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const isTelegramLinked = useSelector((state: RootState) => state.settings.settings.isTelegramLinked);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);

  // Sync local state with userSettings from Redux
  useEffect(() => {
    setDefaultCurrency(userSettings.defaultCurrency || 'RUB');
    setDefaultTimezone(userSettings.defaultTimezone || TIMEZONE_OPTIONS[0]);
  }, [userSettings]);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/telegram-codes/generate');
      setCode(res.data.code || res.data.data?.code);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        setError(errorResponse.response?.data?.message || 'Failed to generate code');
      } else {
        setError('Failed to generate code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!userId) return;
    setUnlinkLoading(true);
    try {
      await unlinkTelegram(userId);
      dispatch(fetchSettings());
      setSuccessMessage(t('settings.telegramUnlinked'));
    } catch (e) {
      setSuccessMessage(null);
      alert('Failed to unlink Telegram');
    } finally {
      setUnlinkLoading(false);
      setShowUnlinkModal(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('settings.title')}</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">{t('settings.defaultCurrency')}</label>
        <select
          className="w-full p-2 border rounded"
          value={defaultCurrency}
          onChange={e => setDefaultCurrency(e.target.value)}
        >
          {CURRENCY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">{t('settings.defaultTimezone')}</label>
        <select
          className="w-full p-2 border rounded"
          value={defaultTimezone}
          onChange={e => setDefaultTimezone(e.target.value)}
        >
          {TIMEZONE_OPTIONS.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>
      <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        <div className="mb-2 text-sm text-slate-700 dark:text-slate-300">{t('settings.telegramSectionInfo')}</div>
        <a
          href="https://t.me/sub_monitorbot" // Replace with your actual bot link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-4 text-blue-600 hover:underline text-sm"
        >
          {t('settings.openTelegramBot')}
        </a>
        <div>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={handleGenerateCode}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('settings.generateTelegramCode')}
          </button>
          {code && (
            <div className="mt-4">
              <div className="font-mono text-lg bg-slate-100 p-2 rounded">
                {t('settings.codeLabel')} {code}
              </div>
              <button
                className="mt-2 px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                {t('settings.copy')}
              </button>
            </div>
          )}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      </div>
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={async () => {
          await dispatch(updateSettings({ defaultCurrency, defaultTimezone }));
          setSuccessMessage(t('settings.savedSuccessfully'));
        }}
      >
        {t('settings.saveSettings')}
      </button>
      {successMessage && (
        <div className="mt-4 text-green-600 font-medium">{successMessage}</div>
      )}
      {isTelegramLinked && (
        <>
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => setShowUnlinkModal(true)}
            disabled={unlinkLoading}
          >
            {t('settings.unlinkTelegram')}
          </button>
          {showUnlinkModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
              <div className="bg-white dark:bg-slate-800 p-6 rounded shadow-lg max-w-sm w-full">
                <div className="mb-4 text-lg">{t('settings.confirmUnlinkTelegram')}</div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setShowUnlinkModal(false)}
                    disabled={unlinkLoading}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleUnlinkTelegram}
                    disabled={unlinkLoading}
                  >
                    {t('settings.unlinkTelegram')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Settings; 