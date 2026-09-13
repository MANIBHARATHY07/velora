import React from 'react';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../lib/format';

const TYPE_LABELS = {
  insurance: 'Insurance', rc: 'RC', puc: 'PUC', warranty: 'Warranty',
  sot: 'Shield of Trust', loan: 'Loan', invoice: 'Invoice', quotation: 'Quotation',
};

/**
 * @param {{ doc: object, onPreview: () => void, onDelete: () => void }} props
 */
export function DocumentCard({ doc, onPreview, onDelete }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3 hover:border-accent/40 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-text truncate">{doc.name}</span>
          <span className="text-xs text-textMuted bg-surfaceElevated px-1.5 py-0.5 rounded">
            {TYPE_LABELS[doc.type] || doc.type}
          </span>
        </div>
        {doc.expiryDate && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-textMuted">Expires {formatDate(doc.expiryDate)}</span>
            <StatusBadge date={doc.expiryDate} />
          </div>
        )}
        {doc.notes && <p className="text-xs text-textMuted mt-1 truncate">{doc.notes}</p>}
      </div>
      <div className="flex items-center gap-1">
        {doc.fileStoreId && (
          <button onClick={onPreview} className="p-1.5 text-textMuted hover:text-accent transition-colors rounded">
            <ExternalLink size={14} />
          </button>
        )}
        <button onClick={onDelete} className="p-1.5 text-textMuted hover:text-destructive transition-colors rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
