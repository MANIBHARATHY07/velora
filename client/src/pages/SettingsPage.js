import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Download, LogOut } from 'lucide-react';
import { updateSettings } from '../store/slices/settingsSlice';
import { getAuth } from '../shared/lib/catalyst';
import { vehicleRepository } from '../entities/vehicle/repository';
import { documentRepository } from '../entities/document/repository';
import { serviceRepository } from '../entities/service-record/repository';
import { reminderRepository } from '../entities/reminder/repository';
import { expenseRepository } from '../entities/expense/repository';
import { PageHeader } from '../shared/ui/PageHeader';
import { FormField, selectCls } from '../shared/ui/FormField';

function Setting({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="text-xs text-textMuted mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const dispatch = useDispatch();
  const { currency, distanceUnit, userId } = useSelector((s) => s.settings);

  async function handleExport() {
    try {
      const [vehicles, documents, serviceRecords, reminders, expenses] = await Promise.all([
        vehicleRepository.getAll(userId),
        documentRepository.getAll(userId),
        serviceRepository.getAll(userId),
        reminderRepository.getAll(userId),
        expenseRepository.getAll(userId),
      ]);

      const data = { vehicles, documents, serviceRecords, reminders, expenses, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velora-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch {
      toast.error('Export failed');
    }
  }

  async function handleSignOut() {
    try {
      await getAuth().signOut();
    } catch {
      toast.error('Sign out failed');
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <PageHeader title="Settings" />

      <div className="bg-surface border border-border rounded-xl px-5">
        <Setting label="Currency" description="Used for displaying costs">
          <select
            value={currency}
            onChange={(e) => dispatch(updateSettings({ currency: e.target.value }))}
            className={selectCls + ' w-28'}
          >
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
          </select>
        </Setting>

        <Setting label="Distance Unit" description="Used for odometer readings">
          <select
            value={distanceUnit}
            onChange={(e) => dispatch(updateSettings({ distanceUnit: e.target.value }))}
            className={selectCls + ' w-28'}
          >
            <option value="km">Kilometres</option>
            <option value="miles">Miles</option>
          </select>
        </Setting>

        <Setting label="Export Data" description="Download all your Velora data as JSON">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-textMuted hover:text-text hover:border-accent transition-colors"
          >
            <Download size={14} /> Export
          </button>
        </Setting>

        <Setting label="Sign Out" description="Sign out of your Zoho account">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-destructive/40 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </Setting>
      </div>

      <p className="text-xs text-textMuted text-center mt-6">Velora v1.0 · Powered by Claude</p>
    </div>
  );
}
