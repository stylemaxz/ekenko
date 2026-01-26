# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ekenko Sales Tracker - A Sales Force Automation (SFA) web application for managing sales team activities, customer relationships, task assignments, asset management, maintenance workflows, and spare parts inventory. Built with Next.js 16 App Router and TypeScript.

## Development Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Generate coverage report
npm test -- src/__tests__/auth.test.ts  # Run single test file
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
- **Testing:** Jest 30 + React Testing Library (tests in `src/__tests__/`)

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/admin/` - Manager dashboard (dashboard, employees, customers, tasks, leave, calendar, activity-logs, reports, settings, assets, maintenance, spare-parts, contracts)
- `src/app/sale/` - Sales rep pages (dashboard, check-in, customers, tasks, leave, profile)
- `src/app/maintenance/` - Maintenance staff pages (dashboard, my-tasks, tasks/[id], profile)
- `src/app/api/` - REST API route handlers (29 endpoints)
- `src/components/` - React components (UI, admin, maintenance)
- `src/contexts/` - React Context providers (Language, Toast, ConfirmDialog)
- `src/services/` - Business logic layer with Prisma operations
- `src/lib/` - Core utilities (auth.ts, prisma.ts, storage.ts)
- `src/types/` - Shared TypeScript types
- `src/utils/` - Translations (500+ keys), Thai address data, region mapping
- `prisma/` - Database schema and seed files

### Authentication & Authorization
- JWT tokens stored in httpOnly `accessToken` cookie (24h expiry)
- Middleware (`src/middleware.ts`) handles auth verification and RBAC
- Three roles: `manager` (admin access), `sales` (sales rep access), `maintenance` (maintenance staff access)
- All API routes require session verification via `getSession()` from `src/lib/auth.ts`

### Data Flow Pattern
1. **API Routes** (`src/app/api/*/route.ts`) - Handle HTTP requests, auth checks
2. **Services** (`src/services/*Service.ts`) - Business logic, Prisma operations
3. **Prisma Client** (`src/lib/prisma.ts`) - Database singleton

### Page Patterns
- **Admin pages:** Client components with useEffect data fetching
- **Sale pages:** Server component + client component split (e.g., `page.tsx` + `client.tsx`)
- **Maintenance pages:** Client components with task workflow states
- All pages wrapped with context providers in root layout

### Context Providers (Global State)
- `LanguageContext` - i18n (Thai/English), use `useLanguage()` hook, `t('key')` for translations
- `ToastContext` - Notifications via `showToast(message, type)`
- `ConfirmDialogContext` - Confirmation dialogs via `confirm({ title, message, type })`

### Internationalization
- Manual key-based system in `src/utils/translations.ts` (500+ keys)
- Languages: `th` (Thai, default) and `en` (English)
- Usage: `const { t, language, setLanguage } = useLanguage()`

## Database Schema (Key Models)

**Core Models:**
- **Employee** - Users with role (sales/manager/maintenance), credentials, assigned locations
- **Company** - Customer companies with grade (A/B/C) and status (existing/lead/inactive/closed/terminate/active)
- **Location** - Branch locations with GPS, customer details (owner, contacts, credit terms, VAT type)
- **ContactPerson** - Customer contacts at locations
- **Visit** - Check-in records with objectives, notes, images, owner meeting indicator
- **Task** - Assigned tasks with priority (low/medium/high), status (pending/in_progress/completed/overdue)
- **LeaveRequest** - Leave requests with types (sick/personal/vacation/other), paid/unpaid, approval workflow
- **ActivityLog** - Audit trail for all actions

**Asset Management Models:**
- **Asset** - Equipment with serial number, status (AVAILABLE/RENTED/MAINTENANCE/RESERVED/DISPOSAL/LOST/SPARE), condition (NEW/USED/REFURBISHED/BROKEN)
- **AssetTransaction** - Movement history (DELIVERY/RETURN/TRANSFER/MAINTENANCE_IN/MAINTENANCE_OUT/ADJUSTMENT)
- **Reservation** - Asset reservations with status (PENDING/CONFIRMED/CANCELLED)

**Maintenance System Models:**
- **MaintenanceTask** - Work orders with priority (low/medium/high/urgent), status (pending/assigned/in_progress/completed/cancelled), time tracking
- **SparePart** - Inventory with part number, stock tracking, minimum stock alerts, pricing
- **TaskPartUsage** - Parts used in maintenance tasks with quantity and price

**Service Contract Models:**
- **ServiceContract** - Agreements with types (RENTAL/LOAN/TRIAL), status (DRAFT/ACTIVE/EXPIRED/TERMINATED/VOID/CLOSED)
- **ContractItem** - Links assets to contracts (many-to-many)

## API Endpoints Overview

**Auth:** `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
**Employees:** `/api/employees`, `/api/employees/[id]`
**Companies:** `/api/companies`, `/api/companies/[id]`
**Visits:** `/api/visits`
**Tasks:** `/api/tasks`, `/api/tasks/[id]`
**Leave:** `/api/leave-requests`, `/api/leave-requests/[id]`
**Activity:** `/api/activity-logs`
**Assets:** `/api/assets`, `/api/assets/[id]`, `/api/assets/[id]/history`
**Maintenance:** `/api/maintenance-tasks`, `/api/maintenance-tasks/[id]`, `/api/maintenance-tasks/[id]/start`, `/api/maintenance-tasks/[id]/complete`, `/api/maintenance-tasks/[id]/parts`
**Spare Parts:** `/api/spare-parts`, `/api/spare-parts/[id]`
**Contracts:** `/api/contracts`
**Utilities:** `/api/upload`, `/api/extract-coordinates`, `/api/cron/auto-clock-out`

## Key Conventions

- **Timezone:** Always use Bangkok timezone (Asia/Bangkok) for date operations
- **Date handling:** Use date-fns and date-fns-tz for timezone-aware operations
- **API responses:** Return JSON with appropriate status codes (401 unauthorized, 404 not found, etc.)
- **Error handling:** Prisma error P2002 indicates unique constraint violation
- **File uploads:** Use `uploadFile()` from `src/lib/storage.ts` for GCS uploads
- **Session check:** Always verify session in API routes before operations
- **Hydration:** Initialize dates in useEffect to prevent SSR/client mismatch
- **Maintenance workflow:** pending → assigned → in_progress → completed

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=your-secret-key
```

For Google Cloud Storage (file uploads):
- In Cloud Run: Uses default service account credentials automatically
- Locally: Run `gcloud auth application-default login` or set `GOOGLE_APPLICATION_CREDENTIALS`
