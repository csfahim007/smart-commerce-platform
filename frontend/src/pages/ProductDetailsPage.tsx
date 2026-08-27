import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAddToCartMutation } from '../hooks/queries/cart'
import { useProductQuery } from '../hooks/queries/products'

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const productQuery = useProductQuery(id)
  const addToCartMutation = useAddToCartMutation()

  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  const product = productQuery.data

  if (productQuery.isPending) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-neutral-500">Loading product details...</p>
      </section>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <section>
        <h1>Product not found</h1>

        <p role="alert">
          Unable to load this product right now.
        </p>

        <Link to="/products">
          Back to Products
        </Link>
      </section>
    )
  }

  const handleAddToCart = () => {
      setCartMessage(null)

      addToCartMutation.mutate(
        {
          productId: product.id,
          quantity: selectedQuantity,
        },
        {
          onSuccess: () => {
            setCartMessage('Item added to cart!')
          },
          onError: (err) => {
            setCartMessage(err.message || 'Failed to add item to cart.')
          },
        },
      )
    }
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/products"
        className="text-sm font-medium text-neutral-600 hover:text-black"
      >
        &larr; Back to Products
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              No image available
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {product.name}
          </h1>

          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            ৳{Number(product.price).toLocaleString('en-BD')}
          </p>

          <p className="mt-4 text-neutral-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <label htmlFor="quantity" className="text-sm font-medium text-neutral-700">
              Qty:
            </label>
            <select
              id="quantity"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {cartMessage && (
            <p className="mt-3 text-sm text-neutral-600">{cartMessage}</p>
          )}
        </div>
      </div>
    </section>
  )
}