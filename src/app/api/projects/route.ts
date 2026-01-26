import { NextResponse } from 'next/server';
import { projectService } from '@/services/projectService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');

        let projects;
        if (customerId) {
            projects = await projectService.getProjectsByCustomer(customerId);
        } else {
            projects = await projectService.getAllProjects();
        }

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
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
        const project = await projectService.createProject({
            ...data,
            createdBy: session.userId as string,
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
