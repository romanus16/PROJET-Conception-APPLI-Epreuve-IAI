import axios from 'axios'


const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  register: d => api.post('/auth/register/', d),
  login:    d => api.post('/auth/login/', d),
  me:       () => api.get('/auth/me/'),
}

// Filières
export const filieresAPI = {
  list:   () => api.get('/filieres/'),
  create: d  => api.post('/filieres/create/', d),
  update: (id, d) => api.put(`/filieres/${id}/update/`, d),
  delete: id     => api.delete(`/filieres/${id}/delete/`),
}

// Matières
export const matieresAPI = {
  list:   params => api.get('/matieres/', { params }),
  create: d      => api.post('/matieres/create/', d),
  update: (id, d) => api.put(`/matieres/${id}/update/`, d),
  delete: id     => api.delete(`/matieres/${id}/delete/`),
}

// Ressources
export const ressourcesAPI = {
  list:          params => api.get('/ressources/', { params }),
  enAttente:     ()     => api.get('/ressources/en-attente/'),
  mesRessources: ()     => api.get('/ressources/mes-ressources/'),
  upload:        d      => api.post('/upload/ressource/', d, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  valider: (pk, d) => api.post(`/ressources/${pk}/valider/`, d),
  preview: (pk) => api.get(`/ressources/${pk}/preview/`),
}

// Documents stage
export const documentsAPI = {
  list:   () => api.get('/documents/'),
  upload: d  => api.post('/upload/document/', d, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Stats
export const statsAPI = {
  get: () => api.get('/stats/'),
}

// Étudiants (admin only)
export const etudiantsAPI = {
  list: () => api.get('/etudiants/'),
}

// Assistant IA
export const iaAPI = {
  ask: (question, context = '') => api.post('/ia/ask/', { question, context }),
}
