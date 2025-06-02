import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Clock, Plus } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SpendingChart from '../components/charts/SpendingChart';
import CategoryChart from '../components/charts/CategoryChart';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import i18n from '../lib/i18n';
import { Subscription } from '../types';
import Modal from '../components/common/Modal';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { formatCurrency } from '../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    getAnalyticsSummary,
    monthlySpending,
    categoryBreakdown,
    totalMonthly,
    // totalAnnual,
    isLoading: isLoadingAnalytics,
    summary,
  } = useAnalytics();
  const {
    getSubscriptions,
    getCategories,
    subscriptions,
    categories,
    addSubscription,
    editSubscription,
    removeSubscription,
    archive,
    restore,
    isLoading: isLoadingSubscriptions,
  } = useSubscriptions();
  const currency = useSelector((state: RootState) => state.settings.currency);
  const rates = useSelector((state: RootState) => state.settings.rates);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.id) {
      getAnalyticsSummary();
      getSubscriptions();
      getCategories();
    }
  }, [user?.id, getAnalyticsSummary, getSubscriptions, getCategories]);
  
  useEffect(() => {
    console.log('Dashboard summary:', summary);
  }, [summary]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  const getUpcomingRenewals = () => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
    return safeSubscriptions
      .filter(
        (sub) =>
          !sub.isArchived &&
          sub.nextPaymentDate &&
          isAfter(new Date(sub.nextPaymentDate), now) &&
          isBefore(new Date(sub.nextPaymentDate), nextWeek)
      )
      .sort(
        (a, b) =>
          new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime()
      );
  };
  
  const getActiveSubscriptions = () => {
    const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
    return safeSubscriptions.filter((sub) => !sub.isArchived);
  };
  
  const handleAddSubscription = (data: Omit<Subscription, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => {
    addSubscription(data).then(() => {
      getAnalyticsSummary();
    });
  };
  
  const handleEditSubscription = (data: Omit<Subscription, 'id' | 'user' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubscription) {
      editSubscription(selectedSubscription.id, data).then(() => {
        setIsEditModalOpen(false);
        setSelectedSubscription(null);
        getAnalyticsSummary();
      });
    }
  };
  
  const handleDeleteSubscription = () => {
    if (selectedSubscription) {
      removeSubscription(selectedSubscription.id).then(() => {
        setIsDeleteModalOpen(false);
        setSelectedSubscription(null);
        getAnalyticsSummary();
      });
    }
  };
  
  const handleArchiveSubscription = () => {
    if (selectedSubscription) {
      archive(selectedSubscription.id).then(() => {
        setIsArchiveModalOpen(false);
        setSelectedSubscription(null);
        getAnalyticsSummary();
      });
    }
  };
  
  const handleRestoreSubscription = () => {
    if (selectedSubscription) {
      restore(selectedSubscription.id).then(() => {
        setIsRestoreModalOpen(false);
        setSelectedSubscription(null);
        getAnalyticsSummary();
      });
    }
  };
  
  const upcomingRenewals = getUpcomingRenewals();
  const activeSubscriptions = getActiveSubscriptions();
  
  // Update the type guards to be more specific
  interface ChartDataItem {
    month?: string;
    year?: number;
    month?: number;
    totalSpending?: number;
    amount?: number;
    category?: string;
  }

  function getMonth(item: ChartDataItem): string {
    if ('month' in item && typeof item.month === 'string') return item.month;
    if ('year' in item && 'month' in item) return `${item.year}-${String(item.month).padStart(2, '0')}`;
    return '';
  }

  function getAmount(item: ChartDataItem): number {
    return item.totalSpending ?? item.amount ?? 0;
  }

  // Transform data for charts to match expected types
  const spendingChartData = monthlySpending.map(item => ({
    month: getMonth(item),
    amount: getAmount(item),
  }));
  const totalCategory = categoryBreakdown.reduce((sum, item) => sum + getAmount(item), 0);
  const categoryChartData = categoryBreakdown.map(item => ({
    category: item.category,
    amount: getAmount(item),
    percentage: totalCategory ? +(getAmount(item) / totalCategory * 100).toFixed(1) : 0,
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('dashboard.welcome', { name: user?.email })}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/subscriptions/presets')}
          className="mt-4 md:mt-0"
        >
          {t('subscriptions.addNew')}
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {t('dashboard.totalSpending')}
            </h3>
            <CreditCard className="h-8 w-8 text-white opacity-80" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {formatCurrency(summary?.totalMonthlySpending ?? totalMonthly, currency, summary?.currency || 'RUB', rates)}
          </p>
          <p className="mt-1 text-sm text-primary-100">
            {t('dashboard.annualSpending')}: {formatCurrency((summary?.totalMonthlySpending ?? totalMonthly) * 12, currency, summary?.currency || 'RUB', rates)}
          </p>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary-600 to-secondary-800 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {t('dashboard.activeSubscriptions')}
            </h3>
            <CreditCard className="h-8 w-8 text-white opacity-80" />
          </div>
          <p className="mt-4 text-3xl font-semibold">{summary?.activeSubscriptionsCount ?? activeSubscriptions.length}</p>
          <a 
            href="/subscriptions" 
            className="mt-1 text-sm text-secondary-100 hover:underline inline-flex items-center"
          >
            {t('dashboard.viewAll')}
          </a>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-500 to-gray-700 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {t('dashboard.archivedSubscriptions')}
            </h3>
            <CreditCard className="h-8 w-8 text-white opacity-80" />
          </div>
          <p className="mt-4 text-3xl font-semibold">{summary?.archivedSubscriptionsCount ?? 0}</p>
          <span className="mt-1 text-sm text-gray-100">
            {t('dashboard.archivedSubscriptions')}
          </span>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent-600 to-accent-800 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              {t('dashboard.upcomingRenewals')}
            </h3>
            <Clock className="h-8 w-8 text-white opacity-80" />
          </div>
          <p className="mt-4 text-3xl font-semibold">{summary?.upcomingReminders?.length ?? upcomingRenewals.length}</p>
          {summary?.upcomingReminders && summary.upcomingReminders.length > 0 && (
            <p className="mt-1 text-sm text-accent-100">
              {t('dashboard.next')}: {summary.upcomingReminders[0]?.subscription?.title ?? ''} {summary.upcomingReminders[0]?.subscription?.nextPaymentDate ? `(${format(new Date(summary.upcomingReminders[0].subscription.nextPaymentDate), 'PPP', { locale: i18n.language === 'ru' ? ru : enUS })})` : ''}
            </p>
          )}
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={t('dashboard.monthlySpending')}
          className="h-auto"
        >
          {isLoadingAnalytics ? (
            <div className="h-72 flex items-center justify-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <SpendingChart 
              data={spendingChartData} 
              originalCurrency={summary?.currency || 'RUB'} 
            />
          )}
        </Card>
        
        <Card
          title={t('dashboard.spendingByCategory')}
          className="h-auto"
        >
          {isLoadingAnalytics ? (
            <div className="h-72 flex items-center justify-center">
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <CategoryChart 
              data={categoryChartData} 
              originalCurrency={summary?.currency || 'RUB'} 
            />
          )}
        </Card>
      </div>
      
      {/* Upcoming Renewals */}
      <Card title={t('dashboard.upcomingRenewals')}>
        {isLoadingAnalytics ? (
          <div className="h-32 flex items-center justify-center">
            <p>{t('common.loading')}</p>
          </div>
        ) : summary?.upcomingReminders && summary.upcomingReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="p-4 bg-white dark:bg-slate-800 rounded shadow">
                <div className="font-semibold text-lg mb-1">
                  {reminder.subscription?.title || t('subscriptions.unknown')}
                </div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">
                  {reminder.subscription?.nextPaymentDate ? `${t('subscriptions.nextPayment')}: ${format(new Date(reminder.subscription.nextPaymentDate), 'PPP', { locale: i18n.language === 'ru' ? ru : enUS })}` : ''}
                </div>
                <div className="text-slate-900 dark:text-white font-bold">
                  {reminder.subscription?.price ? `${reminder.subscription.price} ${reminder.subscription.currency || ''}` : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">
              {t('subscriptions.noSubscriptions')}
            </p>
          </div>
        )}
      </Card>
      
      {/* Edit Subscription Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubscription(null);
        }}
        title={t('common.edit')}
        size="lg"
      >
        {selectedSubscription && (
          <SubscriptionForm
            subscription={selectedSubscription}
            categories={categories}
            onSubmit={handleEditSubscription}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedSubscription(null);
            }}
            isLoading={isLoadingSubscriptions}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSubscription(null);
        }}
        title={t('subscriptions.delete')}
      >
        <div className="py-4">
          <p>{t('subscriptions.confirmDelete')}</p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedSubscription(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSubscription}
              isLoading={isLoadingSubscriptions}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setSelectedSubscription(null);
        }}
        title={t('subscriptions.cancel')}
      >
        <div className="py-4">
          <p>{t('subscriptions.confirmCancel')}</p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsArchiveModalOpen(false);
                setSelectedSubscription(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleArchiveSubscription}
              isLoading={isLoadingSubscriptions}
            >
              {t('subscriptions.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setSelectedSubscription(null);
        }}
        title={t('subscriptions.reactivate')}
      >
        <div className="py-4">
          <p>{t('subscriptions.confirmReactivate')}</p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsRestoreModalOpen(false);
                setSelectedSubscription(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleRestoreSubscription}
              isLoading={isLoadingSubscriptions}
            >
              {t('subscriptions.reactivate')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;