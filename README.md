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

## 🧱 Project Structure

```
/crypto-marketplace/
├── backend/         # Express.js API server
│   ├── routes/
│   ├── controllers/
│   ├── db/
│   ├── .env
│   └── server.js
├── frontend/        # Next.js frontend app
│   ├── pages/
│   ├── public/
│   └── next.config.js
├── README.md
└── docker-compose.yml   # (optional)
```


---

## ⚙️ Tech Stack

| Layer          | Technology                      |
|----------------|--------------------------------|
| Frontend       | Next.js + React + RainbowKit   |
| Backend API    | Express.js (JavaScript)         |
| Database       | PostgreSQL + Prisma (optional)  |
| Wallet Auth    | SIWE (Sign-In With Ethereum)    |
| Blockchain     | ethers.js + smart contracts     |
| Storage        | AWS S3 / IPFS (optional)        |
| Hosting        | Vercel (frontend), Fly.io/Railway (backend) |

---

## 🛠 Development Plan

# 📆 6-Week MVP Development Plan

A weekly breakdown for building the Crypto Escrow Marketplace MVP as a solo developer.

---

## Week 1 – 🏗 Project Setup & Environment

### Frontend
- Initialize Next.js project
- Install and configure RainbowKit & Wagmi for wallet integration
- Set up basic routing and layout
- Create Wallet Connect UI component

### Backend
- Initialize Express.js server
- Set up PostgreSQL database with Docker
- Add pgAdmin for local database inspection
- Add `/ping` test route to confirm API is live

📝 **Goal**: Dev environment ready, all tools connected

---

## Week 2 – 🔐 Wallet Login (SIWE-lite)

### Frontend
- Display wallet connect button
- Fetch login nonce from backend
- Sign nonce with user wallet
- Send signature and address to backend

### Backend
- Create `/auth/nonce` and `/auth/login` routes
- Verify Ethereum signature using `ethers.utils.verifyMessage`
- Return JWT or session to frontend

📝 **Goal**: Users can securely log in with Ethereum wallet

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

Open pgAdmin in your browser:
👉 http://localhost:5050

### Log in with:

- Email: admin@local.com
- Password: admin

### Add a new server in pgAdmin:

- Name: Local Postgres
- Host: db
- Port: 5432
- Username: postgres
- Password: postgres