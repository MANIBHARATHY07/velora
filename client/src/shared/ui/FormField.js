import React from 'react';

/**
 * @param {{ label: string, error?: string, required?: boolean, children: React.ReactNode }} props
 */
export function FormField({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-textMuted uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export const inputCls =
  'w-full bg-surfaceElevated border border-border rounded-md px-3 py-2 text-sm text-text placeholder-textMuted focus:border-accent focus:ring-1 focus:ring-accent transition-colors';

export const selectCls =
  'w-full bg-surfaceElevated border border-border rounded-md px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent transition-colors';
