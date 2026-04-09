import api from './api';

type ActivityStatus = 'Success' | 'Failed';

type TrackActivityPayload = {
  actionType: string;
  url?: string;
  method?: string;
  status?: ActivityStatus;
  metadata?: Record<string, unknown>;
  userName?: string;
  email?: string;
};

const SESSION_STORAGE_KEY = 'activity_session_id';
const DEDUPE_MAP = new Map<string, number>();

const createSessionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `sess_${timestamp}_${random}`;
};

export const getOrCreateActivitySessionId = () => {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createSessionId();
  sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
};

const normalizeUrl = (value?: string) => {
  if (!value) {
    return window.location.pathname + window.location.search;
  }
  return value;
};

const shouldSkipForDedupe = (key: string, dedupeMs: number) => {
  const now = Date.now();
  const previous = DEDUPE_MAP.get(key) || 0;

  if (now - previous < dedupeMs) {
    return true;
  }

  DEDUPE_MAP.set(key, now);
  return false;
};

export const trackActivity = async (
  payload: TrackActivityPayload,
  options?: { dedupeKey?: string; dedupeMs?: number }
) => {
  const actionType = payload.actionType?.trim();
  if (!actionType) {
    return;
  }

  const sessionId = getOrCreateActivitySessionId();
  const url = normalizeUrl(payload.url);
  const method = (payload.method || 'GET').toUpperCase();
  const dedupeMs = options?.dedupeMs ?? 10000;
  const dedupeKey = options?.dedupeKey || `${actionType}|${url}|${method}`;

  if (shouldSkipForDedupe(dedupeKey, dedupeMs)) {
    return;
  }

  try {
    await api.post(
      '/activity/log',
      {
        actionType,
        url,
        method,
        status: payload.status || 'Success',
        sessionId,
        metadata: payload.metadata || {},
        userName: payload.userName,
        email: payload.email,
      },
      {
        headers: {
          'x-session-id': sessionId,
        },
      }
    );
  } catch (error) {
    // Avoid disrupting user actions if activity logging fails.
    console.warn('Activity tracking failed:', error);
  }
};

export const trackPageVisit = async (url?: string) => {
  const normalizedUrl = normalizeUrl(url);

  await trackActivity(
    {
      actionType: 'Page Visit',
      url: normalizedUrl,
      method: 'GET',
      status: 'Success',
      metadata: {
        referrer: document.referrer || '',
      },
    },
    {
      dedupeKey: `PAGE_VISIT|${normalizedUrl}`,
      dedupeMs: 15000,
    }
  );
};

export const trackProductView = async (productId: string, productTitle?: string, url?: string) => {
  const normalizedUrl = normalizeUrl(url);

  await trackActivity(
    {
      actionType: 'Product View',
      url: normalizedUrl,
      method: 'GET',
      status: 'Success',
      metadata: {
        productId,
        productTitle: productTitle || '',
      },
    },
    {
      dedupeKey: `PRODUCT_VIEW|${productId}`,
      dedupeMs: 60000,
    }
  );
};
