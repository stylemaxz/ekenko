import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spare-parts
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get('search');

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { partNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const parts = await prisma.sparePart.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(parts);
    } catch (error) {
        console.error('Error fetching spare parts:', error);
        return NextResponse.json({ error: 'Failed to fetch spare parts' }, { status: 500 });
    }
}

// POST /api/spare-parts
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, partNumber, description, imageUrl, stock, minStock, price } = body;

        // Validation
        if (!name || !partNumber) {
            return NextResponse.json({ error: 'Name and Part Number are required' }, { status: 400 });
        }

        const existing = await prisma.sparePart.findUnique({
            where: { partNumber }
        });

        if (existing) {
            return NextResponse.json({ error: 'Part number already exists' }, { status: 409 });
        }

        const part = await prisma.sparePart.create({
            data: {
                name,
                partNumber,
                description,
                imageUrl,
                stock: stock || 0,
                minStock: minStock || 5,
                price: price || 0.0
            }
        });

        return NextResponse.json(part, { status: 201 });
    } catch (error) {
        console.error('Error creating spare part:', error);
        return NextResponse.json({ error: 'Failed to create spare part' }, { status: 500 });
    }
}
