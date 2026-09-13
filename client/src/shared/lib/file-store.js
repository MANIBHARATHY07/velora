import { getFileStore } from './catalyst';

const FOLDER_NAME = 'velora-documents';

/**
 * Upload a file to Catalyst File Store.
 * @param {File} file
 * @returns {Promise<{ fileStoreId: string, fileName: string, mimeType: string }>}
 */
export async function uploadFile(file) {
  const fileStore = getFileStore();
  const folder = fileStore.folder(FOLDER_NAME);
  const result = await folder.uploadFile(file);
  return {
    fileStoreId: String(result.id),
    fileName: result.file_name,
    mimeType: file.type,
  };
}

/**
 * Get a signed download URL for a file.
 * @param {string} fileStoreId
 * @returns {Promise<string>}
 */
export async function getFileUrl(fileStoreId) {
  const fileStore = getFileStore();
  const folder = fileStore.folder(FOLDER_NAME);
  const fileDetails = await folder.getFileDetails(fileStoreId);
  return fileDetails.file_location || fileDetails.url || '';
}

/**
 * Delete a file from File Store.
 * @param {string} fileStoreId
 * @returns {Promise<void>}
 */
export async function deleteFile(fileStoreId) {
  const fileStore = getFileStore();
  const folder = fileStore.folder(FOLDER_NAME);
  await folder.deleteFile(fileStoreId);
}
