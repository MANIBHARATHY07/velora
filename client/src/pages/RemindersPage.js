import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { parseISO, isBefore, isAfter, startOfToday } from 'date-fns';
import { useReminders, useCreateReminder, useToggleReminder } from '../features/reminders/hooks/use-reminders';
import { reminderSchema } from '../entities/reminder/validation';
import { PageHeader } from '../shared/ui/PageHeader';
import { Modal } from '../shared/ui/Modal';
import { FormField, inputCls, selectCls } from '../shared/ui/FormField';
import { EmptyState } from '../shared/ui/EmptyState';
import { SkeletonLoader } from '../shared/ui/SkeletonLoader';
import { ReminderCard } from '../shared/ui/ReminderCard';

const REMINDER_TYPES = ['service', 'insurance', 'puc', 'emi', 'warranty'];

function ReminderForm({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: { type: 'service' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Title" required error={errors.title?.message}>
        <input {...register('title')} className={inputCls} placeholder="e.g. Renew insurance" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" required error={errors.type?.message}>
          <select {...register('type')} className={selectCls}>
            {REMINDER_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </FormField>
        <FormField label="Due Date" required error={errors.dueDate?.message}>
          <input {...register('dueDate')} type="date" className={inputCls} />
        </FormField>
      </div>
      <FormField label="Notes" error={errors.notes?.message}>
        <input {...register('notes')} className={inputCls} placeholder="Optional notes…" />
      </FormField>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : 'Set Reminder'}
      </button>
    </form>
  );
}

export function RemindersPage() {
  const selectedVehicleId = useSelector((s) => s.vehicle.selectedVehicleId);
  const { data: reminders = [], isLoading } = useReminders(selectedVehicleId);
  const createReminder = useCreateReminder();
  const toggleReminder = useToggleReminder();
  const [addOpen, setAddOpen] = useState(false);

  const today = startOfToday();
  const upcoming = reminders.filter((r) => !r.completed && !isBefore(parseISO(r.dueDate), today));
  const overdue = reminders.filter((r) => !r.completed && isBefore(parseISO(r.dueDate), today));
  const done = reminders.filter((r) => r.completed);

  async function handleCreate(data) {
    try {
      await createReminder.mutateAsync({ ...data, vehicleId: selectedVehicleId });
      setAddOpen(false);
      toast.success('Reminder set');
    } catch {
      toast.error('Failed to set reminder');
    }
  }

  async function handleToggle(reminder) {
    try {
      await toggleReminder.mutateAsync({ id: reminder.id, completed: !reminder.completed });
    } catch {
      toast.error('Failed to update reminder');
    }
  }

  if (!selectedVehicleId) {
    return (
      <div className="p-6">
        <EmptyState icon={<Bell size={40} />} title="No vehicle selected" body="Select a vehicle to manage reminders." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Reminders"
        subtitle="Never miss a service or renewal"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Plus size={15} /> Add Reminder
          </button>
        }
      />

      {isLoading ? (
        <SkeletonLoader rows={4} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="No reminders yet"
          body="Set a reminder for insurance renewal, service, or EMI"
          action={
            <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
              Add Reminder
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-destructive uppercase tracking-wider mb-2">Overdue ({overdue.length})</h2>
              <div className="space-y-2">
                {overdue.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={() => handleToggle(r)} />)}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-textMuted uppercase tracking-wider mb-2">Upcoming ({upcoming.length})</h2>
              <div className="space-y-2">
                {upcoming.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={() => handleToggle(r)} />)}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-textMuted uppercase tracking-wider mb-2">Done ({done.length})</h2>
              <div className="space-y-2">
                {done.map((r) => <ReminderCard key={r.id} reminder={r} onToggle={() => handleToggle(r)} />)}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Reminder">
        <ReminderForm onSubmit={handleCreate} loading={createReminder.isPending} />
      </Modal>
    </div>
  );
}
