import axios from 'axios'

const API_BASE = 'https://social-dm-analytics.onrender.com/api/'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
}

// ── Platforms ──
export const platformAPI = {
  list: () => api.get('/platforms/'),
  available: () => api.get('/platforms/available/'),
  connectUrl: (platform) => api.get(`/platforms/${platform}/connect/`),
  callback: (platform, data) => api.post(`/platforms/${platform}/callback/`, data),
  setupWhatsApp: (data) => api.post('/platforms/whatsapp/setup/', data),
  disconnect: (id) => api.post(`/platforms/${id}/disconnect/`),
  reconnect: (id) => api.post(`/platforms/${id}/reconnect/`),
}

// ── Products ──
export const productAPI = {
  list: (params) => api.get('/products/', { params }),
  get: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  analytics: (id, days = 30) => api.get(`/products/${id}/analytics/`, { params: { days } }),
}

// ── Catalog ──
export const catalogAPI = {
  upload: (file) => {
    const form = new FormData()
    form.append('csv_file', file)
    return api.post('/catalog/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  downloadTemplate: () => api.get('/catalog/template/', { responseType: 'blob' }),
  history: () => api.get('/catalog/history/'),
}

// ── Messages ──
export const messageAPI = {
  list: (params) => api.get('/messages/', { params }),
  toggleResolved: (id) => api.post(`/messages/${id}/toggle-resolved/`),
  markRead: (id) => api.post(`/messages/${id}/mark-read/`),
  bulkResolve: (ids) => api.post('/messages/bulk-resolve/', { ids }),
}

// ── Dashboard & Analytics ──
export const analyticsAPI = {
  dashboard: (days = 30) => api.get('/dashboard/', { params: { days } }),
  insights: (days = 30) => api.get('/insights/', { params: { days } }),
  exportReport: (days = 30) => api.get('/export/', { params: { days }, responseType: 'blob' }),
  onboardingStatus: () => api.get('/onboarding/status/'),
}

// ── Sync ──
export const syncAPI = {
  syncAll: () => api.post('/sync/'),
  syncPlatform: (platform) => api.post('/sync/', { platform }),
}

export default api
