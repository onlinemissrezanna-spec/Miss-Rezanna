# MISS REZANNA Backend (Phase 1)

Enterprise-level Node.js backend foundation.

## Tech Stack
- Node.js & Express
- Prisma ORM & MySQL
- JWT Auth (Prepared)
- Zod Validation
- Helmet, CORS, RateLimiter

## Installation
1. Install dependencies:
   npm install

2. Configure Environment:
   Copy .env.example to .env and set your MySQL DATABASE_URL.

3. Initialize Database:
   npx prisma migrate dev --name init

4. Run Server:
   npm run dev

## Architecture Note
This is Phase 1 scaffolding. Business logic for products, orders, and payments will be integrated in subsequent phases.
