import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * @param {{ date: string, label?: string }} props
 */
export function StatusBadge({ date, label }) {
  if (!date) return null;
  const days = differenceInDays(parseISO(date), new Date());

  let className = 'text-xs px-2 py-0.5 rounded-full font-medium ';
  if (days > 30) {
    className += 'bg-success/10 text-success';
  } else if (days > 7) {
    className += 'bg-warning/10 text-warning';
  } else {
    className += 'bg-destructive/10 text-destructive';
  }

  const display = label || (days >= 0 ? `${days}d left` : `${Math.abs(days)}d ago`);
  return <span className={className}>{display}</span>;
}
