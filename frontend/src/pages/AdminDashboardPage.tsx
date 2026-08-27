import { Link } from 'react-router-dom'
import { ShoppingBag, Package, FolderTree, ArrowLeft } from 'lucide-react'

export default function AdminDashboardPage() {
  const cards = [
    {
      title: 'Orders',
      description: 'View orders, update fulfillment statuses, and manage sales.',
      link: '/admin/orders',
      cta: 'Manage Orders',
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Products',
      description: 'Create, edit, manage product inventory, and upload image assets.',
      link: '/admin/products',
      cta: 'Manage Products',
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Categories',
      description: 'Organize products with active categories and custom sort orders.',
      link: '/admin/categories',
      cta: 'Manage Categories',
      icon: FolderTree,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Overview and quick access to platform management tools.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all"
            >
              <div>
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">{card.title}</h2>
                <p className="text-sm text-neutral-600 mb-6">{card.description}</p>
              </div>

              <Link
                to={card.link}
                className="inline-flex justify-center items-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {card.cta}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}