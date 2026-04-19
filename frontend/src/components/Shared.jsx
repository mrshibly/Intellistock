import React from 'react';
import { Loader2, AlertCircle, PackageOpen } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizes[size]} text-accent-primary animate-spin`} />
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-3">
      <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto" />
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon = PackageOpen, title, description, action }) => (
  <div className="empty-state">
    <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-text-muted" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
    {description && <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="empty-state">
    <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-danger" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-1">Error</h3>
    <p className="text-sm text-text-muted max-w-sm mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary btn-sm">
        Try Again
      </button>
    )}
  </div>
);

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-sm animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-danger" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
