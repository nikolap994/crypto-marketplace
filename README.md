# Crypto Marketplace MVP

A fast MVP project for a crypto-based marketplace where buyers and sellers transact in cryptocurrency.  
The platform acts as a middleman/escrow and charges a platform fee on each transaction.

---

## 🚀 Project Overview

- Users connect their wallets (MetaMask, WalletConnect) to log in (SIWE - Sign In With Ethereum)
- Sellers list products (digital or physical)
- Buyers pay with crypto (USDT, ETH, etc.)
- Platform holds funds in escrow and releases after confirmation
- Platform charges 2-5% fee on every transaction

---

## 🛠 Development Plan

## ✅ Week 3 – 🛍 Product Listing (CRUD)

### Frontend
- ✅ Seller dashboard UI
- ✅ Product create/edit form
- ✅ Display product list for all users
- 🔄 Show "My Listings" (products submitted by current wallet)
- 🔍 Product status indicators (pending / approved / rejected)

### Backend
- ✅ Endpoints:
  - `POST /products`
  - `GET /products`
  - `GET /products/:id`
- ✅ Database: `products` table
  - `id`, `title`, `description`, `price`, `seller`, `status`, `createdAt`
- 🔐 Middleware:
  - Restrict `POST`/`PATCH` to authenticated users
  - Only allow product owner to edit/delete (if not yet approved)

📝 **Goal**: Sellers can list and manage their own products, and approved products are publicly visible.

---

## ✅ Week 4 – 💸 Orders & Manual ETH Payment

### Frontend
- ✅ Product detail page (`/products/:id`)
- ✅ "Buy with ETH" button
- ✅ Show payment instructions (platform wallet address)
- ✅ Input field for TX hash (after sending)
- ✅ Buyer dashboard (`/my-orders`) – view purchases
- ✅ Seller dashboard – view received orders

### Backend
- ✅ Endpoints:
  - `POST /orders`
  - `GET /orders?seller=0x...`
  - `GET /orders?buyer=0x...`
- ✅ Database: `orders` table
  - `id`, `productId`, `buyer`, `txHash`, `status`, `createdAt`
- 🔍 Validations:
  - Product must be `approved`
  - Buyer cannot be the seller
  - TX hash format check

📝 **Goal**: Buyers can purchase with ETH and track orders; sellers can view their sales.

---

## ✅ Week 5 – 🛠 Admin Panel & Escrow Release

### Frontend
- ✅ Admin login / wallet verification
- ✅ Admin dashboard:
  - View pending products
  - Approve/reject product submissions
  - View orders and mark as paid/released

### Backend
- ✅ Admin-only endpoints:
  - `GET /admin/products`
  - `PATCH /admin/products/:id` – approve/reject
  - `GET /admin/orders`
  - `POST /admin/release/:orderId` – mark as released
- ✅ Manual payout tracking:
  - Admin manually sends funds
  - Order status updated to `released`

📝 **Goal**: Admin can review products and confirm fund release (manual escrow).

---

## ✅ Week 6 – 🚀 Polish & Deployment

### Frontend
- ✅ Style app for mobile + responsive design
- ✅ Add success/error messages
- ✅ Add loading states
- ✅ Deploy frontend to [Vercel](https://vercel.com)

### Backend
- ✅ Add route validations & error handling
- ✅ Clean up logging & middleware
- ✅ Deploy backend to [Railway](https://railway.app) or [Fly.io](https://fly.io)
- ✅ Use production PostgreSQL (e.g. Railway)

📝 **Goal**: Full MVP is polished, deployed, and testable live.

---

## 📌 Optional Post-MVP Enhancements

| Feature              | Description |
|----------------------|-------------|
| 🔐 Smart contract escrow | Replace manual escrow with ETH smart contract |
| 💰 Multi-chain support  | Add Solana, Bitcoin support |
| 📨 Email notifications  | Notify seller/admin of new order or approval |
| 🧾 Dispute system        | Allow buyers to flag disputes |
| 🧑 Seller profiles       | Add display name, avatar, social links |
| 🖼 Product image upload  | Store via Cloudinary or S3 |
| 📊 Dashboard stats       | Total sales, revenue, orders, etc. |

---

## ✅ Final MVP Scope Summary

| Feature | Status |
|--------|--------|
| Wallet login (SIWE) | ✅ Done / planned |
| Product submission | ✅ Done |
| Seller dashboard | ✅ Done |
| Buyer purchase + order form | ✅ Done |
| Admin review panel | ✅ Done |
| Manual escrow + payout logging | ✅ Done |
| Responsive design + deploy | ✅ Done |

---

## 📦 Running Locally

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000
Backend API runs on: http://localhost:4000

## Docker

```bash
docker-compose up -d
```

```bash
npx prisma studio
```