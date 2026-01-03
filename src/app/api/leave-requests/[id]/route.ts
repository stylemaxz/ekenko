
import { NextResponse } from 'next/server';
import { leaveRequestService } from '@/services/leaveRequestService';
import { getSession } from '@/lib/auth';

export async function PUT(
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

        const leaveRequest = await leaveRequestService.updateLeaveRequest(id, data);
        return NextResponse.json(leaveRequest);
    } catch (error: any) {
        console.error('Error updating leave request:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
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
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await leaveRequestService.deleteLeaveRequest(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting leave request:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
