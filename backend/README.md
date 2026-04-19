# Intellistock Backend

AI-powered inventory management SaaS backend built with Express 5, TypeScript, and MongoDB.

## Prerequisites

- Node.js Active LTS
- MongoDB (Local or Atlas)
- npm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the values in `.env`.
4. Run in development mode:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Start development server with ts-node-dev
- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start production server from `dist/`
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript compiler without emitting files
- `npm test`: Run tests (when implemented)

## API Documentation

The API is structured under `/api/v1`. Authentication is handled via JWT (Access and Refresh tokens).

### Key Modules

- **Auth**: Registration, Login, Google OAuth, Password Reset, Invite system.
- **Products**: CRUD, Search, CSV Import/Export.
- **Warehouses**: Multi-warehouse support with plan-based limits.
- **Movements**: Immutable audit log of stock changes.
- **Purchase Orders**: Workflow from draft to receiving.

## Monitoring

Sentry is used for error tracking. Ensure `SENTRY_DSN` is set in your `.env`.

## Security

- JWT Authentication with Refresh Token rotation.
- Role-based Access Control (RBAC).
- Multi-tenancy enforced at the database level (orgId).
- Rate limiting on API and Auth endpoints.
- Input validation using Zod.
- Data sanitization and secure headers (Helmet).
