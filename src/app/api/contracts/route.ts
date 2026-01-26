import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');

        const where: any = {};
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        const contracts = await prisma.serviceContract.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, name: true }
                },
                items: {
                    include: {
                        asset: {
                            select: { id: true, modelName: true, serialNumber: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(contracts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customerId,
            contractNumber,
            startDate,
            endDate,
            status,
            price,
            description,
            assetIds
        } = body;

        const contract = await prisma.$transaction(async (tx) => {
            // 1. Create Contract
            const newContract = await tx.serviceContract.create({
                data: {
                    customerId,
                    contractNumber,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    status: status || 'DRAFT',
                    price: parseFloat(price) || 0,
                    notes: description,
                }
            });

            // 2. Create Contract Items (Link Assets)
            if (assetIds && assetIds.length > 0) {
                await tx.contractItem.createMany({
                    data: assetIds.map((assetId: string) => ({
                        serviceContractId: newContract.id,
                        assetId
                    }))
                });

                // 3. Update Asset's current contract (Optional: logic to set only if active)
                if (status === 'ACTIVE') {
                    // This logic might be complex if multiple contracts exist, 
                    // but usually asset has one active contract.
                    // We won't strictly enforce "currentContractId" on Asset model yet as per schema,
                    // but the relation is via ContractItem.
                }
            }

            return newContract;
        });

        return NextResponse.json(contract);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Failed to create contract' }, { status: 500 });
    }
}
