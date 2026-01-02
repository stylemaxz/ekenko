---
description: Setup Prisma with Cloud SQL (PostgreSQL)
---

# Prisma + Cloud SQL Setup Guide

This guide describes how to connect your Next.js application to Google Cloud SQL (PostgreSQL) using Prisma.

## Prerequisites

- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) installed.

## Step 1: Configuration

1. **Verify `schema.prisma`**:
   Ensure your `prisma/schema.prisma` is set to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update `.env`**:
   Add your database connection string to `.env`. When using Cloud SQL Auth Proxy, the host is `localhost`.
   ```bash
   # Replace USER, PASSWORD, and DB_NAME with your actual Cloud SQL credentials
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
   ```

## Step 2: Running Cloud SQL Auth Proxy

To connect to your Cloud SQL instance from your local machine, run the following command in a separate terminal:

```bash
# Replace 'ekenko-postgres' with your full Connection Name (e.g., project-id:region:instance-name)
./cloud_sql_proxy -instances=<INSTANCE_CONNECTION_NAME>=tcp:5432
# Or if installed via brew/apt:
cloud-sql-proxy --port 5432 <INSTANCE_CONNECTION_NAME>
```

*Note: Your Instance Connection Name provided was `ekenko-postgres`. You likely need the full Project ID prefix, usually found in the Google Cloud Console Overview page (e.g., `maxmatec-project:asia-southeast1:ekenko-postgres`).*

## Step 3: Database Migration

Once the proxy is running and `.env` is set:

1. **Define your models** in `prisma/schema.prisma`.
2. **Push changes** to the database:
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Generate Client** (happens automatically after migrate, but if needed):
   ```bash
   npx prisma generate
   ```

## Step 4: Using Prisma in Next.js

Import the shared instance from `src/lib/prisma.ts`:

```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```
