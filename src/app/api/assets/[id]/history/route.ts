import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {

        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                location: {
                    select: { name: true, company: { select: { name: true } } }
                },
                contractItems: {
                    where: {
                        serviceContract: {
                            status: 'ACTIVE'
                        }
                    },
                    include: {
                        serviceContract: {
                            select: {
                                contractNumber: true,
                                startDate: true,
                                endDate: true,
                                customer: { select: { name: true } }
                            }
                        }
                    }
                },
                maintenanceTasks: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        assignedEmployee: { select: { name: true } },
                        partsUsage: {
                            include: {
                                part: { select: { name: true, partNumber: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json(asset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch asset history' }, { status: 500 });
    }
}
