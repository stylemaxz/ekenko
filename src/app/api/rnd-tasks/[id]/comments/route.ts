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
        const comments = await rndTaskService.getComments(id);

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
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

        // Verify task exists and user has access
        const task = await rndTaskService.getTaskById(id);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Sales can only comment on their own tasks
        if (session.role === 'sales' && task.assigneeId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const comment = await rndTaskService.addComment(id, {
            ...data,
            authorId: session.userId as string,
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
