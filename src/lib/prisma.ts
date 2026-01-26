import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma_dev: PrismaClient };

export const prisma = globalForPrisma.prisma_dev || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_dev = prisma;

// Force reload after schema update
