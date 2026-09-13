import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Car, Pencil, Trash2, Gauge, Fuel } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectVehicle } from '../store/slices/vehicleSlice';
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../features/vehicles/hooks/use-vehicles';
import { vehicleSchema } from '../entities/vehicle/validation';
import { PageHeader } from '../shared/ui/PageHeader';
import { Modal } from '../shared/ui/Modal';
import { ConfirmDialog } from '../shared/ui/ConfirmDialog';
import { FormField, inputCls, selectCls } from '../shared/ui/FormField';
import { EmptyState } from '../shared/ui/EmptyState';
import { SkeletonLoader } from '../shared/ui/SkeletonLoader';
import { formatDistance, formatDate } from '../shared/lib/format';

function VehicleForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Brand" required error={errors.brand?.message}>
          <input {...register('brand')} className={inputCls} placeholder="Maruti, Honda…" />
        </FormField>
        <FormField label="Model" required error={errors.model?.message}>
          <input {...register('model')} className={inputCls} placeholder="Swift, City…" />
        </FormField>
      </div>
      <FormField label="Variant" error={errors.variant?.message}>
        <input {...register('variant')} className={inputCls} placeholder="VXi, ZX Turbo…" />
      </FormField>
      <FormField label="Registration Number" required error={errors.registrationNumber?.message}>
        <input {...register('registrationNumber')} className={inputCls} placeholder="TN01AB1234" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Purchase Date" required error={errors.purchaseDate?.message}>
          <input {...register('purchaseDate')} type="date" className={inputCls} />
        </FormField>
        <FormField label="Fuel Type" required error={errors.fuelType?.message}>
          <select {...register('fuelType')} className={selectCls}>
            <option value="">Select…</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric</option>
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Purchase Price (₹)" error={errors.purchasePrice?.message}>
          <input {...register('purchasePrice')} type="number" className={inputCls} placeholder="850000" />
        </FormField>
        <FormField label="Current Odometer (km)" error={errors.odometer?.message}>
          <input {...register('odometer')} type="number" className={inputCls} placeholder="12000" />
        </FormField>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save Vehicle'}
      </button>
    </form>
  );
}

export function VehiclesPage() {
  const dispatch = useDispatch();
  const distanceUnit = useSelector((s) => s.settings.distanceUnit);
  const { data: vehicles = [], isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function handleCreate(data) {
    try {
      const v = await createVehicle.mutateAsync({ data });
      dispatch(selectVehicle(v.id));
      setAddOpen(false);
      toast.success('Vehicle added');
    } catch {
      toast.error('Failed to add vehicle');
    }
  }

  async function handleUpdate(data) {
    try {
      await updateVehicle.mutateAsync({ id: editTarget.id, data });
      setEditTarget(null);
      toast.success('Vehicle updated');
    } catch {
      toast.error('Failed to update vehicle');
    }
  }

  async function handleDelete() {
    try {
      await deleteVehicle.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Vehicle removed');
    } catch {
      toast.error('Failed to remove vehicle');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Vehicles"
        subtitle="Manage your registered vehicles"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Plus size={15} /> Add Vehicle
          </button>
        }
      />

      {isLoading ? (
        <SkeletonLoader rows={3} height="h-28" />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car size={40} />}
          title="No vehicles yet"
          body="Add your first vehicle to get started"
          action={
            <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
              Add Vehicle
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-surface border border-border rounded-xl p-4 hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text">{v.brand} {v.model}</h3>
                  {v.variant && <p className="text-xs text-textMuted">{v.variant}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditTarget(v)} className="p-1.5 text-textMuted hover:text-text rounded transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-textMuted hover:text-destructive rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-textMuted font-mono">{v.registrationNumber}</p>
                <div className="flex gap-3 text-xs text-textMuted">
                  {v.odometer > 0 && (
                    <span className="flex items-center gap-1"><Gauge size={11} />{formatDistance(v.odometer, distanceUnit)}</span>
                  )}
                  {v.fuelType && (
                    <span className="flex items-center gap-1 capitalize"><Fuel size={11} />{v.fuelType}</span>
                  )}
                </div>
                {v.purchaseDate && (
                  <p className="text-xs text-textMuted">Purchased {formatDate(v.purchaseDate)}</p>
                )}
              </div>
              <button
                onClick={() => dispatch(selectVehicle(v.id))}
                className="mt-3 w-full py-1.5 text-xs border border-border rounded-md text-textMuted hover:border-accent hover:text-accent transition-colors"
              >
                Set as Active
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Vehicle">
        <VehicleForm onSubmit={handleCreate} loading={createVehicle.isPending} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Vehicle">
        {editTarget && (
          <VehicleForm
            defaultValues={editTarget}
            onSubmit={handleUpdate}
            loading={updateVehicle.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this vehicle?"
        body="This will not delete associated documents or service records."
        loading={deleteVehicle.isPending}
      />
    </div>
  );
}
