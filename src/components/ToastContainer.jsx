import React from 'react';
import { CheckCircle2, ShieldAlert, Info, X, BellRing } from 'lucide-react';

/**
 * High-Contrast WCAG AAA Toast Notification System
 * Announces dual notifications ("Road repair resolved. Citizen [User] and Admin have been notified.")
 * and operational state updates via an ARIA live region.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 no-print"
    >
      {toasts.map((toast) => {
        const isResolution = toast.type === 'resolution';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="status"
            style={{
              backgroundColor: '#162032',
              borderColor: isResolution
                ? '#00F2FE'
                : isWarning
                ? '#FBBF24'
                : '#94A3B8',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
            className="rounded-lg p-4 shadow-2xl text-[#FFFFFF] flex items-start gap-3.5 transition-all"
          >
            <div
              style={{
                backgroundColor: isResolution
                  ? '#D1FAE5'
                  : isWarning
                  ? '#FEF3C7'
                  : '#E0F2FE',
                color: isResolution
                  ? '#064E3B'
                  : isWarning
                  ? '#78350F'
                  : '#075985',
                borderColor: isResolution
                  ? '#34D399'
                  : isWarning
                  ? '#FBBF24'
                  : '#38BDF8',
                borderWidth: '1.5px',
                borderStyle: 'solid',
              }}
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            >
              {isResolution ? (
                <BellRing className="w-5 h-5" aria-hidden="true" />
              ) : isWarning ? (
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE]">
                  {toast.title || 'System Notification'}
                </span>
              </div>
              <p className="text-body font-semibold text-[#FFFFFF] mt-0.5 leading-snug">
                {toast.message}
              </p>
              {toast.detail && (
                <p className="text-caption text-[#CBD5E1] mt-1">{toast.detail}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="wcag-target inline-flex items-center justify-center rounded-md bg-[#0E1726] text-[#FFFFFF] hover:bg-[#A78BFA] hover:text-[#050B16] wcag-border transition-colors shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
