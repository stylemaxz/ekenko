import { NextResponse } from 'next/server';
import { sampleService } from '@/services/sampleService';
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
        const sample = await sampleService.getSampleById(id);

        if (!sample) {
            return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
        }

        return NextResponse.json(sample);
    } catch (error) {
        console.error('Error fetching sample:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !['manager', 'rnd'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const sample = await sampleService.updateSample(id, data);

        return NextResponse.json(sample);
    } catch (error: any) {
        console.error('Error updating sample:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
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
        await sampleService.deleteSample(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting sample:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
