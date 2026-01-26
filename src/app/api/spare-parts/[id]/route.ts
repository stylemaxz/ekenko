import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const part = await prisma.sparePart.findUnique({
            where: { id }
        });

        if (!part) {
            return NextResponse.json({ error: 'Part not found' }, { status: 404 });
        }

        return NextResponse.json(part);
    } catch (error) {
        console.error('Error fetching spare part:', error);
        return NextResponse.json({ error: 'Failed to fetch part' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, partNumber, description, imageUrl, stock, minStock, price } = body;

        // Validation
        if (!name || !partNumber) {
            return NextResponse.json({ error: 'Name and Part Number are required' }, { status: 400 });
        }

        // Check if part number exists for OTHER parts
        const existing = await prisma.sparePart.findFirst({
            where: {
                partNumber,
                NOT: { id }
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Part number already exists' }, { status: 409 });
        }

        const updatedPart = await prisma.sparePart.update({
            where: { id },
            data: {
                name,
                partNumber,
                description,
                imageUrl,
                stock,
                minStock,
                price
            }
        });

        return NextResponse.json(updatedPart);
    } catch (error) {
        console.error('Error updating spare part:', error);
        return NextResponse.json({ error: 'Failed to update part' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check usage before delete
        const usageCount = await prisma.taskPartUsage.count({
            where: { partId: id }
        });

        if (usageCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete part that is used in maintenance tasks.'
            }, { status: 400 });
        }

        await prisma.sparePart.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Part deleted successfully' });
    } catch (error) {
        console.error('Error deleting spare part:', error);
        return NextResponse.json({ error: 'Failed to delete part' }, { status: 500 });
    }
}
