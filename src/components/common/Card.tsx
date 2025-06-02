import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description,
  footer,
}) => {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          {title && <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h3>}
          {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;