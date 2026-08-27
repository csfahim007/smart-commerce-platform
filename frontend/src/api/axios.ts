import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Standard 15s timeout for fast JSON endpoints
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  const isAuthRequest =
    config.url?.startsWith('/auth/login') ||
    config.url?.startsWith('/auth/register')

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname

      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      if (
        !currentPath.startsWith('/login') &&
        !currentPath.startsWith('/register')
      ) {
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }
    }

    return Promise.reject(error)
  },
)

/**
 * Image upload API call with an extended 60-second timeout
 */
export async function uploadProductImage(productId: string | number, formData: FormData) {
  return api.post(`/products/${productId}/images`, formData, {
    timeout: 60000, // 👈 Extended 60s timeout strictly for image uploads
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export default api