# 🛒 AI Commerce — Laravel + React Ecommerce Platform

<p align="center">
  <strong>An AI-powered, production-oriented ecommerce platform built with Laravel, React, Stripe, Cloudinary, Redis, Docker, NGINX and Groq.</strong>
</p>

<p align="center">
  <a href="https://ai-ecommerce-laravel.cloudafk.xyz/">🚀 Live Demo</a>
  ·
  <a href="#architecture">Architecture</a>
  ·
  <a href="#ai-product-assistant">AI Product Assistant</a>
  ·
  <a href="#deployment--cicd">Deployment & CI/CD</a>
</p>

---

## 🌐 Live Demo

### 🚀 Application

**https://ai-ecommerce-laravel.cloudafk.xyz/**

The application provides a complete ecommerce experience with:

* 🛍️ Product browsing and search
* 🔐 Customer authentication
* 🛒 Persistent shopping cart
* 📦 Order management
* 💵 Cash on Delivery
* 💳 Stripe payment integration
* 🤖 AI-powered product discovery
* 🖼️ Cloudinary product image management
* 👨‍💼 Admin dashboard
* 📧 Order email notifications
* 🔄 n8n webhook automation
* ⚡ Redis-ready caching/queue infrastructure
* 🐳 Dockerized deployment
* 🌐 NGINX reverse proxy
* 🔁 CI/CD deployment pipeline

---

## 🔑 Demo Admin Account

> **Demo credentials only — do not use these credentials for a production environment.**

```text
Email:    admin@aicommerce.test
Password: Admin@12345
```

After logging in, the admin dashboard provides access to:

* Product management
* Category management
* Product image management
* Order management
* Payment status management
* Order status management

---

# 📸 What This Project Demonstrates

This project was designed as more than a basic CRUD ecommerce application.

It demonstrates how I approach building a **modern full-stack application with real backend architecture, asynchronous processing, third-party integrations, AI-assisted search, payment processing, containerization and deployment automation.**

The main architectural goal was to keep the AI layer **grounded in actual ecommerce data** instead of allowing an LLM to invent products or prices.

The AI understands the customer's request, while the database remains the **source of truth**.

---

# 🧰 Tech Stack

## Backend

| Technology                | Purpose                        |
| ------------------------- | ------------------------------ |
| **Laravel 13**            | REST API & application backend |
| **PHP 8.3**               | Backend runtime                |
| **Laravel Sanctum**       | API authentication             |
| **MySQL / Relational DB** | Persistent application data    |
| **Redis**                 | Cache / queue infrastructure   |
| **Laravel Queue**         | Asynchronous processing        |
| **Stripe**                | Online payments                |
| **Cloudinary**            | Product image storage          |
| **Groq API**              | AI query understanding         |
| **n8n**                   | External workflow automation   |
| **PHPUnit**               | Backend testing                |

## Frontend

| Technology               | Purpose                 |
| ------------------------ | ----------------------- |
| **React 19**             | SPA frontend            |
| **TypeScript**           | Type safety             |
| **Vite**                 | Frontend tooling/build  |
| **TanStack React Query** | Server state management |
| **Axios**                | API communication       |
| **Zustand**              | UI state                |
| **React Hook Form**      | Form management         |
| **Zod**                  | Validation              |
| **Tailwind CSS**         | Styling                 |
| **Stripe Elements**      | Payment UI              |

## Infrastructure

| Technology           | Purpose                    |
| -------------------- | -------------------------- |
| **Docker**           | Containerization           |
| **NGINX**            | Reverse proxy / web server |
| **Redis**            | Cache & queue backend      |
| **GitHub Actions**   | CI/CD automation           |
| **Cloud deployment** | Production hosting         |
| **n8n**              | Event-driven automation    |

---

# 🏗️ Architecture

The application follows a **decoupled frontend/backend architecture**.

