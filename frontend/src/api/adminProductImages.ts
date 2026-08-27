import apiClient from './axios'

export interface CreateProductImagePayload {
  image: File
  is_primary?: boolean
}

export async function getProductImages(productId: number) {
  const response = await apiClient.get(`/products/${productId}/images`)
  return response.data
}

export async function createProductImage(
  productId: number,
  payload: CreateProductImagePayload,
) {
  const formData = new FormData()

  formData.append('image', payload.image)

  if (payload.is_primary !== undefined) {
    formData.append('is_primary', payload.is_primary ? '1' : '0')
  }

  const response = await apiClient.post(
    `/products/${productId}/images`,
    formData,
    {
      timeout: 60000, // Extended 60-second timeout strictly for image uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export async function deleteProductImage(
  productId: number,
  imageId: number,
) {
  const response = await apiClient.delete(
    `/products/${productId}/images/${imageId}`,
  )
  return response.data
}