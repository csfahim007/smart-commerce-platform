import axios from 'axios'

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const status = error.response?.status

    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message
    }

    if (
      data &&
      typeof data === 'object' &&
      'errors' in data &&
      typeof data.errors === 'object' &&
      data.errors !== null
    ) {
      const errors = data.errors as Record<
        string,
        string[]
      >

      const firstError = Object.values(errors)
        .flat()
        .find(Boolean)

      if (firstError) {
        return firstError
      }
    }

    if (status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (status === 403) {
      return 'You do not have permission to perform this action.'
    }

    if (status === 404) {
      return 'The requested resource was not found.'
    }

    if (status === 422) {
      return 'Please check the information you entered.'
    }

    if (status && status >= 500) {
      return 'The server encountered a problem. Please try again later.'
    }
  }

  
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}