```text
                         ┌──────────────────────┐
                         │      Browser         │
                         │  React + TypeScript  │
                         └──────────┬───────────┘
                                    │
                             HTTPS / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │        NGINX         │
                         │   Reverse Proxy      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       Laravel API             │
                    │       PHP 8.3                 │
                    │       Laravel 13              │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ Relational  │       │    Redis    │       │   Stripe    │
       │  Database   │       │ Cache/Queue │       │   Payments  │
       └─────────────┘       └──────┬──────┘       └──────┬──────┘
                                    │                      │
                                    │                      │ Webhook
                                    ▼                      │
                             ┌─────────────┐                │
                             │ Queue Worker│◄───────────────┘
                             └──────┬──────┘
                                    │
                       ┌────────────┼─────────────┐
                       │            │             │
                       ▼            ▼             ▼
                    Mail          n8n          Other Jobs
                  Notification   Webhook
                                    
                    ┌────────────────────────────┐
                    │        AI Layer            │
                    │                            │
                    │ Deterministic Intent       │
                    │          +                 │
                    │       Groq API              │
                    │          +                 │
                    │ Product Retrieval           │
                    └────────────────────────────┘

                    ┌────────────────────────────┐
                    │         Cloudinary          │
                    │      Product Images         │
                    └────────────────────────────┘
```

---

# 📁 Repository Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── Console/
│   │   ├── Events/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       └── V1/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Listeners/
│   │   ├── Mail/
│   │   ├── Models/
│   │   ├── Providers/
│   │   └── Services/
│   │       ├── AI/
│   │       ├── Integrations/
│   │       └── ...
│   │
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── routes/
│   │   └── api.php
│   │
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   │
│   └── config/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── app/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── stores/
│       └── types/
│
├── docs/
└── README.md
```

---

# 🧩 Backend Architecture

The backend is structured around **API versioning, domain services, resources, validation and asynchronous events**.

All API endpoints are exposed under:

```text
/api/v1
```

This provides a clean boundary for future API versions.

### Main backend layers

```text
HTTP Request
     │
     ▼
Controller
     │
     ├── FormRequest Validation
     │
     ▼
Domain / Application Service
     │
     ├── Models / Database
     ├── Cache
     ├── External APIs
     └── Events
     │
     ▼
API Resource
     │
     ▼
JSON Response
```

### Important backend components

#### Controllers

Versioned controllers handle HTTP concerns:

```text
AuthController
CategoryController
ProductController
ProductImageController
CartController
OrderController
PaymentController
StripePaymentController
StripeWebhookController
AdminOrderController
ProductAssistantController
```

#### Services

Business logic is intentionally extracted from controllers.

Examples:

```text
OrderService
CartCacheService
ProductAssistantService
ProductRetriever
ProductIntentParser
AIQueryUnderstandingService
N8nService
```

This keeps controllers focused on HTTP concerns while domain logic remains reusable and testable.

---

# 🤖 AI Product Assistant

One of the main features of this project is the **AI Product Assistant**.

The important architectural decision here is:

> **The LLM does not decide which products actually exist.**

Instead, AI is used primarily for **natural-language query understanding**, while the product database remains the source of truth.

---

## 🧠 AI Architecture

```text
Customer
   │
   │ "I need a cheap gaming laptop with 16GB RAM"
   ▼
Product Assistant API
   │
   ▼
Deterministic Intent Parser
   │
   ├── category
   ├── price constraints
   ├── keywords
   ├── phrases
   └── features
   │
   ▼
Groq API
   │
   │ Query normalization
   ▼
Normalized Intent
   │
   ▼
Product Retriever
   │
   ├── Active products only
   ├── In-stock products only
   ├── Category filtering
   ├── Price filtering
   ├── Brand filtering
   ├── Feature matching
   ├── Positive constraints
   └── Negative constraints
   │
   ▼
Scored Product Results
   │
   ▼
Top Products + AI Response
```

### Why this architecture?

A naive AI ecommerce implementation could simply ask an LLM:

```text
"Recommend me some products."
```

That creates several problems:

* The AI may invent products.
* Prices may be hallucinated.
* Inventory may be incorrect.
* The AI may recommend inactive products.
* Product availability cannot be trusted.

This implementation avoids that.

The AI helps understand **what the customer wants**, but the actual products come from the ecommerce database.

---

# 🧠 Groq API — Not Ollama

The AI integration uses the **Groq API**.

```text
Customer Query
      ↓
