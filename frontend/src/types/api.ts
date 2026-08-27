export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  sort_order: number
  products_count?: number
  created_at?: string
  updated_at?: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  cloudinary_public_id?: string | null
  is_primary: boolean
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  category_id: number
  category?: Category
  name: string
  slug: string
  sku: string
  description: string | null
  price: string
  stock: number
  is_active: boolean
  images: ProductImage[]
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  quantity: number
  product?: Product
}

export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
  total: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  price: number
  quantity: number
  product?: Product
}

export interface Order {
  id: number
  user_id: number
  order_number: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  shipping_name: string | null
  shipping_phone: string | null
  shipping_address: string
  payment_method: string
  items: OrderItem[]
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
  token_type: 'Bearer'
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface ProductAssistantResult {
  message: string
  products: Product[]
}
