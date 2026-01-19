# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ekenko Sales Tracker - A Sales Force Automation (SFA) web application for managing sales team activities, customer relationships, task assignments, and performance tracking. Built with Next.js 16 App Router and TypeScript.

## Development Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Generate coverage report
```

**Database (Prisma):**
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma db push     # Push schema changes to database
npx prisma db seed     # Seed initial data (npx tsx prisma/seed.ts)
npx prisma studio      # Open database GUI
npx prisma migrate dev # Run migrations
```

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router, Server Components by default)
- **React:** 19.2.3 with TypeScript
- **Database:** PostgreSQL via Prisma ORM 6.19.1
- **Styling:** Tailwind CSS v4 with @tailwindcss/postcss
- **Auth:** Custom JWT (jose) with httpOnly cookies, bcryptjs for passwords
- **File Storage:** Google Cloud Storage (bucket: ekenko-media)
- **Testing:** Jest 30 + React Testing Library

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/admin/` - Manager dashboard pages (role: manager)
- `src/app/sale/` - Sales rep pages (role: sales)
- `src/app/api/` - REST API route handlers
- `src/components/` - React components
- `src/contexts/` - React Context providers (Language, Toast, ConfirmDialog)
- `src/services/` - Business logic layer with Prisma operations
- `src/lib/` - Core utilities (auth.ts, prisma.ts, storage.ts)
- `src/types/` - Shared TypeScript types
- `src/utils/` - Translations and helper utilities
- `prisma/` - Database schema and seed files

### Authentication & Authorization
- JWT tokens stored in httpOnly `accessToken` cookie (24h expiry)
- Middleware (`src/middleware.ts`) handles auth verification and RBAC
- Two roles: `manager` (admin access) and `sales` (sales rep access)
- All API routes require session verification via `getSession()` from `src/lib/auth.ts`

### Data Flow Pattern
1. **API Routes** (`src/app/api/*/route.ts`) - Handle HTTP requests, auth checks
2. **Services** (`src/services/*Service.ts`) - Business logic, Prisma operations
3. **Prisma Client** (`src/lib/prisma.ts`) - Database singleton

### Page Patterns
- **Admin pages:** Client components with useEffect data fetching
- **Sale pages:** Server component + client component split (e.g., `page.tsx` + `client.tsx`)
- All pages wrapped with context providers in root layout

### Context Providers (Global State)
- `LanguageContext` - i18n (Thai/English), use `useLanguage()` hook, `t('key')` for translations
- `ToastContext` - Notifications via `showToast(message, type)`
- `ConfirmDialogContext` - Confirmation dialogs via `confirm({ title, message, type })`

### Internationalization
- Manual key-based system in `src/utils/translations.ts`
- Languages: `th` (Thai, default) and `en` (English)
- Usage: `const { t, language, setLanguage } = useLanguage()`

## Database Schema (Key Models)

- **Employee** - Users with role (sales/manager), credentials, assigned locations
- **Company** - Customer companies with grade (A/B/C) and status
- **Location** - Branch locations belonging to companies, with GPS coordinates
- **Visit** - Check-in records with objectives, notes, images
- **Task** - Assigned tasks with priority, status, due dates
- **LeaveRequest** - Employee leave requests with approval workflow
- **ActivityLog** - Audit trail for all actions

## Key Conventions

- **Timezone:** Always use Bangkok timezone (Asia/Bangkok) for date operations
- **Date handling:** Use date-fns and date-fns-tz for timezone-aware operations
- **API responses:** Return JSON with appropriate status codes (401 unauthorized, 404 not found, etc.)
- **Error handling:** Prisma error P2002 indicates unique constraint violation
- **File uploads:** Use `uploadFile()` from `src/lib/storage.ts` for GCS uploads
- **Session check:** Always verify session in API routes before operations
- **Hydration:** Initialize dates in useEffect to prevent SSR/client mismatch

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=your-secret-key
```