Intent / Query Understanding
      ↓
Groq API
      ↓
Normalized Search Intent
      ↓
Database Retrieval
      ↓
Ranked Products
```

**Ollama is not used by this project.**

The application does **not** depend on a locally hosted Ollama model.

The AI configuration is based on a Groq API key, for example:

```env
GROQ_API_KEY=your_groq_api_key
```

This keeps the application architecture simple while allowing the AI layer to use a fast hosted inference API.

---

# 🔍 Product Retrieval

The `ProductRetriever` is responsible for turning the interpreted intent into actual ecommerce results.

It supports concepts such as:

* Category
* Price range
* Brand
* Keywords
* Product phrases
* Positive features
* Negative features
* Stock availability
* Product activity state
* Result scoring

The retrieval layer can therefore answer queries such as:

```text
"Show me budget laptops"

"I need a gaming laptop"

"Find something under $1000"

"I want a phone with a good camera"

"Show me Samsung phones"

"Find a laptop but not an expensive one"
```

The important distinction is that **the LLM is not the product database**.

---

# 🛒 Cart Architecture

Cart data is stored in the database and additionally cached per user.

```text
User
 │
 ▼
Cart API
 │
 ├──────────────► Database
 │
 └──────────────► Cache / Redis
```

The cache layer is encapsulated inside:

```text
CartCacheService
```

Cart mutations invalidate the corresponding cached cart.

The database also contains a unique constraint preventing duplicate products within the same cart.

---

# 📦 Checkout & Inventory Consistency

Checkout was designed with inventory consistency in mind.

For order creation, the backend uses a database transaction and row locking.

```text
BEGIN TRANSACTION

Lock Cart
    ↓
Lock Product Rows
    ↓
Check Product Status
    ↓
Check Stock
    ↓
Create Order
    ↓
Create Order Items
    ↓
Create Payment
    ↓
Update Inventory
    ↓
Clear Cart
    ↓
Dispatch OrderPlaced

COMMIT
```

This prevents two concurrent checkout operations from blindly decrementing the same inventory.

Order items also preserve important product information such as the product name and price at the time of purchase.

---

# 💵 Cash on Delivery

For Cash on Delivery orders:

```text
Checkout
   ↓
POST /api/v1/orders
   ↓
Database Transaction
   ↓
Stock Validation
   ↓
Inventory Decrement
   ↓
Order Creation
   ↓
Cart Cleared
   ↓
OrderPlaced Event
```

The order is then processed asynchronously for downstream notifications.

---

# 💳 Stripe Payment Architecture

Stripe payments follow a different lifecycle because payment confirmation happens asynchronously.

```text
React Checkout
      │
      ▼
Create Order
      │
      ▼
Create Stripe PaymentIntent
      │
      ▼
Stripe Elements
      │
      ▼
Customer Payment
      │
      ▼
Stripe
      │
      │ signed webhook
      ▼
Laravel Stripe Webhook
      │
      ├── Verify signature
      ├── Verify payment amount
      ├── Lock product rows
      ├── Decrement inventory
      ├── Mark payment paid
      ├── Mark order paid
      ├── Clear cart
      └── Dispatch OrderPlaced
```

The backend does not trust the frontend to declare that a payment succeeded.

Instead, the final payment state is driven by the **Stripe webhook**.

This is an important security boundary.

---

# 🖼️ Cloudinary Image Management

Product images are managed through Cloudinary.

```text
Admin
  │
  ▼
Laravel Image API
  │
  ▼
Cloudinary
  │
  ├── Upload
  ├── Secure URL
  └── Public ID
       │
       ▼
ProductImage Database Record
```

The admin interface supports:

* Image upload
* Primary image selection
* Image deletion
* Product ownership verification
* Primary-image promotion when images are deleted

---

# ⚡ Redis & Queue Architecture

The application is designed to separate immediate HTTP operations from background work.

A simplified production flow looks like:

```text
HTTP Request
    │
    ▼
