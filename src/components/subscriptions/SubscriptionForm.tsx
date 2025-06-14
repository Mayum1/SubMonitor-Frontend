import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Save, X } from 'lucide-react';
import { Subscription, SubscriptionCategory, Reminder } from '../../types';
import i18n from '../../lib/i18n';
import { reminderService, CreateReminderDto } from '../../services/reminderService';
import { subscriptionService, SubscriptionWithReminderRequest } from '../../services/subscriptionService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (data: Omit<Subscription, 'id'> & { serviceId?: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<Omit<Subscription, 'id'> & { serviceId?: number }>;
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

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
}) => {
  const { t } = useTranslation();
  
  const [wantsReminders, setWantsReminders] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([
    { daysBefore: 3, timeOfDay: '09:00', isEnabled: true }
  ]);

  // Create schema for form validation
  const schema = z.object({
    name: z.string().min(1, { message: t('auth.requiredField') }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
    currency: z.string().min(1, { message: t('auth.requiredField') }),
    billingPeriodValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t('subscriptions.billingPeriodValueRequired', 'Enter a valid period'),
    }),
    billingPeriodUnit: z.enum(['MONTH', 'YEAR', 'DAY']),
    category: z.string().min(1, { message: t('auth.requiredField') }),
    startDate: z.string().min(1, { message: t('auth.requiredField') }),
    autoRenew: z.boolean().optional(),
    serviceId: z.string().optional(),
  });
  
  type FormData = {
    name: string;
    amount: string;
    currency: string;
    billingPeriodValue: string;
    billingPeriodUnit: string;
    category: string;
    startDate: string;
    autoRenew?: boolean;
    serviceId?: number;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      amount: '',
      currency: 'RUB',
      billingPeriodValue: '1',
      billingPeriodUnit: 'MONTH',
      category: '',
      startDate: new Date().toISOString().split('T')[0],
      autoRenew: true,
      ...(typeof defaultValues === 'object' ? defaultValues : {}),
    },
  });
  
  // Set form values when subscription is provided (for editing)
  useEffect(() => {
    if (subscription) {
      reset({
        name: subscription.title || '',
        amount: (subscription.price ?? '').toString(),
        currency: subscription.currency || 'RUB',
        billingPeriodValue: (subscription.billingPeriodValue ?? '').toString(),
        billingPeriodUnit: subscription.billingPeriodUnit || 'MONTH',
        category: subscription.subscriptionCategory || '',
        startDate: subscription.firstPaymentDate ? new Date(subscription.firstPaymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        autoRenew: subscription.autoRenew,
        serviceId: (subscription as { serviceId?: number }).serviceId,
      });
    }
  }, [subscription, reset]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const handleFormSubmit = async (data: FormData) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      if (!userId) throw new Error('User not authenticated');
      const payload: SubscriptionWithReminderRequest = {
        title: data.name,
        price: parseFloat(data.amount),
        currency: data.currency,
        firstPaymentDate: data.startDate,
        billingPeriodValue: Number(data.billingPeriodValue),
        billingPeriodUnit: data.billingPeriodUnit as 'MONTH' | 'YEAR' | 'DAY',
        autoRenew: !!data.autoRenew,
        subscriptionCategory: data.category,
        serviceId: data.serviceId,
        ...(wantsReminders ? {
          reminders: reminders.map(r => ({
            daysBefore: Number(r.daysBefore),
            timeOfDay: r.timeOfDay,
            isEnabled: true,
          }))
        } : {}),
      };
      await subscriptionService.createWithReminder(payload, userId);
      onSubmit({
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        billingPeriodValue: data.billingPeriodValue,
        billingPeriodUnit: data.billingPeriodUnit,
        category: data.category,
        startDate: data.startDate,
        autoRenew: !!data.autoRenew,
        serviceId: data.serviceId,
      });
    } catch (error: any) {
      setFormError(error?.message || 'Error creating subscription');
    }
  };
  
  const currencyOptions = [
    { value: 'RUB', label: 'RUB (₽)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CNY', label: 'CNY (¥)' },
    { value: 'PLN', label: 'PLN (zł)' },
    { value: 'TRY', label: 'TRY (₺)' },
  ];
  
  const billingPeriodUnitOptions = [
    { value: 'MONTH', label: t('subscriptions.monthly') },
    { value: 'YEAR', label: t('subscriptions.annually') },
    { value: 'DAY', label: t('subscriptions.daily', 'Daily') },
  ];
  
  // Define a preferred order for categories
  const preferredOrder = [
    SubscriptionCategory.NONE,
    SubscriptionCategory.VIDEO,
    SubscriptionCategory.MUSIC,
    SubscriptionCategory.GAMES,
    SubscriptionCategory.EDUCATION,
    SubscriptionCategory.BOOKS,
    SubscriptionCategory.INTERNET,
    SubscriptionCategory.STORAGE,
    SubscriptionCategory.COMMUNICATION,
    SubscriptionCategory.SOCIAL_NETWORKS,
    SubscriptionCategory.ALL_IN_ONE,
    SubscriptionCategory.APPLICATIONS,
    SubscriptionCategory.FINANCE,
    SubscriptionCategory.TRANSPORT,
    SubscriptionCategory.OTHER
  ];
  const allCategories = Object.values(SubscriptionCategory);
  const sortedCategories = preferredOrder.filter(cat => allCategories.includes(cat));
  const categoryOptions = sortedCategories.map((category) => ({
    value: category,
    label: i18n.language === 'ru' ? (CATEGORY_DESCRIPTIONS_RU[category] || category) : category,
  }));
  
  // Generate hour options for select
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <Input
        id="name"
        label={t('subscriptions.name')}
        {...register('name')}
        error={errors.name?.message}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="amount"
          label={t('subscriptions.amount')}
          type="number"
          step="0.01"
          min="0"
          {...register('amount')}
          error={errors.amount?.message}
        />
        
        <Select
          id="currency"
          label={t('settings.currency')}
          options={currencyOptions}
          {...register('currency')}
          error={errors.currency?.message}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="billingPeriodValue"
          label={t('subscriptions.billingPeriodValue')}
          type="number"
          min="1"
          {...register('billingPeriodValue')}
          error={errors.billingPeriodValue?.message}
        />
        <Select
          id="billingPeriodUnit"
          label={t('subscriptions.billingPeriodUnit')}
          options={billingPeriodUnitOptions}
          {...register('billingPeriodUnit')}
          value={String((defaultValues?.billingPeriodUnit ?? 'MONTH'))}
          error={errors.billingPeriodUnit?.message}
        />
      </div>
        <Select
          id="category"
          label={t('subscriptions.category')}
          options={categoryOptions}
          {...register('category')}
          error={errors.category?.message}
        className="max-h-60 overflow-y-auto"
        />
      
      <Input
        id="startDate"
        label={t('subscriptions.startDate')}
        type="date"
        {...register('startDate')}
        error={errors.startDate?.message}
      />
      
      {defaultValues?.serviceId && (
        <input type="hidden" {...register('serviceId' as const)} value={defaultValues.serviceId} />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
      <div className="flex items-center space-x-2">
        <input
          id="autoRenew"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          {...register('autoRenew')}
        />
        <label htmlFor="autoRenew" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('subscriptions.autoRenew')}
        </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="wantsReminders"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            checked={wantsReminders}
            onChange={e => setWantsReminders(e.target.checked)}
          />
          <label htmlFor="wantsReminders" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('subscriptions.receiveReminders', 'Получать напоминания')}
          </label>
        </div>
      </div>
      
      {wantsReminders && (
        <div className="space-y-4">
          {reminders.map((rem, idx) => (
            <div key={idx} className="border rounded p-4 bg-slate-50 dark:bg-slate-800 relative">
              {reminders.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  onClick={() => setReminders(reminders.filter((_, i) => i !== idx))}
                  aria-label="Удалить напоминание"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`reminder-daysBefore-${idx}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('subscriptions.reminderDaysBefore', 'За сколько дней до оплаты')}
                  </label>
                  <input
                    id={`reminder-daysBefore-${idx}`}
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={String(rem.daysBefore)}
                    onChange={e => {
                      const num = Number(e.target.value);
                      setReminders(reminders.map((r, i) => i === idx ? { ...r, daysBefore: num } : r));
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`reminder-timeOfDay-${idx}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('subscriptions.reminderTimeOfDay', 'Время напоминания')}
                  </label>
                  <select
                    id={`reminder-timeOfDay-${idx}`}
                    className="mt-1 block w-full rounded border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={String(rem.timeOfDay)}
                    onChange={e => setReminders(reminders.map((r, i) => i === idx ? { ...r, timeOfDay: e.target.value } : r))}
                  >
                    {hourOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              className="flex items-center px-3 py-1 rounded bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-medium"
              onClick={() => setReminders([...reminders, { daysBefore: 3, timeOfDay: '09:00', isEnabled: true }])}
            >
              + {t('subscriptions.addReminder', 'Добавить напоминание')}
            </button>
          </div>
        </div>
      )}
      
      {formError && (
        <div className="text-red-500">
          {formError}
        </div>
        )}
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          icon={<X className="h-4 w-4" />}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          icon={<Save className="h-4 w-4" />}
        >
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionForm;