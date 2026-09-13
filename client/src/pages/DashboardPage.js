import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bot, Car, Gauge, Fuel, ArrowRight } from 'lucide-react';
import { startOfToday, parseISO, isBefore } from 'date-fns';
import { useVehicles } from '../features/vehicles/hooks/use-vehicles';
import { useDocuments } from '../features/documents/hooks/use-documents';
import { useReminders } from '../features/reminders/hooks/use-reminders';
import { useServiceRecords } from '../features/service-history/hooks/use-service-records';
import { StatusBadge } from '../shared/ui/StatusBadge';
import { ReminderCard } from '../shared/ui/ReminderCard';
import { ServiceCard } from '../shared/ui/ServiceCard';
import { EmptyState } from '../shared/ui/EmptyState';
import { SkeletonLoader } from '../shared/ui/SkeletonLoader';
import { formatDate, formatDistance } from '../shared/lib/format';
import { useToggleReminder } from '../features/reminders/hooks/use-reminders';
import { toast } from 'sonner';

export function DashboardPage() {
  const navigate = useNavigate();
  const selectedVehicleId = useSelector((s) => s.vehicle.selectedVehicleId);
  const distanceUnit = useSelector((s) => s.settings.distanceUnit);
  const { data: vehicles = [] } = useVehicles();
  const { data: docs = [], isLoading: docsLoading } = useDocuments(selectedVehicleId);
  const { data: reminders = [], isLoading: remindersLoading } = useReminders(selectedVehicleId);
  const { data: serviceRecords = [], isLoading: serviceLoading } = useServiceRecords(selectedVehicleId);
  const toggleReminder = useToggleReminder();

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const insurance = docs.find((d) => d.type === 'insurance' && d.expiryDate);
  const puc = docs.find((d) => d.type === 'puc' && d.expiryDate);

  const today = startOfToday();
  const upcomingReminders = reminders
    .filter((r) => !r.completed && !isBefore(parseISO(r.dueDate), today))
    .slice(0, 3);

  const recentService = serviceRecords.slice(0, 2);

  async function handleToggleReminder(reminder) {
    try {
      await toggleReminder.mutateAsync({ id: reminder.id, completed: !reminder.completed });
    } catch {
      toast.error('Failed to update reminder');
    }
  }

  if (!selectedVehicleId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Car size={40} />}
          title="No vehicle selected"
          body="Add a vehicle to see your dashboard"
          action={
            <button onClick={() => navigate('/vehicles')} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
              Add Vehicle
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {vehicle && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">{vehicle.brand} {vehicle.model}</h2>
              {vehicle.variant && <p className="text-sm text-textMuted">{vehicle.variant}</p>}
              <p className="text-xs font-mono text-textMuted mt-1">{vehicle.registrationNumber}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Car size={20} className="text-accent" />
            </div>
          </div>
          <div className="flex gap-4 mt-4 flex-wrap">
            {vehicle.odometer > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-textMuted">
                <Gauge size={14} />
                <span>{formatDistance(vehicle.odometer, distanceUnit)}</span>
              </div>
            )}
            {vehicle.fuelType && (
              <div className="flex items-center gap-1.5 text-sm text-textMuted capitalize">
                <Fuel size={14} />
                <span>{vehicle.fuelType}</span>
              </div>
            )}
            {vehicle.purchaseDate && (
              <span className="text-sm text-textMuted">Since {formatDate(vehicle.purchaseDate)}</span>
            )}
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            {insurance && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surfaceElevated rounded-lg">
                <span className="text-xs text-textMuted">Insurance</span>
                <StatusBadge date={insurance.expiryDate} />
              </div>
            )}
            {puc && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surfaceElevated rounded-lg">
                <span className="text-xs text-textMuted">PUC</span>
                <StatusBadge date={puc.expiryDate} />
              </div>
            )}
            {recentService[0] && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surfaceElevated rounded-lg">
                <span className="text-xs text-textMuted">Last Service</span>
                <span className="text-xs text-text">{formatDate(recentService[0].serviceDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/copilot')}
        className="w-full flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl p-4 hover:bg-accent/20 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
            <Bot size={18} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text">Ask Velora</p>
            <p className="text-xs text-textMuted">Is my clutch covered? When was my last oil change?</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-accent group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">Upcoming Reminders</h3>
            <button onClick={() => navigate('/reminders')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          {remindersLoading ? (
            <SkeletonLoader rows={2} height="h-14" />
          ) : upcomingReminders.length === 0 ? (
            <p className="text-sm text-textMuted">No upcoming reminders</p>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map((r) => (
                <ReminderCard key={r.id} reminder={r} onToggle={() => handleToggleReminder(r)} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">Recent Services</h3>
            <button onClick={() => navigate('/service-history')} className="text-xs text-accent hover:underline">View all</button>
          </div>
          {serviceLoading ? (
            <SkeletonLoader rows={2} height="h-20" />
          ) : recentService.length === 0 ? (
            <p className="text-sm text-textMuted">No service records yet</p>
          ) : (
            <div className="space-y-2">
              {recentService.map((r) => <ServiceCard key={r.id} record={r} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
