import { auth } from '../css/firebase';
import { apiUrl } from './apiBase';

export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('NOT_AUTHENTICATED');
  }
  const token = await user.getIdToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };
  return fetch(apiUrl(url), {
    ...options,
    headers
  });
}
