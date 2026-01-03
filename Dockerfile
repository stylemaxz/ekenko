FROM node:20-slim AS base

# Install OpenSSL (required for Prisma) and ca-certificates
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# 1. Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies
# Install dependencies
# We delete package-lock.json to force npm to resolve dependencies for Linux
# This fixes the missing lightningcss binary issue caused by cross-platform lockfile
COPY package.json ./
RUN npm install

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
# This will generate the standalone folder because we enabled output: "standalone" in next.config.ts
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
