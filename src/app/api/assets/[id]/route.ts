
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus, AssetCondition } from '@prisma/client';

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { serialNumber, modelName, status, condition, cost, purchaseDate, currentLocationId } = body;

        const updatedAsset = await prisma.asset.update({
            where: { id },
            data: {
                serialNumber,
                modelName,
                status: status as AssetStatus,
                condition: condition as AssetCondition,
                cost: cost ? parseFloat(cost) : null,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                currentLocationId: currentLocationId || null,
            },
            include: {
                location: { include: { company: true } }
            }
        });

        // Add Transaction Log for updates?
        // For now, simple update returns the asset.

        return NextResponse.json(updatedAsset);
    } catch (error) {
        console.error('Error updating asset:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.asset.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
