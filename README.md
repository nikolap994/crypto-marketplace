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

| Week | Goal                                              | Backend Tasks                       | Frontend Tasks                   |
|-------|-------------------------------------------------|------------------------------------|---------------------------------|
| 1     | Setup backend + frontend; basic routing          | Express server setup, test ping    | Next.js app, wallet connection  |
| 2     | Implement wallet auth (SIWE)                      | `/auth/nonce`, `/auth/login` APIs | MetaMask + signature login flow |
| 3     | Product listing CRUD                              | `/products` APIs                   | Seller dashboard UI             |
| 4     | Order creation + manual crypto payment logging   | `/orders` APIs                     | Buyer checkout flow             |
| 5     | Admin panel: release escrow funds                 | `/admin/release` API               | Admin dashboard UI              |
| 6     | Add file uploads, polish UI, deploy               | File upload handling               | Responsive UI & testing         |

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