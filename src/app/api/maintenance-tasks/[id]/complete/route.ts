import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/maintenance-tasks/[id]/complete - Complete a task
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { actualHours, notes, images } = body;

        const task = await prisma.maintenanceTask.update({
            where: { id },
            data: {
                status: 'completed',
                completedDate: new Date(),
                actualHours: actualHours || null,
                notes: notes || null,
                images: images || [],
            },
            include: {
                asset: {
                    select: {
                        serialNumber: true,
                        modelName: true,
                    }
                },
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error completing maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to complete task' },
            { status: 500 }
        );
    }
}
