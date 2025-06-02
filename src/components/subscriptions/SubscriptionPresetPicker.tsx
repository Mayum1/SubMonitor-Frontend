import React, { useEffect, useState } from 'react';
import { ServiceProvider } from '../../types';
import { subscriptionService } from '../../services/subscriptionService';
import { useTranslation } from 'react-i18next';

interface SubscriptionPresetPickerProps {
  onSelect: (preset: { type: 'personal' } | { type: 'service', service: ServiceProvider }) => void;
  searchQuery?: string;
  categoryFilter?: string;
}

const SubscriptionPresetPicker: React.FC<SubscriptionPresetPickerProps> = ({ onSelect, searchQuery = '', categoryFilter = '' }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionService.getAllServiceProviders()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const lowerQuery = searchQuery.toLowerCase();
  const showPersonal = true;
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(lowerQuery) &&
    (!categoryFilter || service.category === categoryFilter)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {showPersonal && (
        <div
          className="cursor-pointer p-4 border rounded shadow hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center"
          onClick={() => onSelect({ type: 'personal' })}
        >
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl font-bold mb-2">
            <span className="text-3xl">👤</span>
          </div>
          <div className="font-medium text-center">{t('subscriptions.personalPreset')}</div>
        </div>
      )}
      {loading ? (
        <div className="col-span-full text-center text-slate-400">{t('common.loading')}</div>
      ) : (
        filteredServices.map((service) => (
          <div
            key={service.id}
            className="cursor-pointer p-4 border rounded shadow hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center"
            onClick={() => onSelect({ type: 'service', service })}
          >
            {service.logoUrl ? (
              <img src={service.logoUrl} alt={service.name} className="w-16 h-16 rounded mb-2" />
            ) : (
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 text-3xl font-bold mb-2">
                {service.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="font-medium text-center">{service.name}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubscriptionPresetPicker; 