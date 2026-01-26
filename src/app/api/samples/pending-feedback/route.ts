import { NextResponse } from 'next/server';
import { sampleService } from '@/services/sampleService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
        }

        const samples = await sampleService.getPendingSamplesForCustomer(customerId);

        return NextResponse.json(samples);
    } catch (error) {
        console.error('Error fetching pending samples:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
