
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus, AssetCondition } from '@prisma/client';

export async function GET() {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                location: {
                    select: {
                        name: true,
                        id: true,
                        company: { select: { name: true, id: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { serialNumber, modelName, status, condition, cost, purchaseDate, currentLocationId } = body;

        // Basic Validation
        if (!serialNumber || !modelName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newAsset = await prisma.asset.create({
            data: {
                serialNumber,
                modelName,
                status: status as AssetStatus || 'AVAILABLE',
                condition: condition as AssetCondition || 'NEW',
                cost: cost ? parseFloat(cost) : undefined,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
                currentLocationId: currentLocationId || undefined,
            },
            include: {
                location: { include: { company: true } }
            }
        });

        // Log the transaction (Initial Creation / "Purchase")
        await prisma.assetTransaction.create({
            data: {
                assetId: newAsset.id,
                action: 'ADJUSTMENT',
                reason: 'Initial Import / Purchase',
                performedBy: 'System' // Or User ID if available
            }
        });

        return NextResponse.json(newAsset);

    } catch (error) {
        console.error('Error creating asset:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
