---
description: Sales Representative Module Implementation Plan
---

# Sales Representative Module Implementation Plan

This plan outlines the steps to implement the frontend for the Sales Representative module, focusing on a mobile-first experience as per the PRD "Phase 1 (MVP)".

## 1. Structure & Routing

*   **Base Route:** `/sale`
*   **Layout:** Creating a dedicated `SalesLayout` (`src/app/sale/layout.tsx`) that is distinct from the Admin layout. It will feature a mobile-optimized Bottom Navigation Bar.
*   **Pages:**
    *   `/sale/dashboard`: The main landing page.
    *   `/sale/customers`: List of customers (with add/edit capabilities).
    *   `/sale/check-in`: The core flow for visiting a customer.
    *   `/sale/profile`: User profile and settings.

## 2. Shared Components (Mobile Optimized)

*   **Bottom Navigation Bar:** Fixed at the bottom, providing quick access to key sections.
*   **Mobile Header:** Simple header with page title and specific actions (e.g., "Add" button).
*   **Card Components:** Reusing existing styles but ensuring touch targets are large enough (min 44px).

## 3. Implementation Details (Phase 1 MVP)

### Step 1: Create Sales Layout
- Create `src/app/sale/layout.tsx`.
- Implement a `BottomNav` component with icons for Home, Customers, and Check-in (or Profile).
- Ensure the layout is responsive but primarily designed for mobile viewports.

### Step 2: Dashboard (`/sale/dashboard`)
- **Header:** Welcome message + Current Date.
- **Clock In/Out:** A prominent button group to toggle status.
  - *Note:* For MVP, this will just toggle a local state or update a mock context.
- **Quick Actions:** Buttons for "Check In" (redirects to check-in flow) and "New Customer".
- **Recent Activity:** A feed showing the user's recent actions (reusing logic from Admin Dashboard but filtered for the current user).

### Step 3: Customer List (`/sale/customers`)
- **Search:** Simple text search.
- **List View:** Mobile-friendly card list of customers.
- **Add Customer:** A simplified form to add a new customer (Name, simple location).

### Step 4: Check-In Flow (`/sale/check-in`)
- **Location Selection:**
  - Mock GPS: Button to "Use Current Location" (simulated).
  - List nearby customers (mock distance).
- **Check-In Form:**
  - **Photo Upload:** Input file (capture=environment).
  - **Objectives:** Checkboxes matching `VisitObjective` types.
  - **Notes:** Text area.
- **Submit:** Saves to `mockVisits`.

## 4. Data Integration
- Use `mockData.ts` as the source of truth.
- Ensure new visits created here appear in the Admin Dashboard.
