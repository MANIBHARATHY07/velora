/**
 * Catalyst SDK is injected by the Catalyst platform at runtime as window.ZCatalyst.
 * When running locally outside Catalyst, a mock or the Catalyst local dev proxy handles this.
 *
 * @returns {object} Catalyst app instance
 */
function getApp() {
  if (typeof window !== 'undefined' && window.ZCatalyst) {
    return window.ZCatalyst.initialize();
  }
  throw new Error('Catalyst SDK not available. Deploy to Zoho Catalyst or run via `catalyst serve`.');
}

/** @returns {object} */
export function getDataStore() {
  return getApp().datastore();
}

/** @returns {object} */
export function getFileStore() {
  return getApp().filestore();
}

/** @returns {object} */
export function getAuth() {
  return getApp().auth();
}

/** @returns {Promise<object>} current Catalyst user */
export async function getCurrentUser() {
  return getAuth().getCurrentUser();
}
