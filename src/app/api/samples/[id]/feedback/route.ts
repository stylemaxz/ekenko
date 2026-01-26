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
        const feedback = await sampleService.getFeedback(id);

        if (!feedback) {
            return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
        }

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
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

        // Check if feedback already exists
        const existing = await sampleService.getFeedback(id);
        if (existing) {
            return NextResponse.json({ error: 'Feedback already submitted for this sample' }, { status: 400 });
        }

        const feedback = await sampleService.submitFeedback(id, {
            ...data,
            feedbackBy: session.userId as string,
        });

        return NextResponse.json(feedback, { status: 201 });
    } catch (error: any) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
