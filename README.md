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

# 📆 6-Week MVP Development Plan

A weekly breakdown for building the Crypto Escrow Marketplace MVP as a solo developer.

---

## Week 3 – 🛍 Product Listing (CRUD)

### Frontend
- Create seller dashboard UI
- Implement product create/edit form
- Display product list for all users

### Backend
- Create endpoints:
  - `POST /products`
  - `GET /products`
  - `GET /products/:id`
- Set up `products` table with fields: id, title, description, price, seller_address, status

📝 **Goal**: Sellers can list and manage products (admin approval pending)

---

## Week 4 – 💸 Orders & Manual ETH Payment

### Frontend
- Build product detail page
- Add "Buy with ETH" button
- Show payment instructions and input field for TX hash

### Backend
- Create endpoints:
  - `POST /orders`
  - `GET /orders/:user`
- Store buyer address, product ID, TX hash
- Validate ETH addresses

📝 **Goal**: Buyers can initiate purchases and submit transaction hashes

---

## Week 5 – 🛠 Admin Panel & Escrow Release

### Frontend
- Create admin dashboard UI
- Display pending product approvals and orders
- Add "Approve" and "Release Funds" buttons

### Backend
- Create admin endpoints:
  - `GET /admin/products`
  - `PATCH /admin/products/:id` (approve product)
  - `POST /admin/release/:orderId` (mark as released)

📝 **Goal**: Manual review and release of funds supported via admin interface

---

## Week 6 – 🚀 Polish & Deployment

### Frontend
- Style the app for responsiveness and usability
- Polish UI/UX
- Deploy frontend to **Vercel**

### Backend
- Finalize and debug routes
- Deploy backend to **Railway** or **Fly.io**
- Configure production PostgreSQL (e.g., Railway)

📝 **Goal**: Deployed MVP with basic end-to-end functionality

---

📌 Optional Post-MVP Enhancements:
- Smart contract escrow
- Solana/Bitcoin support
- Dispute resolution flow
- Email notifications
- Seller KYC

---

## 🔐 Wallet Authentication Flow (SIWE Lite)

1. Frontend requests a random nonce from `/auth/nonce`.
2. User signs the nonce with their wallet.
3. Frontend sends the signed message + address to `/auth/login`.
4. Backend verifies the signature, authenticates user, and issues a JWT or session cookie.

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