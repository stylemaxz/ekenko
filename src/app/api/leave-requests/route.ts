
import { NextResponse } from 'next/server';
import { leaveRequestService } from '@/services/leaveRequestService';
import { activityLogService } from '@/services/activityLogService';
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

        // Create Activity Log
        const leaveTypeTH: Record<string, string> = {
            sick: 'ลาป่วย',
            personal: 'ลากิจ',
            vacation: 'ลาพักร้อน',
            other: 'ลาอื่นๆ'
        };
        const typeLabel = data.isPaid === false ? 'ลาโดยไม่รับเงินเดือน' : (leaveTypeTH[data.type] || data.type);

        await activityLogService.createActivityLog({
            employeeId: session.userId,
            employeeName: session.name,
            type: 'leave_requested',
            description: `ขอ${typeLabel} จำนวน ${data.days} วัน`,
            metadata: {
                leaveId: leaveRequest.id,
                leaveType: data.type,
                days: data.days,
                startDate: data.startDate,
                endDate: data.endDate,
                reason: data.reason
            }
        });

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error: any) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: `Error: ${error?.message || 'Internal server error'}` }, { status: 500 });
    }
}
