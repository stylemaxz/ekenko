
import { NextResponse } from 'next/server';
import { leaveRequestService } from '@/services/leaveRequestService';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        let leaveRequests;
        if (employeeId) {
            leaveRequests = await leaveRequestService.getLeaveRequestsByEmployee(employeeId);
        } else {
            leaveRequests = await leaveRequestService.getAllLeaveRequests();
        }

        return NextResponse.json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
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
        const leaveRequest = await leaveRequestService.createLeaveRequest(data);

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error: any) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
