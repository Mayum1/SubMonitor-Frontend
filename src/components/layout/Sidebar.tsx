import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  BellRing,
  LineChart,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  
  const navigation = [
    { name: t('dashboard.title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('subscriptions.title'), href: '/subscriptions', icon: CreditCard },
    { name: t('analytics.title'), href: '/analytics', icon: LineChart },
    { name: t('history.title'), href: '/history', icon: BellRing },
    { name: t('settings.title'), href: '/settings', icon: Settings },
  ];
  
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-primary-800 text-white">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-primary-700">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-7 w-7 text-primary-200" />
          <span className="text-xl font-semibold tracking-tight">SubMonitor</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:text-white hover:bg-primary-700'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* App version */}
      <div className="p-4 text-xs text-primary-300">
        <p>SubMonitor v0.1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;