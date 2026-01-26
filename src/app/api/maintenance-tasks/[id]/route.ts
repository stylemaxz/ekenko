import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance-tasks/[id] - Get task details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const task = await prisma.maintenanceTask.findUnique({
            where: { id },
            include: {
                asset: {
                    select: {
                        id: true,
                        serialNumber: true,
                        modelName: true,
                        status: true,
                        condition: true,
                    }
                },
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                partsUsage: {
                    include: {
                        part: true
                    }
                }
            }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch maintenance task' },
            { status: 500 }
        );
    }
}

// PUT /api/maintenance-tasks/[id] - Update task
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const {
            title,
            description,
            priority,
            status,
            assignedTo,
            scheduledDate,
            estimatedHours,
            actualHours,
            notes,
            images,
        } = body;

        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'completed') {
                updateData.completedDate = new Date();
            }
        }
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
        if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
        if (actualHours !== undefined) updateData.actualHours = actualHours;
        if (notes !== undefined) updateData.notes = notes;
        if (images !== undefined) updateData.images = images;

        const task = await prisma.maintenanceTask.update({
            where: { id },
            data: updateData,
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
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to update maintenance task' },
            { status: 500 }
        );
    }
}

// DELETE /api/maintenance-tasks/[id] - Delete task (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.maintenanceTask.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to delete maintenance task' },
            { status: 500 }
        );
    }
}
