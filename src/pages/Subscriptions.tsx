import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '../hooks/useSubscriptions';
import SubscriptionCard from '../components/subscriptions/SubscriptionCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Subscription, SubscriptionCategory } from '../types';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setFilter, setSortBy } from '../store/slices/subscriptionSlice';
import i18n from '../lib/i18n';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import { ArrowUp, ArrowDown } from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { t } = useTranslation();
  const {
    subscriptions,
    getSubscriptions,
    archive,
    restore,
    removeSubscription,
    editSubscription,
    getCategories,
  } = useSubscriptions();
  const [showArchived, setShowArchived] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filteredSubscriptions = useSelector((state: RootState) => state.subscriptions.filteredSubscriptions);
  const allCategories = useSelector((state: RootState) => state.subscriptions.categories) || [];
  const activeFilter = useSelector((state: RootState) => state.subscriptions.activeFilter);
  const sortBy = useSelector((state: RootState) => state.subscriptions.sortBy);
  const sortDirection = useSelector((state: RootState) => state.subscriptions.sortDirection);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setInitialLoading(true);
    getSubscriptions(showArchived ? 'archived' : 'active').finally(() => setInitialLoading(false));
  }, [getSubscriptions, showArchived]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data: Omit<Subscription, 'id'> & { serviceId?: number }) => {
    if (!editingSubscription) return;
    await editSubscription(editingSubscription.id, data);
    setEditModalOpen(false);
    setEditingSubscription(null);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingSubscription(null);
  };

  const handleArchive = async (id: number) => {
    await archive(id);
  };

  const handleRestore = async (id: number) => {
    await restore(id);
  };

  // Debug log
  console.log('Subscriptions:', subscriptions);

  // Category options (reuse logic from SubscriptionForm)
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
  const preferredOrder = [
    'NONE', 'VIDEO', 'MUSIC', 'GAMES', 'EDUCATION', 'BOOKS', 'INTERNET', 'STORAGE', 'COMMUNICATION', 'SOCIAL_NETWORKS', 'ALL_IN_ONE', 'APPLICATIONS', 'FINANCE', 'TRANSPORT', 'OTHER'
  ];
  const sortedCategories = preferredOrder.filter(cat => allCategories.includes(cat));
  const categoryOptions = [{ value: '', label: t('subscriptions.allCategories', 'All Categories') }].concat(
    sortedCategories.map((category) => ({
      value: category,
      label: i18n.language === 'ru' ? (CATEGORY_DESCRIPTIONS_RU[category] || category) : category,
    }))
  );
  const sortOptions = [
    { value: 'title', label: t('subscriptions.sortByName', 'Sort by Name') },
    { value: 'price', label: t('subscriptions.sortByAmount', 'Sort by Amount') },
    { value: 'nextPaymentDate', label: t('subscriptions.sortByDate', 'Sort by Renewal Date') },
  ];

  function isSubscriptionCategory(value: string): value is SubscriptionCategory {
    return (Object.values(SubscriptionCategory) as string[]).includes(value);
  }

  // Filter subscriptions by search query
  const displayedSubscriptions = filteredSubscriptions.filter(sub =>
    sub.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {showArchived ? t('dashboard.archivedSubscriptions') : t('dashboard.activeSubscriptions')}
        </h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/subscriptions/presets')}
            className="w-full md:w-auto"
          >
            {t('subscriptions.addNew')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowArchived((v) => !v)}
            className="w-full md:w-auto"
          >
            {showArchived ? t('subscriptions.showActive') || 'Show Active' : t('subscriptions.showArchived') || 'Show Archived'}
          </Button>
        </div>
      </div>
      <div className="mb-4 max-w-md">
        <input
          type="text"
          className="input w-full"
          placeholder={t('common.search', 'Search')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-row md:flex-row md:items-end gap-2 md:gap-6 mb-4 md:mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">{t('subscriptions.category')}</label>
          <select
            className="input w-full text-sm py-1 px-2 md:text-base md:py-2 md:px-3"
            value={activeFilter || ''}
            onChange={e => {
              const val = e.target.value;
              if (isSubscriptionCategory(val)) {
                dispatch(setFilter(val as SubscriptionCategory));
              } else {
                dispatch(setFilter(null));
              }
            }}
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[140px] flex flex-row items-end gap-2">
          <div className="flex-1">
          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">{t('common.sortBy')}</label>
          <select
            className="input w-full"
            value={sortBy}
            onChange={e => dispatch(setSortBy({ sortBy: e.target.value as 'title' | 'price' | 'nextPaymentDate', direction: sortDirection }))}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition"
            onClick={() => dispatch(setSortBy({ sortBy, direction: sortDirection === 'asc' ? 'desc' : 'asc' }))}
            aria-label={sortDirection === 'asc' ? 'Сортировать по убыванию' : 'Сортировать по возрастанию'}
            style={{ marginBottom: 0 }}
          >
            {sortDirection === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {initialLoading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : displayedSubscriptions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">{showArchived ? t('subscriptions.noArchived') || 'No archived subscriptions' : t('subscriptions.noActive') || 'No active subscriptions'}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              showArchived={showArchived}
              onEdit={() => handleEdit(sub)}
              onDelete={() => removeSubscription(sub.id)}
              onCancel={() => handleArchive(sub.id)}
              onReactivate={() => handleRestore(sub.id)}
            />
          ))}
        </div>
      )}
      <Modal
        isOpen={editModalOpen}
        onClose={handleEditCancel}
        title={t('subscriptions.editSubscription')}
        size="lg"
      >
        <SubscriptionForm
          subscription={editingSubscription || undefined}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      </Modal>
    </div>
  );
};

export default Subscriptions; 