Laravel API
    │
    ├── Immediate response
    │
    └── Dispatch Job/Event
              │
              ▼
            Redis
              │
              ▼
         Queue Worker
              │
       ┌──────┴────────┐
       ▼               ▼
      Mail             n8n
```

Redis can act as the high-performance infrastructure for:

* Cache
* Queue backend
* User/cart-related cached data
* Background job processing

The queue worker handles tasks that should not block the user's HTTP request.

---

# 🔄 OrderPlaced Event Architecture

After a successful order lifecycle, Laravel dispatches:

```text
OrderPlaced
```

The event is handled by:

```text
HandleOrderPlaced
```

The listener is queued.

It can then trigger:

```text
OrderPlaced
    │
    ▼
HandleOrderPlaced
    │
    ├── Order Email
    │
    └── n8n Webhook
```

This keeps external notification work outside the main checkout transaction/request lifecycle.

---

# 🔗 n8n Integration

The application also integrates with n8n for workflow automation.

```text
Laravel
   │
   │ OrderPlaced
   ▼
Queued Listener
   │
   ▼
N8nService
   │
   ▼
n8n Webhook
   │
   ▼
External Automation
```

The payload contains relevant order/customer information and can be used by n8n for additional workflows.

This provides an integration boundary without coupling the Laravel application directly to every downstream business process.

---

# 📧 Email Notifications

Order-related email is handled through Laravel's mail system.

Instead of sending the email synchronously during checkout:

```text
Checkout
   ↓
OrderPlaced Event
   ↓
Queued Listener
   ↓
OrderPlacedMail
   ↓
Mail Provider
```

This prevents external mail delivery latency from directly affecting the checkout response.

---

# 🔐 Authentication & Authorization

Authentication uses **Laravel Sanctum** with bearer tokens.

```text
Login
  ↓
Laravel
  ↓
Sanctum Personal Access Token
  ↓
Frontend
  ↓
Authorization: Bearer <token>
```

Protected endpoints use:

```text
auth:sanctum
```

Admin endpoints additionally use:

```text
admin
```

The admin middleware verifies:

```text
user.role === "admin"
```

Importantly, frontend route guards are only a UX mechanism.

The backend remains the actual security boundary.

---

# 🛡️ Security Considerations

The application includes several security-oriented controls:

* Sanctum authentication
* Password hashing
* Admin middleware
* Resource ownership checks
* Request validation
* Stripe webhook signature verification
* Stripe payment amount verification
* Product stock validation
* Database row locking during checkout
* Cloudinary ownership verification
* Parameterized database queries through Eloquent
* LLM-independent product truth

The AI layer does **not** have permission to directly modify products, inventory or orders.

---

# 🌐 API Overview

All APIs are versioned:

```text
/api/v1
```

### Public

```http
GET    /health
GET    /categories
GET    /categories/{category}
GET    /products
GET    /products/{product}
GET    /products/{product}/images

POST   /auth/register
POST   /auth/login

POST   /stripe/webhook
```

### Customer

```http
GET    /auth/me
POST   /auth/logout

GET    /cart
POST   /cart/items
PUT    /cart/items/{cartItem}
DELETE /cart/items/{cartItem}

POST   /ai/product-assistant

GET    /orders
POST   /orders
GET    /orders/{order}

GET    /orders/{order}/payment
POST   /orders/{order}/payment/intent
```

### Admin

```http
POST   /categories
PUT    /categories/{category}
PATCH  /categories/{category}
DELETE /categories/{category}

POST   /products
PUT    /products/{product}
PATCH  /products/{product}
DELETE /products/{product}

POST   /products/{product}/images
DELETE /products/{product}/images/{image}

GET    /admin/orders
PUT    /admin/orders/{order}/status
PATCH  /admin/orders/{order}/status
```

---

# 🖥️ Frontend Architecture

The frontend is an independent React + TypeScript SPA.

```text
frontend/src/

