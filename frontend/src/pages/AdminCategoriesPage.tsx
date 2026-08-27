import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, CheckCircle, AlertCircle, Plus, RefreshCw } from 'lucide-react'

import {
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from '../hooks/queries/adminCategories'

import type { Category } from '../types/api'

interface CategoryForm {
  name: string
  slug: string
  description: string
  is_active: boolean
  sort_order: string
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
  sort_order: '0',
}

export default function AdminCategoriesPage() {
  const categoriesQuery = useAdminCategoriesQuery()
  const createMutation = useCreateAdminCategoryMutation()
  const updateMutation = useUpdateAdminCategoryMutation()
  const deleteMutation = useDeleteAdminCategoryMutation()

  const categories = categoriesQuery.data ?? []

  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const saving = createMutation.isPending || updateMutation.isPending
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null

  function getErrorMessage(err: any) {
    const validationErrors = err?.response?.data?.errors
    if (validationErrors) {
      const first = Object.values(validationErrors)[0]
      if (Array.isArray(first) && first.length) {
        return String(first[0])
      }
    }
    return err?.response?.data?.message || 'Unable to save category.'
  }

  function updateField(field: keyof CategoryForm, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(category: Category) {
    setError(null)
    setMessage(null)
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
      sort_order: String(category.sort_order),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Category name is required.')
      return
    }

    const sortOrder = Number(form.sort_order)
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setError('Sort order must be a non-negative integer.')
      return
    }

    setError(null)
    setMessage(null)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      is_active: form.is_active,
      sort_order: sortOrder,
    }

    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, payload })
        setMessage('Category updated successfully.')
      } else {
        await createMutation.mutateAsync(payload)
        setMessage('Category created successfully.')
      }
      resetForm()
    } catch (err: any) {
      console.error('[ADMIN CATEGORIES] Save failed:', err)
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return

    setError(null)
    setMessage(null)

    try {
      await deleteMutation.mutateAsync(category.id)
      if (editingId === category.id) resetForm()
      setMessage('Category deleted successfully.')
    } catch (err: any) {
      console.error('[ADMIN CATEGORIES] Delete failed:', err)
      setError(err?.response?.data?.message || 'Unable to delete category.')
    }
  }

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-neutral-400 animate-spin" />
      </div>
    )
  }

  if (categoriesQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{getErrorMessage(categoriesQuery.error)}</span>
        </div>
        <button
          type="button"
          onClick={() => categoriesQuery.refetch()}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">Create, update, and manage product categories.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            {editingId !== null ? 'Edit Category' : 'Create Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-neutral-700 mb-1">
                Name *
              </label>
              <input
                id="category-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>

            <div>
              <label htmlFor="category-slug" className="block text-sm font-medium text-neutral-700 mb-1">
                Slug
              </label>
              <input
                id="category-slug"
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="Leave blank for auto-generation"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>

            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                id="category-description"
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>

            <div>
              <label htmlFor="category-sort-order" className="block text-sm font-medium text-neutral-700 mb-1">
                Sort Order *
              </label>
              <input
                id="category-sort-order"
                type="number"
                min="0"
                step="1"
                value={form.sort_order}
                onChange={(e) => updateField('sort_order', e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="category-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <label htmlFor="category-active" className="text-sm text-neutral-700 font-medium">
                Active (Visible)
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : editingId !== null ? (
                  'Update Category'
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Category
                  </>
                )}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Categories List Section */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Categories ({categories.length})</h2>

          {categories.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-neutral-500">
              No categories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          category.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-neutral-500">Slug: {category.slug}</p>

                    {category.description && (
                      <p className="text-sm text-neutral-600 pt-1">{category.description}</p>
                    )}

                    <div className="flex gap-4 text-xs text-neutral-500 pt-2">
                      <span>Products: {category.products_count ?? 0}</span>
                      <span>Sort Order: {category.sort_order}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Category"
                    >
                      {deletingId === category.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}