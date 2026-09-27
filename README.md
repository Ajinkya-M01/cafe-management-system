# NOIR & BEAN ☕ — Café Management System

**Coffee. Cuisine. Conversations.**

A full-stack café management platform built with Next.js — a customer-facing ordering & reservation site paired with a role-based admin back office for running day-to-day café operations.

🔗 **Live demo:** [cafe-management-system-green-delta.vercel.app](https://cafe-management-system-green-delta.vercel.app/)
📦 **Repo:** [Ajinkya-M01/cafe-management-system](https://github.com/Ajinkya-M01/cafe-management-system)

---

## ✨ Features

### Customer-facing site
- Browse the menu by category (Coffee, Tea, Cold Beverages, Breakfast, Snacks, Main Course, Desserts, Specials) with veg/non-veg and "popular" tags
- Add items to a cart and check out for **dine-in** or **takeaway** orders
- Auto-generated order numbers (`NB-XXXX`) with GST (CGST/SGST) calculated at checkout
- Table reservations with date, time, guest count, and table-type preference
- Order and reservation confirmation pages
- Contact page

### Admin dashboard (role-based: `ADMIN`, `MANAGER`, `STAFF`)
- **Dashboard** — operational overview
- **Orders** — manage order lifecycle (Pending → Confirmed → Preparing → Ready → Completed/Cancelled)
- **Tables** — track table status (Available, Occupied, Reserved, Billing, Cleaning) across sections (Indoor, Patio, Window, Private), with **QR code generation** per table
- **Reservations** — confirm, assign tables, and track no-shows
- **Billing** — generate invoices with GST breakdown and export as **PDF**
- **Menu** — manage menu items, pricing, and availability
- **Customers** — customer directory with order history and total spend
- **Reports** — sales and performance reporting
- **Settings** — café profile (name, address, GSTIN, tax rates, opening hours)

### Auth & security
- Custom JWT-style session tokens (HMAC-signed, 7-day expiry) issued on login and stored in an HTTP-only cookie
- Passwords hashed (SHA-256 + salt) before storage
- `middleware.ts` protects all `/admin/*` routes, redirecting unauthenticated users to `/admin/login`
- Role hierarchy enforced on API routes: `ADMIN` > `MANAGER` > `STAFF`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| Language | TypeScript |
| Data | JSON file "database" (`data/database.json`) via a lightweight custom data-access layer |
| PDF / QR | `jspdf` (invoices), `qrcode` (table QR codes) |
| Deployment | [Vercel](https://vercel.com) |

> Note: this project stores data in a local JSON file rather than a traditional database — it's ideal for demos and prototyping. See [Notes](#-notes) below before using it in production.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/            # Admin dashboard pages (dashboard, orders, tables,
│   │                       reservations, billing, menu, customers, reports, settings)
│   ├── api/               # Route handlers
│   │   ├── admin/         # Admin CRUD endpoints
│   │   ├── auth/          # login / logout / me
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── reservations/
│   │   └── tables/[id]/qr # QR code generation
│   ├── cart/, checkout/, menu/, reservation/  # Customer-facing pages
│   └── page.tsx           # Landing page
├── components/            # Shared & customer UI components
├── context/               # AuthContext, CartContext (React context/state)
├── lib/                   # db.ts (data layer), auth.ts (JWT + hashing), api-guard.ts
├── types/                 # Shared TypeScript types (User, Order, Table, Bill, etc.)
└── middleware.ts          # Protects /admin/* routes
data/
└── database.json          # Seed data: users, menu items, tables, orders, etc.
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ (Next.js 16 requirement)
- npm / yarn / pnpm / bun

### Installation

```bash
git clone https://github.com/Ajinkya-M01/cafe-management-system.git
cd cafe-management-system
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the customer site.

### Other scripts

```bash
npm run build   # production build
npm run start   # start production server
npm run lint    # run ESLint
```

---

## 🔐 Demo Admin Logins

The admin panel (`/admin/login`) ships with three seeded accounts, one per role:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@noirandbean.com` | `admin123` |
| Manager | `manager@noirandbean.com` | `manager123` |
| Staff | `staff@noirandbean.com` | `staff123` |

*(These are demo/seed credentials from `data/database.json` — rotate or remove them before deploying with real data.)*

---

## 🌐 Deployment

The app is deployed on [Vercel](https://vercel.com) at:
👉 **https://cafe-management-system-green-delta.vercel.app/**

To deploy your own copy, push the repo to GitHub and import it into Vercel — no special configuration is required beyond the standard Next.js build.

---

## 📝 Notes

- Data persists to a bundled JSON file (`data/database.json`), which works locally but **will not persist writes** on serverless/read-only deployments like Vercel — treat the hosted demo as a live showcase with data that resets on redeploy, not a durable multi-user backend.
- The `AUTH_SECRET` environment variable should be set in production to override the default JWT signing secret in `src/lib/auth.ts`.

---

## 📄 License

No license file is currently included in this repository. Add one (e.g. MIT) if you intend for others to reuse this code.