├── api/
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── ai.ts
│   ├── admin.ts
│   └── ...
│
├── components/
│   ├── layout/
│   ├── commerce/
│   ├── payment/
│   └── ui/
│
├── contexts/
│   └── AuthContext.tsx
│
├── hooks/
│   └── queries/
│
├── pages/
│   ├── storefront/
│   ├── auth/
│   ├── checkout/
│   ├── orders/
│   └── admin/
│
├── stores/
│   └── ui.store.ts
│
├── lib/
│   ├── axios.ts
│   ├── query-client.ts
│   └── ...
│
└── types/
```

### Client-side state strategy

The application intentionally separates:

**Server state**

```text
TanStack React Query
```

from:

**UI state**

```text
Zustand
```

and:

**Authentication/session state**

```text
AuthContext
```

This avoids putting all application state into a single global store.

---

# 🧪 Testing

The backend includes a broad PHPUnit feature test suite covering major application flows.

Test areas include:

```text
Authentication
Categories
Products
Cart
Orders
Payments
Product Images
AI Assistant
Admin Orders
n8n Integration
Order Events
```

Examples include:

* Authentication success/failure
* Admin authorization
* Product CRUD
* Category CRUD
* Cart ownership
* Stock validation
* Order creation
* Payment access control
* Cloudinary behavior using mocks
* AI query filtering
* Groq failure fallback
* n8n webhook payloads
* Queued order listener behavior

The AI tests are particularly important because they verify that product retrieval behavior remains grounded in the application data.

---

# 🐳 Docker Architecture

The application is containerized to provide consistent environments across development and deployment.

A typical deployment topology is:

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │    NGINX    │
                │ Reverse     │
                │ Proxy       │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      React Static App       Laravel API
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
                   DB        Redis     Queue Worker
```

Docker isolates the application components and makes the deployment reproducible.

---

# 🌐 NGINX Reverse Proxy

NGINX sits at the edge of the application.

```text
Client
  │
  │ HTTPS
  ▼
NGINX
  │
  ├── Frontend/static assets
  │
  └── /api/*
          │
          ▼
       Laravel
```

This gives the deployment a single public entry point while keeping the internal services isolated.

It also provides a natural place for:

* TLS termination
* Reverse proxying
* Static asset delivery
* Request routing
* HTTP-level configuration

---

# 🔁 CI/CD Pipeline

The project is designed around an automated CI/CD workflow.

The high-level deployment lifecycle is:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Backend dependency installation
    ├── Frontend dependency installation
    ├── Automated tests
    ├── Frontend build
    ├── Docker build
    │
    ▼
Deployment
    │
    ▼
Server
    │
    ├── Docker containers
    ├── NGINX
    ├── Laravel API
    ├── Queue Worker
    └── Redis
```

The goal is to make deployments repeatable rather than manually configuring the application every time.

---

# 🚀 Deployment Flow

At runtime, the major components work together approximately like this:

```text
                    ┌───────────────┐
                    │    Browser    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     NGINX     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Laravel API   │
                    └───────┬───────┘
                            │
         ┌──────────────────┼─────────────────┐
         │                  │                 │
         ▼                  ▼                 ▼
     Database            Redis             External
                                            Services
                                              │
                    ┌─────────────────────────┼──────────────┐
                    │                         │              │
                    ▼                         ▼              ▼
                  Stripe                  Cloudinary        Groq
                    │
                    │ Webhook
                    ▼
                Laravel API
                    │
                    ▼
              Order Processing
                    │
                    ▼
               Queue / Redis
                    │
             ┌──────┴──────┐
             ▼             ▼
            Mail           n8n
```

---

# ⚙️ Environment Variables

The backend requires environment configuration similar to:

```env
APP_NAME="AI Commerce"
APP_ENV=production
APP_KEY=

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_URL=

GROQ_API_KEY=

N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

