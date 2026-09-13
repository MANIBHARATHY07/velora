import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { formatDate } from '../lib/format';

/**
 * @param {{ reminder: object, onToggle: () => void }} props
 */
export function ReminderCard({ reminder, onToggle }) {
  const daysLeft = differenceInDays(parseISO(reminder.dueDate), new Date());
  const isOverdue = daysLeft < 0 && !reminder.completed;

  return (
    <div className={`bg-surface border rounded-xl p-4 flex items-start gap-3 transition-colors ${
      isOverdue ? 'border-destructive/40' : 'border-border'
    }`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors flex items-center justify-center ${
          reminder.completed
            ? 'bg-success border-success'
            : isOverdue
            ? 'border-destructive hover:border-destructive/70'
            : 'border-border hover:border-accent'
        }`}
      >
        {reminder.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${reminder.completed ? 'line-through text-textMuted' : 'text-text'}`}>
          {reminder.title}
        </p>
        <p className={`text-xs mt-0.5 ${isOverdue ? 'text-destructive' : 'text-textMuted'}`}>
          {isOverdue ? `${Math.abs(daysLeft)}d overdue · ` : ''}
          Due {formatDate(reminder.dueDate)}
        </p>
        {reminder.notes && <p className="text-xs text-textMuted mt-1 truncate">{reminder.notes}</p>}
      </div>
      <span className="text-xs text-textMuted bg-surfaceElevated px-1.5 py-0.5 rounded capitalize">
        {reminder.type}
      </span>
    </div>
  );
}
