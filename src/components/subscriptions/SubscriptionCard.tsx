import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Edit, Trash, Ban, RefreshCw } from 'lucide-react';
import { Subscription } from '../../types';
import i18n from '../../lib/i18n';
import { enUS, ru } from 'date-fns/locale';

interface SubscriptionCardProps {
  subscription: Subscription;
  showArchived: boolean;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
  onReactivate: (subscription: Subscription) => void;
}

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

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  showArchived,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
}) => {
  const { t } = useTranslation();
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const getBillingCycleText = () => {
    switch (subscription.billingPeriodUnit) {
      case 'MONTH':
        return t('subscriptions.monthly');
      case 'YEAR':
        return t('subscriptions.annually');
      case 'DAY':
        return t('subscriptions.daily') || 'Daily';
      default:
        return '';
    }
  };
  
  const getCategoryLabel = (category: string) => {
    if (i18n.language === 'ru') {
      return CATEGORY_DESCRIPTIONS_RU[category] || category;
    }
    return category;
  };
  
  const cardClasses = `card hover:shadow-md transition-all`;
  
  return (
    <div className={cardClasses}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {subscription.service?.logoUrl ? (
              <img src={subscription.service.logoUrl} alt={subscription.title || ''} className="w-10 h-10 rounded mr-3" />
            ) : subscription.logoOverrideUrl ? (
              <img src={subscription.logoOverrideUrl} alt={subscription.title || ''} className="w-10 h-10 rounded mr-3" />
            ) : (
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded flex items-center justify-center text-primary-800 dark:text-primary-300 font-semibold mr-3">
                {(subscription.title && subscription.title.charAt(0).toUpperCase()) || '?'}
              </div>
            )}
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{subscription.title || t('subscriptions.unknown')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{getCategoryLabel(subscription.subscriptionCategory || '')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {/* No status badge */}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('subscriptions.amount')}</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {typeof subscription.price === 'number' && subscription.currency ? formatCurrency(subscription.price, subscription.currency) : '-'}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                / {getBillingCycleText()}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('subscriptions.nextBillingDate')}</p>
            <p className={`font-medium text-slate-900 dark:text-slate-100`}>
              {subscription.nextPaymentDate ? format(new Date(subscription.nextPaymentDate), 'PPP', { locale: i18n.language === 'ru' ? ru : enUS }) : '-'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          {!showArchived && (
            <button
              onClick={() => onCancel(subscription)}
              className="p-1.5 text-slate-400 hover:text-error-600 dark:text-slate-500 dark:hover:text-error-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t('subscriptions.cancel')}
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
          {showArchived && (
            <button
              onClick={() => onReactivate(subscription)}
              className="p-1.5 text-slate-400 hover:text-success-600 dark:text-slate-500 dark:hover:text-success-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t('subscriptions.reactivate')}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 text-slate-400 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t('common.edit')}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(subscription)}
            className="p-1.5 text-slate-400 hover:text-error-600 dark:text-slate-500 dark:hover:text-error-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t('common.delete')}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;