MAIL_MAILER=
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
```

Frontend environment:

```env
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
```

> Never commit real secrets, Stripe private keys, Cloudinary credentials, Groq API keys, database passwords or production tokens to Git.

---

# 🧠 Why the Architecture Matters

This project demonstrates several architectural principles that are important beyond simply making the UI work.

### 1. Separation of concerns

HTTP controllers are separated from business services.

### 2. Database as source of truth

The AI layer never becomes the authority for product availability, pricing or inventory.

### 3. Transactional checkout

Inventory-sensitive operations use database transactions and row locking.

### 4. Asynchronous side effects

Email and n8n integrations are handled through queued processing.

### 5. API versioning

The API is organized under `/api/v1`.

### 6. Independent frontend

React is maintained as a separate application from the Laravel backend.

### 7. External integrations behind services

Stripe, Cloudinary, Groq and n8n integration logic is isolated into dedicated application boundaries.

### 8. Defense in depth

Frontend route guards improve UX, while Laravel authentication and authorization enforce actual access control.

---

# 🔄 Complete Example: From Customer Search to Order

A typical customer journey demonstrates almost every major part of the architecture.

### Step 1 — Browse

```text
React
 ↓
GET /api/v1/products
 ↓
Laravel
 ↓
Database
 ↓
ProductResource
 ↓
React Query
 ↓
UI
```

### Step 2 — Ask AI

```text
Customer:
"I need an affordable gaming laptop"
       ↓
React
       ↓
AI API
       ↓
Deterministic intent parsing
       ↓
Groq normalization
       ↓
ProductRetriever
       ↓
Database
       ↓
Ranked products
       ↓
React
```

### Step 3 — Add to Cart

```text
React
 ↓
POST /cart/items
 ↓
Laravel
 ↓
Stock validation
 ↓
Database
 ↓
Cache invalidation
```

### Step 4 — Checkout

```text
Checkout
 ↓
OrderService
 ↓
DB Transaction
 ↓
Lock products
 ↓
Validate stock
 ↓
Create order
```

### Step 5 — Payment

```text
Stripe
 ↓
PaymentIntent
 ↓
Customer payment
 ↓
Stripe webhook
 ↓
Signature verification
 ↓
Inventory update
 ↓
Payment/order marked paid
```

### Step 6 — Async Processing

```text
OrderPlaced
 ↓
Queue
 ↓
Redis
 ↓
Worker
 ├── Email
 └── n8n
```

This is the core architecture of the application working together as a single business workflow.

---

# 🧱 Key Database Entities

The ecommerce domain is centered around:

```text
User
 │
 ├── Cart
 │     └── CartItem
 │            └── Product
 │
 └── Order
       ├── OrderItem
       │      └── Product
       │
       └── Payment

Category
   │
   └── Product
          │
          └── ProductImage
