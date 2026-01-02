
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Try to connect and count companies (should be 0)
        await prisma.$connect();
        const count = await prisma.company.count();

        return NextResponse.json({
            status: 'success',
            message: 'Connected to Cloud SQL/PostgreSQL successfully!',
            companyCount: count
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
