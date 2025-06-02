import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut, Menu, X, Settings, CreditCard, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setCurrency, fetchCurrencyRates } from '../../store/slices/settingsSlice';
import Select from '../common/Select';
import { SUPPORTED_CURRENCIES } from '../../services/currencyService';
import { changeLanguage } from '../../lib/i18n';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, logoutUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const currency = useSelector((state: RootState) => state.settings.currency);
  const isLoading = useSelector((state: RootState) => state.settings.isLoading);

  const language = localStorage.getItem('userLanguage') || (navigator.language.startsWith('ru') ? 'ru' : 'en');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ru'>(language as 'en' | 'ru');

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!isProfileOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };
  
  const handleLogout = () => {
    logoutUser();
  };
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    dispatch(setCurrency(newCurrency));
    dispatch(fetchCurrencyRates(newCurrency));
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'en' | 'ru';
    setSelectedLanguage(newLang);
    changeLanguage(newLang);
  };

  const handleOpenMenu = () => {
    setIsMobileMenuOpen(true);
    setIsAnimatingOut(false);
  };
  const handleCloseMenu = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsAnimatingOut(false);
    }, 300); // match transition duration
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={isMobileMenuOpen ? handleCloseMenu : handleOpenMenu}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex-1" />
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Currency Selector */}
          <div className="w-24">
            <Select
              value={currency}
              onChange={handleCurrencyChange}
              options={SUPPORTED_CURRENCIES.map((cur) => ({ value: cur, label: cur }))}
              aria-label={t('settings.currency')}
              disabled={isLoading}
            />
          </div>
          {/* Language Selector */}
          <div className="w-28">
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ru', label: 'Русский' },
              ]}
              aria-label={t('settings.language')}
            />
          </div>
          {/* Notifications */}
          <div className="relative">
            <button
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full"
              onClick={toggleNotifications}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary-600 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {isNotificationsOpen && <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} />}
          </div>
          
          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={toggleProfile}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 mr-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-primary-700" />
                )}
              </div>
              <span className="hidden md:inline font-medium">{user?.name}</span>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 py-1 z-50 border border-slate-200 dark:border-slate-700 animate-fade-in">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('settings.title')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu overlay and panel, always rendered */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMobileMenuOpen && !isAnimatingOut ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={handleCloseMenu}
      >
        <nav
          className={`bg-gradient-to-br from-white via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 w-72 h-full shadow-2xl p-0 flex flex-col rounded-r-2xl relative transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen && !isAnimatingOut ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
          style={{ minWidth: 260 }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 bg-white/70 dark:bg-slate-800/70 rounded-full p-1 shadow"
            onClick={handleCloseMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          {/* Navigation links */}
          <div className="flex flex-col gap-2 mt-16">
            <Link to="/dashboard" className="flex items-center gap-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 px-6 py-3 rounded transition" onClick={handleCloseMenu}><span><Menu className="w-5 h-5" /></span>{t('dashboard.title')}</Link>
            <Link to="/subscriptions" className="flex items-center gap-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 px-6 py-3 rounded transition" onClick={handleCloseMenu}><span><CreditCard className="w-5 h-5" /></span>{t('subscriptions.title')}</Link>
            <Link to="/analytics" className="flex items-center gap-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 px-6 py-3 rounded transition" onClick={handleCloseMenu}><span><BarChart3 className="w-5 h-5" /></span>{t('analytics.title')}</Link>
            <Link to="/history" className="flex items-center gap-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 px-6 py-3 rounded transition" onClick={handleCloseMenu}><span><Bell className="w-5 h-5" /></span>{t('history.title')}</Link>
            <Link to="/settings" className="flex items-center gap-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 px-6 py-3 rounded transition" onClick={handleCloseMenu}><span><Settings className="w-5 h-5" /></span>{t('settings.title')}</Link>
          </div>
          <div className="mt-auto pt-8 pb-4 px-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-base text-red-600 hover:text-red-700 py-2 font-semibold justify-center"
            >
              <LogOut className="h-5 w-5" />
              {t('auth.logout')}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;