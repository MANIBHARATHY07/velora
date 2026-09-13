import React from 'react';

/**
 * @param {{ icon: React.ReactNode, title: string, body?: string, action?: React.ReactNode }} props
 */
export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-textMuted mb-4">{icon}</div>}
      <h3 className="text-sm font-medium text-text mb-1">{title}</h3>
      {body && <p className="text-sm text-textMuted max-w-xs">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
