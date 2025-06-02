import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  title,
  onClose,
  className = '',
}) => {
  const variantClasses = {
    info: 'bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
    success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300',
    error: 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300',
  };

  const borderClasses = {
    info: 'border-primary-300 dark:border-primary-800',
    success: 'border-success-300 dark:border-success-800',
    warning: 'border-warning-300 dark:border-warning-800',
    error: 'border-error-300 dark:border-error-800',
  };

  const iconMap = {
    info: <Info className="h-5 w-5 text-primary-500 dark:text-primary-400" />,
    success: <CheckCircle className="h-5 w-5 text-success-500 dark:text-success-400" />,
    warning: <AlertCircle className="h-5 w-5 text-warning-500 dark:text-warning-400" />,
    error: <XCircle className="h-5 w-5 text-error-500 dark:text-error-400" />,
  };

  return (
    <div
      className={`rounded-md border p-4 ${variantClasses[variant]} ${borderClasses[variant]} ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">{iconMap[variant]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-transparent text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;