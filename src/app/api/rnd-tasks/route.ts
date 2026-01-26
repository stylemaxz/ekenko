import { NextResponse } from 'next/server';
import { rndTaskService } from '@/services/rndTaskService';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        let tasks;
        if (projectId) {
            tasks = await rndTaskService.getTasksByProject(projectId);
        } else {
            // Filter by role
            tasks = await rndTaskService.getTasksByRole(
                session.userId as string,
                session.role as Role
            );
        }

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching R&D tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !['manager', 'rnd'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const task = await rndTaskService.createTask({
            ...data,
            createdBy: session.userId as string,
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error: any) {
        console.error('Error creating R&D task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
