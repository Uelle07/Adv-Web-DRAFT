import React from 'react';
import {
  Clock,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
} from 'lucide-react';

/**
 * WCAG AA/AAA Dual-Contrast Status Badge
 * Enforces: Never rely solely on color. Pairs a distinct semantic icon + text label + 1.5px border.
 *
 * Audited Tokens:
 * - Submitted/Pending: Bg #E2E8F0, Text #050B16, Border #CBD5E1
 * - Under Review (Approved): Bg #FEF3C7, Text #78350F, Border #FBBF24
 * - In Progress (Under Repair): Bg #E0F2FE, Text #075985, Border #38BDF8
 * - Resolved: Bg #D1FAE5, Text #064E3B, Border #34D399
 * - Rejected: Bg #FEE2E2, Text #7F1D1D, Border #F87171
 */
export function StatusBadge({ status, size = 'md' }) {
  const configMap = {
    pending: {
      label: 'Submitted / Pending Triage',
      bg: '#E2E8F0',
      text: '#050B16',
      border: '#CBD5E1',
      Icon: Clock,
    },
    approved: {
      label: 'Under Review (Approved)',
      bg: '#FEF3C7',
      text: '#78350F',
      border: '#FBBF24',
      Icon: ShieldCheck,
    },
    in_progress: {
      label: 'In Progress (Under Repair)',
      bg: '#E0F2FE',
      text: '#075985',
      border: '#38BDF8',
      Icon: Wrench,
    },
    resolved: {
      label: 'Resolved (Completed)',
      bg: '#D1FAE5',
      text: '#064E3B',
      border: '#34D399',
      Icon: CheckCircle2,
    },
    rejected: {
      label: 'Rejected (Withheld)',
      bg: '#FEE2E2',
      text: '#7F1D1D',
      border: '#F87171',
      Icon: XCircle,
    },
  };

  const cfg = configMap[status] || configMap.pending;
  const IconComponent = cfg.Icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-caption gap-1.5'
      : 'px-3 py-1.5 text-caption font-semibold gap-2';

  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
        borderWidth: '1.5px',
        borderStyle: 'solid',
      }}
      className={`inline-flex items-center rounded-md font-semibold tracking-wide select-none ${sizeClasses}`}
    >
      <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" strokeWidth={2.25} />
      <span>{cfg.label}</span>
    </span>
  );
}

/**
 * Dual-Contrast Severity Badge with distinct icon + label + 1.5px border
 */
export function SeverityBadge({ severity = 'Moderate' }) {
  const normalized = severity.toLowerCase();

  let cfg = {
    label: 'Moderate Severity',
    bg: '#E0F2FE',
    text: '#075985',
    border: '#38BDF8',
    Icon: Info,
  };

  if (normalized === 'critical') {
    cfg = {
      label: 'Critical Hazard',
      bg: '#FEE2E2',
      text: '#7F1D1D',
      border: '#F87171',
      Icon: AlertOctagon,
    };
  } else if (normalized === 'high') {
    cfg = {
      label: 'High Severity',
      bg: '#FEF3C7',
      text: '#78350F',
      border: '#FBBF24',
      Icon: AlertTriangle,
    };
  }

  const IconComponent = cfg.Icon;

  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
        borderWidth: '1.5px',
        borderStyle: 'solid',
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-caption font-semibold tracking-wide"
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeWidth={2.25} />
      <span>{cfg.label}</span>
    </span>
  );
}
