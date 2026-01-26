import { NextResponse } from 'next/server';
import { rndTaskService } from '@/services/rndTaskService';
import { getSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const task = await rndTaskService.getTaskById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Sales can only view their own tasks
        if (session.role === 'sales' && task.assigneeId !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching R&D task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Get current task to check ownership
        const currentTask = await rndTaskService.getTaskById(id);
        if (!currentTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Sales can only update status of their own tasks
        if (session.role === 'sales') {
            if (currentTask.assigneeId !== session.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Sales can only update status and completionNote
            const allowedFields = ['status', 'completionNote'];
            const filteredData: any = {};
            for (const field of allowedFields) {
                if (data[field] !== undefined) {
                    filteredData[field] = data[field];
                }
            }
            const task = await rndTaskService.updateTask(id, filteredData);
            return NextResponse.json(task);
        }

        const task = await rndTaskService.updateTask(id, data);
        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Error updating R&D task:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['manager', 'rnd'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await rndTaskService.deleteTask(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting R&D task:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
