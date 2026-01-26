import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance-tasks - List maintenance tasks with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assignedTo');
        const assetId = searchParams.get('assetId');

        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (priority && priority !== 'ALL') {
            where.priority = priority;
        }

        if (assignedTo) {
            where.assignedTo = assignedTo;
        }

        if (assetId) {
            where.assetId = assetId;
        }

        const tasks = await prisma.maintenanceTask.findMany({
            where,
            include: {
                asset: {
                    select: {
                        serialNumber: true,
                        modelName: true,
                        status: true,
                    }
                },
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
                { scheduledDate: 'asc' }
            ]
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch maintenance tasks' },
            { status: 500 }
        );
    }
}

// POST /api/maintenance-tasks - Create new maintenance task
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            assetId,
            title,
            description,
            priority,
            scheduledDate,
            estimatedHours,
            assignedTo,
        } = body;

        // Validation
        if (!assetId || !title || !description || !priority) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const task = await prisma.maintenanceTask.create({
            data: {
                assetId,
                title,
                description,
                priority,
                status: assignedTo ? 'assigned' : 'pending',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                estimatedHours,
                assignedTo: assignedTo || null,
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
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating maintenance task:', error);
        return NextResponse.json(
            { error: 'Failed to create maintenance task' },
            { status: 500 }
        );
    }
}
