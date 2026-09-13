import React from 'react';
import { Wrench, MapPin, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency, formatDistance } from '../lib/format';
import { useSelector } from 'react-redux';

/**
 * @param {{ record: object, onPreviewInvoice?: () => void }} props
 */
export function ServiceCard({ record, onPreviewInvoice }) {
  const currency = useSelector((s) => s.settings.currency);
  const distanceUnit = useSelector((s) => s.settings.distanceUnit);

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Wrench size={14} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">{record.serviceType}</p>
            <p className="text-xs text-textMuted">{formatDate(record.serviceDate)}</p>
          </div>
        </div>
        {record.totalCost > 0 && (
          <span className="text-sm font-semibold text-text">{formatCurrency(record.totalCost, currency)}</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-textMuted">
        {record.workshopName && (
          <span className="flex items-center gap-1"><MapPin size={11} />{record.workshopName}</span>
        )}
        {record.odometer > 0 && (
          <span>{formatDistance(record.odometer, distanceUnit)}</span>
        )}
        {record.invoiceFileStoreId && (
          <button onClick={onPreviewInvoice} className="flex items-center gap-1 text-accent hover:underline">
            <ExternalLink size={11} />Invoice
          </button>
        )}
      </div>

      {record.partsChanged && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-textMuted">
            <span className="text-text font-medium">Parts: </span>{record.partsChanged}
          </p>
        </div>
      )}

      {record.notes && (
        <p className="text-xs text-textMuted mt-1">{record.notes}</p>
      )}
    </div>
  );
}
