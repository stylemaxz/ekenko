
import { NextResponse } from 'next/server';
import { visitService } from '@/services/visitService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        let visits;
        if (employeeId) {
            visits = await visitService.getVisitsByEmployee(employeeId);
        } else {
            visits = await visitService.getAllVisits();
        }

        return NextResponse.json(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const visit = await visitService.createVisit(data);

        return NextResponse.json(visit, { status: 201 });
    } catch (error: any) {
        console.error('Error creating visit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
