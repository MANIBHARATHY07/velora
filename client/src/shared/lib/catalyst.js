/**
 * Catalyst Web Client Hosting exposes the browser SDK as `window.catalyst`
 * after catalystWebSDK.js and /__catalyst/sdk/init.js load.
 * @returns {object}
 */
function getCatalyst() {
  if (typeof window !== 'undefined' && window.catalyst) {
    return window.catalyst;
  }
  throw new Error('Catalyst SDK not available. Open the Web Client Hosting URL, not Slate or Vite.');
}

/** @param {object} response */
function unwrap(response) {
  if (response && response.content !== undefined) return response.content;
  return response;
}

/** @returns {object} Data Store component (`catalyst.table`) */
export function getDataStore() {
  return getCatalyst().table;
}

/** @returns {object} File Store component (`catalyst.file`) */
export function getFileStore() {
  return getCatalyst().file;
}

/** @returns {object} */
export function getAuth() {
  const auth = getCatalyst().auth;
  const signOut = auth.signOut.bind(auth);
  return {
    signOut: (redirectUrl) => signOut(redirectUrl || '/__catalyst/auth/login'),
  };
}

/** @returns {Promise<object>} current Catalyst user */
export async function getCurrentUser() {
  const response = await getCatalyst().auth.isUserAuthenticated();
  const user = unwrap(response);
  return user;
}

export { unwrap };
