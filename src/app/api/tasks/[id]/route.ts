
import { NextResponse } from 'next/server';
import { taskService } from '@/services/taskService';
import { getSession } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'manager') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await taskService.deleteTask(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting task:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
