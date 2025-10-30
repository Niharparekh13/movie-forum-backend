# 🎬 Movie Forum Backend (CWEB 280 Final Project)

**Tech Stack:** Express + TypeScript + Prisma (MySQL)  
**Security:** JWT Auth · Role-based Access · Helmet · CORS · Rate Limit  
**Validation:** Zod Schema Validation · Centralized Error Handling  
**Testing:** Jest + Supertest Integration Suite (Auth, Movies, Reviews, Health)

---

## 🚀 Quick Start

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Configure environment
cp .env.example .env
# → Edit .env with your MySQL connection string and JWT secret

# 3️⃣ Initialize database
npx prisma migrate dev --name init
npm run prisma:seed          # or: npx tsx prisma/seed.ts

# 4️⃣ Run the server
npm run dev                  # development mode (tsx watch)
# or
npm run build && npm start   # production mode