```

Additional infrastructure tables support:

```text
Personal Access Tokens
Jobs
Failed Jobs
Cache
Sessions
```

---

# 📊 Feature Matrix

| Feature                         | Status                |
| ------------------------------- | --------------------- |
| Customer Authentication         | ✅                     |
| Sanctum API Authentication      | ✅                     |
| Role-based Admin Access         | ✅                     |
| Product Catalog                 | ✅                     |
| Category Management             | ✅                     |
| Product CRUD                    | ✅                     |
| Product Images                  | ✅                     |
| Cloudinary Integration          | ✅                     |
| Shopping Cart                   | ✅                     |
| Cart Caching                    | ✅                     |
| Cash on Delivery                | ✅                     |
| Stripe PaymentIntent            | ✅                     |
| Stripe Webhooks                 | ✅                     |
| Inventory Locking               | ✅                     |
| AI Product Assistant            | ✅                     |
| Groq API Integration            | ✅                     |
| Deterministic Product Retrieval | ✅                     |
| Order Email                     | ✅                     |
| Laravel Queue                   | ✅                     |
| Redis Support                   | ✅                     |
| n8n Integration                 | ✅                     |
| Docker Deployment               | ✅                     |
| NGINX Reverse Proxy             | ✅                     |
| CI/CD                           | ✅                     |
| Backend Feature Tests           | ✅                     |
| Frontend Automated Tests        | ⚠️ Future improvement |

---

# 🔮 Future Improvements

There are several areas that would be natural next steps for taking the application further toward a fully hardened production system.

### Payment lifecycle

* Persist Stripe webhook event IDs
* Stronger webhook replay protection
* Better failed-payment recovery
* Pending-order cleanup
* Refund/restock workflow
* Explicit order/payment state machine

### AI

* AI-assisted product enrichment
* Embeddings/vector search
* Semantic product retrieval
* Background product indexing
* AI-generated product metadata
* Retrieval evaluation benchmarks

### Infrastructure

* Dedicated Redis production configuration
* Queue retry/backoff policies
* Worker monitoring
* Application metrics
* Centralized logging
* Health monitoring

### Testing

* Frontend unit tests
* React component tests
* API contract tests
* Stripe webhook tests
* End-to-end checkout tests
* Load testing

### Security

* Authentication rate limiting
* Token expiration strategy
* Stronger secret management
* Security headers
* Dependency scanning
* More granular admin permissions

---

# 🎯 Interview Talking Points

If presenting this project in an interview, the most important architectural points to highlight are:

### "Why Laravel + React?"

The frontend and backend are independently deployable and communicate through a versioned REST API.

### "How did you prevent AI hallucinations?"

The LLM is used for **query understanding**, not as the product database. Actual products are retrieved from the application database using deterministic filtering and ranking.

### "Why Groq?"

Groq provides hosted LLM inference for the query-understanding layer without requiring a local Ollama runtime.

### "How did you handle inventory?"

Checkout uses database transactions and row-level locks to re-check stock immediately before creating the order and changing inventory.

### "How does Stripe work?"

The frontend creates a PaymentIntent and Stripe handles payment collection. The backend verifies the signed Stripe webhook before finalizing payment and inventory changes.

### "Why use queues?"

Email and external automation should not block the customer's checkout request. The `OrderPlaced` event is processed asynchronously by a queue worker.

### "Where does Redis fit?"

Redis provides a fast infrastructure layer for cache and queue workloads, allowing frequently accessed data and background jobs to be handled efficiently.

### "Why NGINX?"

NGINX provides the public HTTP entry point and reverse-proxy layer while keeping application services behind the edge.

### "Why Docker?"

Docker makes the application environment reproducible and simplifies deployment of the Laravel API, frontend, worker and supporting infrastructure.

### "How does CI/CD work?"

Changes move through GitHub Actions for validation/building and then into the containerized deployment environment, reducing manual deployment steps.

---

# 🏁 Conclusion

**AI Commerce** is a full-stack ecommerce platform designed to demonstrate practical software engineering beyond basic CRUD.

The project combines:

```text
React
   +
Laravel
   +
REST API
   +
Sanctum
   +
Database Transactions
   +
Inventory Locking
   +
Stripe
   +
Cloudinary
   +
Groq AI
   +
Redis
   +
Laravel Queue
   +
n8n
   +
Docker
   +
NGINX
   +
CI/CD
```

The most important architectural principle is the separation between **AI reasoning and business truth**:

> **Groq helps understand the customer's intent; Laravel and the database decide what the store actually contains.**

That approach makes the AI feature useful while keeping product availability, pricing, inventory and order state under deterministic application control.

---

## 👨‍💻 Project Demo

**Live Application:**
https://ai-ecommerce-laravel.cloudafk.xyz/

**Demo Admin:**

```text
admin@aicommerce.test
Admin@12345
```

> For a public repository, replace the demo password before production use and never store real credentials in source control.

---

<p align="center">
  Built with ❤️ using Laravel, React, Groq, Stripe, Redis, Docker and modern web architecture.
</p>

## 📄 License

**Copyright © 2026 [Your Name]. All Rights Reserved.**

This project is proprietary software and is provided for demonstration and portfolio purposes only.

You may view the source code for evaluation, learning, and interview purposes, but you may not, without prior written permission from the copyright holder:

- Copy or redistribute the source code
- Publish or mirror the repository
- Sell, sublicense, or commercially exploit the software
- Modify and redistribute derivative versions
- Reuse substantial portions of the code in another project
- Present the project or its source code as your own

Public visibility of this repository does not grant permission to copy,
redistribute, or commercially reuse the source code.

For licensing or commercial-use inquiries, please contact the project owner.

