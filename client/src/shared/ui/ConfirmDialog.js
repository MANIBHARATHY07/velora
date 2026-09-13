import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

/**
 * @param {{ open: boolean, onClose: () => void, onConfirm: () => void, title?: string, body?: string, loading?: boolean }} props
 */
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', body, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={20} className="text-destructive" />
        </div>
        <div>
          <p className="font-medium text-text">{title}</p>
          {body && <p className="text-sm text-textMuted mt-1">{body}</p>}
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-border text-textMuted hover:text-text transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-destructive text-white hover:bg-destructive/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
