import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { uploadFile } from '../lib/file-store';

/**
 * @param {{ onUploaded: (result: { fileStoreId: string, fileName: string, mimeType: string }) => void }} props
 */
export function FileUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file);
      setUploadedFile(result.fileName);
      onUploaded(result);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {uploadedFile ? (
        <div className="flex items-center gap-2 p-3 bg-surfaceElevated border border-border rounded-md">
          <File size={16} className="text-accent flex-shrink-0" />
          <span className="text-sm text-text flex-1 truncate">{uploadedFile}</span>
          <button
            type="button"
            onClick={() => { setUploadedFile(null); onUploaded(null); }}
            className="text-textMuted hover:text-destructive transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center gap-2 hover:border-accent transition-colors disabled:opacity-50"
        >
          <Upload size={20} className="text-textMuted" />
          <span className="text-sm text-textMuted">
            {uploading ? 'Uploading…' : 'Click to upload PDF or image'}
          </span>
        </button>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
