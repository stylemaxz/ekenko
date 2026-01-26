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
        const samples = await sampleService.getSamplesByProduct(id);

        return NextResponse.json(samples);
    } catch (error) {
        console.error('Error fetching samples:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
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

        const sample = await sampleService.createSample({
            ...data,
            productId: id,
            sentBy: session.id as string,
        });

        return NextResponse.json(sample, { status: 201 });
    } catch (error: any) {
        console.error('Error creating sample:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
