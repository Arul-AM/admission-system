import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// ─── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle auth errors ───────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Simple frontend cache (avoids re-fetching same data) ────────────────────
const memCache = new Map();

export const cachedGet = async (url, ttlSeconds = 30) => {
  const key = url;
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < ttlSeconds * 1000) {
    return cached.data;
  }
  const res = await api.get(url);
  memCache.set(key, { data: res.data, ts: Date.now() });
  return res.data;
};

export const clearCache = (urlPattern) => {
  if (urlPattern) {
    for (const key of memCache.keys()) {
      if (key.includes(urlPattern)) memCache.delete(key);
    }
  } else {
    memCache.clear();
  }
};

export default api;
