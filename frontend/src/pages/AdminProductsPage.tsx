import { type ChangeEvent, type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  ImageIcon,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'

import {
  useAdminProductCategoriesQuery,
  useAdminProductImagesQuery,
  useAdminProductsQuery,
  useCreateAdminProductImageMutation,
  useCreateAdminProductMutation,
  useDeleteAdminProductImageMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
} from '../hooks/queries/adminProducts'

import type { Product, ProductImage } from '../types/api'

interface ProductForm {
  category_id: string
  name: string
  slug: string
  sku: string
  description: string
  price: string
  stock: string
  is_active: boolean
}

const emptyForm: ProductForm = {
  category_id: '',
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: '',
  stock: '0',
  is_active: true,
}

function formatPrice(price: string | number) {
  const value = Number(price)

  if (Number.isNaN(value)) {
    return String(price)
  }

  return `৳${value.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getErrorMessage(err: any, fallback: string) {
  const validationErrors = err?.response?.data?.errors

  if (validationErrors) {
    const first = Object.values(validationErrors)[0]

    if (Array.isArray(first) && first.length) {
      return String(first[0])
    }
  }

  return err?.response?.data?.message || fallback
}

export default function AdminProductsPage() {
  const [editingId, setEditingId] = useState<number | null>(null)

  // Unconditional hook calls at top level
  const productsQuery = useAdminProductsQuery()
  const categoriesQuery = useAdminProductCategoriesQuery()
  const imagesQuery = useAdminProductImagesQuery(editingId)

  const createProductMutation = useCreateAdminProductMutation()
  const updateProductMutation = useUpdateAdminProductMutation()
  const deleteProductMutation = useDeleteAdminProductMutation()
  const createImageMutation = useCreateAdminProductImageMutation()
  const deleteImageMutation = useDeleteAdminProductImageMutation()

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // File for creation step
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)

  // Files for edit step
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePrimary, setImagePrimary] = useState(false)

  const products = productsQuery.data?.data ?? []
  const categories = categoriesQuery.data ?? []
  const imageList = imagesQuery.data?.data ?? []

  const loading = productsQuery.isLoading || categoriesQuery.isLoading

  const saving =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    createImageMutation.isPending

  const deletingId = deleteProductMutation.isPending
    ? deleteProductMutation.variables
    : null

  const imageSaving = createImageMutation.isPending

  const imageDeletingId = deleteImageMutation.isPending
    ? deleteImageMutation.variables?.imageId
    : null

  function updateField(
    field: keyof ProductForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setCreateImageFile(null)
    setImageFile(null)
    setImagePrimary(false)
    setError(null)

    const inputCreate = document.getElementById(
      'create-product-image-upload',
    ) as HTMLInputElement | null
    if (inputCreate) inputCreate.value = ''

    const inputEdit = document.getElementById(
      'product-image-upload',
    ) as HTMLInputElement | null
    if (inputEdit) inputEdit.value = ''
  }

  function startEdit(product: Product) {
    setMessage(null)
    setError(null)

    setEditingId(product.id)
    setCreateImageFile(null)
    setImageFile(null)
    setImagePrimary(false)

    setForm({
      category_id: String(product.category_id),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      is_active: product.is_active,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.category_id) {
      setError('Category is required.')
      return
    }

    if (!form.name.trim()) {
      setError('Product name is required.')
      return
    }

    if (!form.sku.trim()) {
      setError('SKU is required.')
      return
    }

    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price.')
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a non-negative integer.')
      return
    }

    try {
      setError(null)
      setMessage(null)

      const payload = {
        category_id: Number(form.category_id),
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        price: form.price,
        stock,
        is_active: form.is_active,
      }

      if (editingId !== null) {
        await updateProductMutation.mutateAsync({
          id: editingId,
          payload,
        })

        setMessage('Product updated successfully.')
      } else {
        const newProduct = await createProductMutation.mutateAsync(payload)

        if (createImageFile && newProduct?.id) {
          await createImageMutation.mutateAsync({
            productId: newProduct.id,
            payload: {
              image: createImageFile,
              is_primary: true,
            },
          })
          setMessage('Product and primary image created successfully.')
        } else {
          setMessage('Product created successfully.')
        }
      }

      resetForm()
    } catch (err: any) {
      console.error('[ADMIN PRODUCTS] Save failed:', err)
      setError(getErrorMessage(err, 'Unable to save product.'))
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"?`)) {
      return
    }

    try {
      setError(null)
      setMessage(null)

      await deleteProductMutation.mutateAsync(product.id)

      if (editingId === product.id) {
        resetForm()
      }

      setMessage('Product deleted successfully.')
    } catch (err: any) {
      console.error('[ADMIN PRODUCTS] Delete failed:', err)
      setError(getErrorMessage(err, 'Unable to delete product.'))
    }
  }

  function validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.')
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return false
    }

    return true
  }

  function handleCreateImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setError(null)

    if (file && validateFile(file)) {
      setCreateImageFile(file)
    } else {
      setCreateImageFile(null)
      event.target.value = ''
    }
  }

  function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setError(null)

    if (file && validateFile(file)) {
      setImageFile(file)
    } else {
      setImageFile(null)
      event.target.value = ''
    }
  }

  async function handleAddImage() {
    if (editingId === null) {
      setError('Save the product before adding images.')
      return
    }

    if (!imageFile) {
      setError('Please select an image.')
      return
    }

    try {
      setError(null)
      setMessage(null)

      await createImageMutation.mutateAsync({
        productId: editingId,
        payload: {
          image: imageFile,
          is_primary: imagePrimary,
        },
      })

      setImageFile(null)
      setImagePrimary(false)

      setMessage('Product image uploaded successfully.')

      const input = document.getElementById(
        'product-image-upload',
      ) as HTMLInputElement | null

      if (input) {
        input.value = ''
      }
    } catch (err: any) {
      console.error('[ADMIN PRODUCTS] Failed to upload image:', err)
      setError(getErrorMessage(err, 'Unable to upload product image.'))
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (editingId === null) return
    if (!window.confirm('Delete this product image?')) return

    try {
      setError(null)
      setMessage(null)

      await deleteImageMutation.mutateAsync({
        productId: editingId,
        imageId,
      })

      setMessage('Product image deleted successfully.')
    } catch (err: any) {
      console.error('[ADMIN PRODUCTS] Failed to delete image:', err)
      setError(getErrorMessage(err, 'Unable to delete product image.'))
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-neutral-500">Loading products and categories...</p>
      </div>
    )
  }

  if (productsQuery.isError || categoriesQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p>
            {getErrorMessage(
              productsQuery.error || categoriesQuery.error,
              'Unable to load products.',
            )}
          </p>
          <button
            type="button"
            className="mt-2 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            onClick={() => {
              productsQuery.refetch()
              categoriesQuery.refetch()
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Admin Products
          </h1>
          <p className="text-sm text-neutral-500">
            Manage your product inventory, pricing, and image assets.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingId ? 'Edit Product' : 'Create Product'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => updateField('sku', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="Auto-generated"
                    className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Category *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateField('category_id', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Price (BDT) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {editingId === null && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Product Cover Image (Optional)
                  </label>
                  <input
                    id="create-product-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCreateImageChange}
                    className="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Uploaded automatically when creating the product.
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Active (Visible on Storefront)
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving ? (
                  'Saving...'
                ) : editingId ? (
                  'Update Product'
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Product
                  </>
                )}
              </button>
            </form>
          </div>

          {editingId !== null && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Manage Gallery Images
              </h2>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">
                  Upload Additional Image
                </label>
                <input
                  id="product-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  disabled={imageSaving}
                  className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                />

                <label className="flex items-center gap-2 text-sm pt-1">
                  <input
                    type="checkbox"
                    checked={imagePrimary}
                    onChange={(e) => setImagePrimary(e.target.checked)}
                    disabled={imageSaving}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Set as primary image</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!imageFile || imageSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {imageSaving ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Gallery ({imageList.length})
                </h3>

                {imagesQuery.isLoading ? (
                  <p className="text-sm text-neutral-400 italic">
                    Loading images...
                  </p>
                ) : imageList.length === 0 ? (
                  <p className="text-sm text-neutral-400 italic">
                    No images uploaded yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {imageList.map((img:ProductImage) => (
                      <div
                        key={img.id}
                        className="group relative rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50"
                      >
                        <img
                          src={img.image_url}
                          alt="Product"
                          className="h-28 w-full object-cover"
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={imageDeletingId === img.id}
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute bottom-1 right-1 p-1 bg-white/90 rounded text-red-600 hover:bg-white shadow"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product List Section */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Products ({products.length})
            </h2>

            {products.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4">No products found.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {products.map((product) => {
                  const primaryImg = product.images?.find((i) => i.is_primary)?.image_url

                  return (
                    <div
                      key={product.id}
                      className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        {primaryImg ? (
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                            <span>SKU: {product.sku}</span>
                            <span>•</span>
                            <span>{product.category?.name || 'Uncategorized'}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="font-semibold text-neutral-900">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-neutral-500">
                              Stock: {product.stock}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                product.is_active
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1.5 hover:bg-neutral-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 border border-neutral-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}