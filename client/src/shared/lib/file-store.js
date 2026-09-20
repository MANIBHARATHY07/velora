import { getFileStore, unwrap } from './catalyst';

const FOLDER_NAME = 'velora_documents';

/** @type {Promise<string> | null} */
let folderIdPromise = null;

/**
 * @param {object} response
 * @returns {object[]}
 */
function listFrom(response) {
  const content = unwrap(response);
  if (Array.isArray(content)) return content;
  return [];
}

/** @returns {Promise<object>} */
async function getFolder() {
  const fileStore = getFileStore();
  if (!folderIdPromise) {
    folderIdPromise = fileStore.getAllFolder().then((response) => {
      const folders = listFrom(response);
      const match = folders.find((folder) => (folder.folder_name || folder.name) === FOLDER_NAME);
      if (!match) {
        throw new Error(`File Store folder "${FOLDER_NAME}" was not found`);
      }
      return String(match.id || match.folder_id);
    }).catch((error) => {
      folderIdPromise = null;
      throw error;
    });
  }
  const folderId = await folderIdPromise;
  return fileStore.folderId(folderId);
}

/**
 * Upload a file to Catalyst File Store.
 * @param {File} file
 * @returns {Promise<{ fileStoreId: string, fileName: string, mimeType: string }>}
 */
export async function uploadFile(file) {
  const folder = await getFolder();
  const response = await folder.uploadFile(file).start();
  const content = unwrap(response) || {};
  return {
    fileStoreId: String(content.id || content.file_id),
    fileName: content.file_name || file.name,
    mimeType: file.type,
  };
}

/**
 * Get a signed download URL for a file.
 * @param {string} fileStoreId
 * @returns {Promise<string>}
 */
export async function getFileUrl(fileStoreId) {
  const folder = await getFolder();
  const file = folder.fileId(fileStoreId);
  const response = typeof file.get === 'function' ? await file.get() : null;
  const content = unwrap(response) || {};
  return content.download_url || content.file_location || content.url || '';
}

/**
 * Delete a file from File Store.
 * @param {string} fileStoreId
 * @returns {Promise<void>}
 */
export async function deleteFile(fileStoreId) {
  const folder = await getFolder();
  await folder.fileId(fileStoreId).delete();
}
