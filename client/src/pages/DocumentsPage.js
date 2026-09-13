import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useDocuments, useCreateDocument, useDeleteDocument } from '../features/documents/hooks/use-documents';
import { documentSchema, DOCUMENT_TYPES } from '../entities/document/validation';
import { PageHeader } from '../shared/ui/PageHeader';
import { Modal } from '../shared/ui/Modal';
import { ConfirmDialog } from '../shared/ui/ConfirmDialog';
import { FormField, inputCls, selectCls } from '../shared/ui/FormField';
import { EmptyState } from '../shared/ui/EmptyState';
import { SkeletonLoader } from '../shared/ui/SkeletonLoader';
import { DocumentCard } from '../shared/ui/DocumentCard';
import { FileUploader } from '../shared/ui/FileUploader';
import { getFileUrl } from '../shared/lib/file-store';

const TAB_LABELS = {
  sot: 'Shield of Trust', insurance: 'Insurance', warranty: 'Warranty',
  rc: 'RC', puc: 'PUC', invoice: 'Invoice', quotation: 'Quotation', loan: 'Loan',
};

function UploadForm({ onSubmit, loading }) {
  const [fileData, setFileData] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: { type: 'insurance' },
  });

  function submit(data) {
    onSubmit({ ...data, ...fileData });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <FileUploader onUploaded={(r) => setFileData(r ? { fileStoreId: r.fileStoreId, fileName: r.fileName, mimeType: r.mimeType } : null)} />
      <FormField label="Document Name" required error={errors.name?.message}>
        <input {...register('name')} className={inputCls} placeholder="e.g. Insurance Policy 2025" />
      </FormField>
      <FormField label="Document Type" required error={errors.type?.message}>
        <select {...register('type')} className={selectCls}>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{TAB_LABELS[t] || t}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Expiry Date" error={errors.expiryDate?.message}>
        <input {...register('expiryDate')} type="date" className={inputCls} />
      </FormField>
      <FormField label="Notes" error={errors.notes?.message}>
        <input {...register('notes')} className={inputCls} placeholder="Policy number, agent name…" />
      </FormField>
      <FormField label="Coverage Details (paste for AI search)" error={errors.extractedText?.message}>
        <textarea
          {...register('extractedText')}
          rows={4}
          className={inputCls}
          placeholder="Paste the coverage terms, inclusions/exclusions from the document here so Velora can answer questions about it…"
        />
      </FormField>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : 'Save Document'}
      </button>
    </form>
  );
}

export function DocumentsPage() {
  const selectedVehicleId = useSelector((s) => s.vehicle.selectedVehicleId);
  const { data: allDocs = [], isLoading } = useDocuments(selectedVehicleId);
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();

  const [activeTab, setActiveTab] = useState('sot');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const tabDocs = allDocs.filter((d) => d.type === activeTab);

  async function handleCreate(data) {
    try {
      await createDoc.mutateAsync({ ...data, vehicleId: selectedVehicleId });
      setAddOpen(false);
      toast.success('Document saved');
    } catch {
      toast.error('Failed to save document');
    }
  }

  async function handleDelete() {
    try {
      await deleteDoc.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  async function handlePreview(doc) {
    try {
      const url = await getFileUrl(doc.fileStoreId);
      window.open(url, '_blank');
    } catch {
      toast.error('Could not open file');
    }
  }

  if (!selectedVehicleId) {
    return (
      <div className="p-6">
        <EmptyState icon={<FileText size={40} />} title="No vehicle selected" body="Select a vehicle from the sidebar to view documents." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Documents Vault"
        subtitle="All your vehicle documents in one place"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Plus size={15} /> Upload Document
          </button>
        }
      />

      <div className="flex gap-1 mb-6 flex-wrap border-b border-border pb-1">
        {DOCUMENT_TYPES.map((t) => {
          const count = allDocs.filter((d) => d.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === t ? 'bg-surfaceElevated text-text' : 'text-textMuted hover:text-text'
              }`}
            >
              {TAB_LABELS[t]}
              {count > 0 && (
                <span className="text-xs bg-accent/20 text-accent px-1.5 rounded-full">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <SkeletonLoader rows={3} />
      ) : tabDocs.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title={`No ${TAB_LABELS[activeTab]} documents`}
          body="Upload a document to get started"
          action={
            <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-accent text-white text-sm rounded-lg">
              Upload Document
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tabDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onPreview={() => handlePreview(doc)}
              onDelete={() => setDeleteTarget(doc)}
            />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Upload Document" wide>
        <UploadForm onSubmit={handleCreate} loading={createDoc.isPending} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this document?"
        body="The file will also be removed from storage."
        loading={deleteDoc.isPending}
      />
    </div>
  );
}
