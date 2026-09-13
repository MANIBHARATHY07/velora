import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Wrench } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useServiceRecords, useCreateServiceRecord } from '../features/service-history/hooks/use-service-records';
import { serviceRecordSchema } from '../entities/service-record/validation';
import { PageHeader } from '../shared/ui/PageHeader';
import { Modal } from '../shared/ui/Modal';
import { FormField, inputCls, selectCls } from '../shared/ui/FormField';
import { EmptyState } from '../shared/ui/EmptyState';
import { SkeletonLoader } from '../shared/ui/SkeletonLoader';
import { ServiceCard } from '../shared/ui/ServiceCard';
import { FileUploader } from '../shared/ui/FileUploader';
import { getFileUrl } from '../shared/lib/file-store';

const SERVICE_TYPES = ['Periodic Service', 'Oil Change', 'Tyre Replacement', 'Brake Service', 'Battery Replacement', 'Accident Repair', 'Warranty Claim', 'SOT Claim', 'Other'];

function ServiceForm({ onSubmit, loading }) {
  const [invoiceFileData, setInvoiceFileData] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(serviceRecordSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, invoiceFileStoreId: invoiceFileData?.fileStoreId }))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Service Date" required error={errors.serviceDate?.message}>
          <input {...register('serviceDate')} type="date" className={inputCls} />
        </FormField>
        <FormField label="Odometer (km)" error={errors.odometer?.message}>
          <input {...register('odometer')} type="number" className={inputCls} placeholder="45000" />
        </FormField>
      </div>
      <FormField label="Workshop Name" required error={errors.workshopName?.message}>
        <input {...register('workshopName')} className={inputCls} placeholder="Maruti Suzuki Authorized, Chennai" />
      </FormField>
      <FormField label="Service Type" required error={errors.serviceType?.message}>
        <select {...register('serviceType')} className={selectCls}>
          <option value="">Select…</option>
          {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Parts Replaced" error={errors.partsChanged?.message}>
        <input {...register('partsChanged')} className={inputCls} placeholder="Oil filter, air filter, brake pads…" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Labour Cost (₹)" error={errors.labourCost?.message}>
          <input {...register('labourCost')} type="number" className={inputCls} placeholder="2500" />
        </FormField>
        <FormField label="Total Cost (₹)" error={errors.totalCost?.message}>
          <input {...register('totalCost')} type="number" className={inputCls} placeholder="4800" />
        </FormField>
      </div>
      <FormField label="Notes" error={errors.notes?.message}>
        <input {...register('notes')} className={inputCls} placeholder="Any additional notes…" />
      </FormField>
      <FormField label="Invoice (optional)">
        <FileUploader onUploaded={setInvoiceFileData} />
      </FormField>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : 'Save Service Record'}
      </button>
    </form>
  );
}

export function ServiceHistoryPage() {
  const selectedVehicleId = useSelector((s) => s.vehicle.selectedVehicleId);
  const { data: records = [], isLoading } = useServiceRecords(selectedVehicleId);
  const createRecord = useCreateServiceRecord();
  const [addOpen, setAddOpen] = useState(false);

  async function handleCreate(data) {
    try {
      await createRecord.mutateAsync({ ...data, vehicleId: selectedVehicleId });
      setAddOpen(false);
      toast.success('Service record saved');
    } catch {
      toast.error('Failed to save service record');
    }
  }

  async function handlePreviewInvoice(record) {
    try {
      const url = await getFileUrl(record.invoiceFileStoreId);
      window.open(url, '_blank');
    } catch {
      toast.error('Could not open invoice');
    }
  }

  if (!selectedVehicleId) {
    return (
      <div className="p-6">
        <EmptyState icon={<Wrench size={40} />} title="No vehicle selected" body="Select a vehicle to view service history." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Service History"
        subtitle="Track every service and repair"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Plus size={15} /> Add Service Record
          </button>
        }
      />

      {isLoading ? (
        <SkeletonLoader rows={4} height="h-24" />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Wrench size={40} />}
          title="No service records"
          body="Log your first service to start tracking"
          action={
            <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
              Add Service Record
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <ServiceCard
              key={r.id}
              record={r}
              onPreviewInvoice={r.invoiceFileStoreId ? () => handlePreviewInvoice(r) : undefined}
            />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Service Record" wide>
        <ServiceForm onSubmit={handleCreate} loading={createRecord.isPending} />
      </Modal>
    </div>
  );
}
