import { apiUrl } from './apiBase';

const USER_PROFILE_CACHE_PREFIX = 'user_profile:';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const cacheKey = (email) => `${USER_PROFILE_CACHE_PREFIX}${normalizeEmail(email)}`;

export const readCachedUserProfile = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized || typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKey(normalized));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeCachedUserProfile = (email, profile) => {
  const normalized = normalizeEmail(email);
  if (!normalized || !profile || typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(cacheKey(normalized), JSON.stringify(profile));
  } catch {
    // ignore cache errors
  }
};

export const fetchUserProfileByEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const response = await fetch(apiUrl(`/api/user/${encodeURIComponent(normalized)}`));
  if (!response.ok) return null;

  const data = await response.json();
  if (!data || typeof data !== 'object') return null;

  writeCachedUserProfile(normalized, data);
  return data;
};

export const resolveProfilePathByEmail = async (email, fallbackPath = '/settings') => {
  const cached = readCachedUserProfile(email);
  if (cached?.user_id) {
    return `/profile/${cached.user_id}`;
  }

  const data = await fetchUserProfileByEmail(email);
  if (data?.user_id) {
    return `/profile/${data.user_id}`;
  }

  return fallbackPath;
};
