import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/maintenance-tasks/[id]/start - Start a task
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const task = await prisma.maintenanceTask.update({
            where: { id },
            data: {
                status: 'in_progress',
            },
            include: {
                asset: {
                    select: {
                        serialNumber: true,
                        modelName: true,
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error starting maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to start task' },
            { status: 500 }
        );
    }
}
