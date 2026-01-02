
import { NextResponse } from 'next/server';
import { taskService } from '@/services/taskService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');

        let tasks;
        if (assigneeId) {
            tasks = await taskService.getTasksByAssignee(assigneeId);
        } else {
            tasks = await taskService.getAllTasks();
        }

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'manager') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const task = await taskService.createTask(data);

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
