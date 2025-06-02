import React, { useState } from 'react';
import SubscriptionPresetPicker from '../components/subscriptions/SubscriptionPresetPicker';
import { ServiceProvider, SubscriptionCategory } from '../types';
import { useTranslation } from 'react-i18next';
import Modal from '../components/common/Modal';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SubscriptionPresetPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories, addSubscription } = useSubscriptions();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [preset, setPreset] = useState<{ type: 'personal' } | { type: 'service', service: ServiceProvider } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | ''>('');
  const navigate = useNavigate();

  const handleSelect = (preset: { type: 'personal' } | { type: 'service', service: ServiceProvider }) => {
    setPreset(preset);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPreset(null);
  };

  const defaultValues = preset && preset.type === 'service' ? {
    name: preset.service.name,
    category: preset.service.category,
    serviceId: String(preset.service.id),
  } : {};

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    let payload = { ...data };
    if (user?.id) {
      payload.user = { id: user.id };
    }
    if (preset && preset.type === 'service') {
      payload.serviceId = preset.service.id;
    }
    await addSubscription(payload);
    setIsSaving(false);
    setModalOpen(false);
    setPreset(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2 mb-6 md:flex-row md:gap-4 md:items-center">
      <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shadow-none border border-slate-200 w-full md:w-auto"
        onClick={() => navigate(-1)}
          aria-label="Назад"
      >
        <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Назад</span>
      </button>
          <input
            type="text"
          className="input px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:flex-1"
          placeholder="Поиск"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
          className="input px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-44"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as SubscriptionCategory | '')}
          >
          <option value="">Все</option>
            {Object.values(SubscriptionCategory).map(cat => (
              <option key={cat} value={cat}>{t(`subscriptionCategory.${cat.toLowerCase()}`, cat)}</option>
            ))}
          </select>
        </div>
      <h1 className="text-2xl font-bold mb-6">{t('subscriptions.pickPreset')}</h1>
      <div className="w-full">
        <SubscriptionPresetPicker onSelect={handleSelect} searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={t('subscriptions.addNew')}
        size="lg"
      >
        {preset && preset.type === 'service' && (
          <div className="flex items-center mb-4 gap-4">
            {preset.service.logoUrl && (
              <img src={preset.service.logoUrl} alt={preset.service.name} className="h-12 w-12 rounded object-contain bg-white border" />
            )}
            <span className="text-lg font-semibold">{preset.service.name}</span>
          </div>
        )}
        <SubscriptionForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          isLoading={isSaving}
          defaultValues={defaultValues}
        />
      </Modal>
    </div>
  );
};

export default SubscriptionPresetPage; 